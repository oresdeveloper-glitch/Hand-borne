from pathlib import Path
import tensorflow as tf
import traceback

model_path = Path('saved_model') / 'best_model_resnet50.keras'
print('exists', model_path.exists(), 'size', model_path.stat().st_size)
try:
    m = tf.keras.models.load_model(model_path)
    print('loaded', type(m), 'output shape', m.output_shape)
except Exception:
    traceback.print_exc()
