# Hugging Face Spaces deployment

## Quick setup

1. Create a Hugging Face account and a new Space with SDK = Gradio.
2. Add a GitHub secret named `HF_TOKEN` with a write token from Hugging Face.
3. In the repository variables (Settings → Security → Variables), add `HF_SPACE_REPO` with value `ORRESYDEVELOPER11/ROZETH`.
4. Push to the `main` branch to trigger deployment.

## Files used

- `app.py` - Gradio app entry point
- `requirements-space.txt` - Python dependencies for the Space
 - `requirements-space.txt` - Python dependencies for the Space
 - Set `MODEL_PATH` env var to the chosen model path (e.g., `saved_model/best_model.keras`) in the Space settings.
- `.github/workflows/huggingface-space.yml` - automatic deployment workflow
