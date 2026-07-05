import os
from typing import Tuple

import gradio as gr
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = os.environ.get("MODEL_PATH", "saved_model/best_model.keras")


def load_model() -> tf.keras.Model:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. Upload the trained model to this path before deploying."
        )
    return tf.keras.models.load_model(MODEL_PATH, compile=False)


MODEL = load_model()


def predict(image: Image.Image) -> Tuple[str, str]:
    if image is None:
        return "Please upload an X-ray image.", ""

    img = image.convert("RGB").resize((224, 224))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)

    prediction = MODEL.predict(arr, verbose=0)[0]
    probs = np.asarray(prediction).reshape(-1)

    if probs.size == 0:
        return "Unable to read prediction output.", ""

    confidence = float(probs[0]) if probs.size == 1 else float(np.max(probs))
    label = "Abnormal" if confidence >= 0.5 else "Normal"

    return (
        f"Prediction: {label}\nConfidence: {confidence:.2f}",
        f"Model: {os.path.basename(MODEL_PATH)}",
    )


iface = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil", label="Upload X-ray image"),
    outputs=[
        gr.Textbox(label="Result"),
        gr.Textbox(label="Model Info"),
    ],
    title="Hand Bone Abnormality Detector",
    description="Upload a hand X-ray image to get a quick abnormality prediction from the trained model.",
    allow_flagging="never",
)


if __name__ == "__main__":
    iface.launch()
