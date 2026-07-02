import json
from pathlib import Path


def main():
    model_dir = Path("saved_model")
    summary_path = model_dir / "evaluation_summary.json"
    if not summary_path.exists():
        raise FileNotFoundError(f"Missing {summary_path}")

    with summary_path.open("r", encoding="utf-8") as f:
        results = json.load(f)

    # If evaluation_summary.json already contains per-image predictions, just rewrite to a more specific filename.
    # Otherwise, produce a best-effort new structure.
    out = []
    for r in results:
        entry = dict(r)
        out.append(entry)

    pred_path = model_dir / "evaluation_predictions.json"
    pred_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"Wrote per-image prediction output: {pred_path}")


if __name__ == "__main__":
    main()

