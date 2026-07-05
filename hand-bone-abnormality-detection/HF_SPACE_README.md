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
 - `requirements.txt` will be created from `requirements-space.txt` by the GitHub workflow before upload.
 - You have two options for making the model available to the Space:
	 1. Upload the model file to the repository at `saved_model/<filename>` (use Git LFS for large files).
	 2. Upload the model to the Hugging Face Hub (create a model repo) and set the following Space variables:
			- `MODEL_HUB_ID` = `username/model-repo` (the model repo id)
			- `MODEL_FILENAME` = `best_model.keras` (filename inside the model repo)
			- `HF_TOKEN` (token with read access) if the model is private.
		The GitHub Actions workflow can optionally upload the model to the Hub before publishing the Space. To enable that, set these repository variables:
			- `HF_MODEL_REPO` = `username/model-repo`
			- `HF_MODEL_FILENAME` = `best_model.keras` (optional)
 - Alternatively set `MODEL_PATH` to point to a local path inside the Space if you uploaded the file directly.
- `.github/workflows/huggingface-space.yml` - automatic deployment workflow
