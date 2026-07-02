import argparse
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.vgg16 import preprocess_input as vgg16_preprocess

MODEL_DIR = Path("saved_model")
VALIDATION_DIR = Path("Dataset") / "Validation"
IMG_SIZE = 224
CLASS_MAP = {"NORMAL": 0, "ABNORMAL": 1}

PREPROCESS_MAP = {
    "mobilenetv2": mobilenet_preprocess,
    "resnet50": resnet_preprocess,
    "densenet169": densenet_preprocess,
    "efficientnetb0": efficientnet_preprocess,
    "vgg16": vgg16_preprocess,
}

YOLO_AVAILABLE = False
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    pass


def detect_vit_support():
    try:
        import vit_keras  # noqa: F401
        return True
    except ImportError:
        return False


def evaluate_yolov8_model(model_path: Path, validation_dir: Path, conf_threshold: float = 0.25):
    """
    Evaluate a YOLOv8 detection model.
    
    Note: For full evaluation, the validation dataset should have bounding box annotations (YOLO format).
    This function will report detection results but requires annotated data for meaningful confusion matrices.
    """
    if not YOLO_AVAILABLE:
        raise RuntimeError("YOLOv8 (ultralytics) is not installed. Cannot evaluate YOLOv8 model.")
    
    if not model_path.exists():
        raise FileNotFoundError(f"YOLOv8 model not found: {model_path}")
    
    print(f"\nEvaluating YOLOv8 model: {model_path.name}")
    model = YOLO(str(model_path))
    
    results = []
    image_count = 0
    detections_by_class = {}
    
    for label_dir in sorted(validation_dir.iterdir()):
        if not label_dir.is_dir():
            continue
        label = label_dir.name.upper()
        if label not in CLASS_MAP:
            continue
        
        for image_path in sorted(label_dir.iterdir()):
            if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            
            try:
                result = model.predict(source=str(image_path), conf=conf_threshold, verbose=False)
                image_count += 1
                
                detection_info = {
                    "image": str(image_path),
                    "true_class": label,
                    "detections": len(result[0].boxes) if result and len(result) > 0 else 0,
                }
                results.append(detection_info)
                
                if label not in detections_by_class:
                    detections_by_class[label] = {"total": 0, "detected": 0}
                detections_by_class[label]["total"] += 1
                if detection_info["detections"] > 0:
                    detections_by_class[label]["detected"] += 1
            except Exception as exc:
                print(f"Skipping {image_path}: {exc}")
    
    summary = {
        "model_path": str(model_path),
        "model_type": "YOLOv8",
        "sample_count": image_count,
        "confidence_threshold": conf_threshold,
        "total_detections": sum(r["detections"] for r in results),
        "images_with_detections": sum(1 for r in results if r["detections"] > 0),
        "detection_rate": float(sum(1 for r in results if r["detections"] > 0)) / max(1, image_count),
        "detections_by_class": detections_by_class,
        "note": "YOLOv8 detection results. For confusion matrix evaluation, bounding box ground truth annotations are required.",
    }
    
    return summary


def model_name_to_backbone(model_name: str) -> str | None:
    lower = model_name.lower()
    if "resnet" in lower:
        return "resnet50"
    if "mobilenet" in lower:
        return "mobilenetv2"
    if "densenet" in lower:
        return "densenet169"
    if "efficientnet" in lower:
        return "efficientnetb0"
    if "vgg" in lower:
        return "vgg16"
    if "vit" in lower:
        return "vit"
    return None


def preprocess_image(path: Path, preprocess_fn, img_size: int = IMG_SIZE) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    image = image.resize((img_size, img_size))
    arr = np.array(image, dtype=np.float32)
    return preprocess_fn(arr)


def collect_validation_data(validation_dir: Path, preprocess_fn, img_size: int = IMG_SIZE):
    X = []
    y = []
    paths = []
    if not validation_dir.exists():
        raise FileNotFoundError(f"Validation directory not found: {validation_dir}")

    for label_dir in sorted(validation_dir.iterdir()):
        if not label_dir.is_dir():
            continue
        label = label_dir.name.upper()
        if label not in CLASS_MAP:
            continue
        target = CLASS_MAP[label]
        for image_path in sorted(label_dir.iterdir()):
            if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            try:
                X.append(preprocess_image(image_path, preprocess_fn, img_size=img_size))
                y.append(target)
                paths.append(str(image_path))
            except Exception as exc:
                print(f"Skipping {image_path}: {exc}")

    if len(X) == 0:
        raise RuntimeError(f"No validation images found in {validation_dir}")

    return np.stack(X), np.array(y), paths


def evaluate_classification_model(
    model_path: Path,
    backbone: str,
    validation_dir: Path,
    batch_size: int = 16,
    threshold: float = 0.5,
):
    if backbone not in PREPROCESS_MAP:
        raise ValueError(f"Unsupported classification backbone for evaluation: {backbone}")

    preprocess_fn = PREPROCESS_MAP[backbone]
    X, y_true, paths = collect_validation_data(validation_dir, preprocess_fn)

    print(f"\nEvaluating {model_path.name} using {backbone} preprocessing")
    model = load_model(model_path)
    preds = model.predict(X, batch_size=batch_size)
    if preds.ndim == 2 and preds.shape[1] == 1:
        y_prob = preds[:, 0]
    elif preds.ndim == 1:
        y_prob = preds
    else:
        raise ValueError(f"Unexpected model output shape: {preds.shape}")

    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)

    # Per-image prediction rows (so you can inspect confusion-matrix errors)
    predictions = []
    for image_path, yi, pi, prob in zip(paths, y_true, y_pred, y_prob):
        predictions.append(
            {
                "image_path": image_path,
                "true_label": int(yi),
                "predicted_label": int(pi),
                "prob_abnormal": float(prob),
                "threshold": float(threshold),
            }
        )

    return {
        "model_path": str(model_path),
        "backbone": backbone,
        "sample_count": int(len(y_true)),
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
        "confusion_matrix": cm.tolist(),
        "true_negative": int(cm[0, 0]),
        "false_positive": int(cm[0, 1]),
        "false_negative": int(cm[1, 0]),
        "true_positive": int(cm[1, 1]),
        "predictions": predictions,
    }



def main():
    parser = argparse.ArgumentParser(description="Evaluate saved classification and detection models and produce confusion matrix metrics.")
    parser.add_argument(
        "--model-dir",
        default=str(MODEL_DIR),
        help="Directory containing saved .keras model files.",
    )
    parser.add_argument(
        "--validation-dir",
        default=str(VALIDATION_DIR),
        help="Validation dataset directory.",
    )
    parser.add_argument(
        "--output",
        default=str(MODEL_DIR / "evaluation_summary.json"),
        help="JSON file where evaluation results should be written.",
    )
    parser.add_argument(
        "--models",
        nargs="*",
        default=None,
        help="Optional list of model filenames to evaluate. If omitted, all .keras files in the model directory are evaluated.",
    )
    parser.add_argument(
        "--yolo-model",
        default=None,
        help="Optional path to a YOLOv8 model file (.pt) for detection evaluation.",
    )
    parser.add_argument("--batch-size", type=int, default=16, help="Prediction batch size for classification models.")
    parser.add_argument(
        "--yolo-conf",
        type=float,
        default=0.25,
        help="Confidence threshold for YOLOv8 detections.",
    )

    args = parser.parse_args()
    model_dir = Path(args.model_dir)
    validation_dir = Path(args.validation_dir)
    output_path = Path(args.output)

    available_files = sorted([f for f in model_dir.iterdir() if f.is_file() and f.suffix == ".keras"])
    if args.models:
        selected = [model_dir / m for m in args.models]
    else:
        selected = available_files

    results = []
    seen = set()
    for model_path in selected:
        if not model_path.exists():
            print(f"Model file not found: {model_path}")
            continue
        if model_path in seen:
            continue
        seen.add(model_path)
        backbone = model_name_to_backbone(model_path.name)
        if backbone is None:
            print(f"Could not infer backbone for model file: {model_path.name}. Skipping.")
            continue
        if backbone == "vit":
            print(f"ViT evaluation requested for {model_path.name}, but no ViT model support is implemented yet.")
            continue
        try:
            result = evaluate_classification_model(model_path, backbone, validation_dir, batch_size=args.batch_size, threshold=0.5)
            results.append(result)
            print(json.dumps(result, indent=2))
        except Exception as exc:
            print(f"Failed to evaluate {model_path.name}: {exc}")

    # YOLOv8 evaluation
    if args.yolo_model:
        yolo_path = Path(args.yolo_model)
        if not yolo_path.exists():
            print(f"YOLOv8 model not found: {yolo_path}")
        else:
            try:
                yolo_result = evaluate_yolov8_model(yolo_path, validation_dir, conf_threshold=args.yolo_conf)
                results.append(yolo_result)
                print(json.dumps(yolo_result, indent=2))
            except Exception as exc:
                print(f"Failed to evaluate YOLOv8 model {args.yolo_model}: {exc}")
    elif YOLO_AVAILABLE:
        print("\nYOLOv8 support is installed. To evaluate a YOLOv8 model, use --yolo-model <path_to_model.pt>")

    if results:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"\nSaved evaluation summary to {output_path}")
    else:
        print("No evaluation results produced.")

    if detect_vit_support():
        print("ViT support is available in the environment, but no ViT saved model file was evaluated.")
    else:
        print("ViT support is not installed (vit_keras missing).")

    if not YOLO_AVAILABLE:
        print("YOLOv8 support is not installed (ultralytics missing).")


if __name__ == "__main__":
    main()
