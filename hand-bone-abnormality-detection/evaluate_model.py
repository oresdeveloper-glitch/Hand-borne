import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import os
from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

MODEL_PATH = os.path.join('saved_model', 'best_model.keras')
IMG_SIZE = 224
VALIDATION_DIR = os.path.join('Dataset', 'Validation')

CLASS_MAP = {
    'NORMAL': 0,
    'ABNORMAL': 1,
}


def preprocess_image(path, img_size=IMG_SIZE):
    img = Image.open(path).convert('RGB')
    img = img.resize((img_size, img_size))
    arr = np.array(img).astype('float32')
    arr = preprocess_input(arr)
    return arr


def collect_images(validation_dir=VALIDATION_DIR):
    X = []
    y = []
    paths = []
    for label_dir in os.listdir(validation_dir):
        dir_path = os.path.join(validation_dir, label_dir)
        if not os.path.isdir(dir_path):
            continue
        # Map folder names to expected labels
        target = CLASS_MAP.get(label_dir.upper(), None)
        if target is None:
            continue
        for fname in os.listdir(dir_path):
            if not fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                continue
            p = os.path.join(dir_path, fname)
            try:
                arr = preprocess_image(p)
                X.append(arr)
                y.append(target)
                paths.append(p)
            except Exception as e:
                print('Failed to read', p, e)
    if not X:
        raise RuntimeError('No validation images found in ' + validation_dir)
    return np.stack(X, axis=0), np.array(y), paths


def main():
    if not os.path.exists(MODEL_PATH):
        print('Model file not found at', MODEL_PATH)
        return
    print('Loading model', MODEL_PATH)
    model = load_model(MODEL_PATH)

    print('Collecting validation images...')
    X, y_true, paths = collect_images()
    print('Total validation samples:', len(y_true))

    preds = model.predict(X, batch_size=16)
    # Assume binary output in preds[:,0]
    y_prob = preds[:, 0]
    y_pred = (y_prob >= 0.5).astype(int)

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    cm = confusion_matrix(y_true, y_pred)

    print('\nResults:')
    print('Accuracy: {:.3f}'.format(acc))
    print('Precision: {:.3f}'.format(prec))
    print('Recall: {:.3f}'.format(rec))
    print('F1-score: {:.3f}'.format(f1))
    print('Confusion Matrix:\n', cm)

    # Show top errors
    errors = []
    for pth, yi, yp, prob in zip(paths, y_true, y_pred, y_prob):
        if yi != yp:
            errors.append((pth, yi, yp, prob))
    print('\nTotal errors:', len(errors))
    for e in errors[:10]:
        print(e)


if __name__ == '__main__':
    main()
