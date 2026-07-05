from pathlib import Path
import shutil
import sys

ROOT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = ROOT_DIR / "hand-bone-abnormality-detection"
TARGET_DIR = ROOT_DIR / "github_upload"

INCLUDE_FILES = [
    "README.md",
    "requirements.txt",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "netlify.toml",
    "vercel.json",
    "DEPLOYMENT.md",
    "run.py",
    "train.py",
    "train_new_models.py",
    "evaluate_model.py",
    "evaluate_models.py",
    "serve.py",
    "index.html",
    "vite.config.ts",
    ".env.example",
]

INCLUDE_DIRS = [
    "src",
    "tests",
    ".github",
]

IGNORE_DIRS = {
    "Dataset",
    "dist",
    "runs",
    "saved_model",
    "saved_model_test",
    "saved_model_yolo",
    "node_modules",
    "__pycache__",
}

GITIGNORE_CONTENT = """# Local environment files
.env
.env.local

# Python
__pycache__/
*.py[cod]

# Node
node_modules/

# Deployment artifacts and logs
*.log

# Large project artifacts
Dataset/
runs/
saved_model/
saved_model_test/
saved_model_yolo/
"""


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def copy_tree(src_dir: Path, dst_dir: Path) -> None:
    for item in src_dir.rglob("*"):
        relative = item.relative_to(src_dir)
        if item.is_dir():
            if relative.parts and relative.parts[0] in IGNORE_DIRS:
                continue
            continue

        if relative.parts and relative.parts[0] in IGNORE_DIRS:
            continue

        dst_path = dst_dir / relative
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, dst_path)


def main() -> int:
    if not PROJECT_DIR.exists():
        print(f"Project directory not found: {PROJECT_DIR}")
        return 1

    if TARGET_DIR.exists():
        print(f"Cleaning existing target folder: {TARGET_DIR}")
        shutil.rmtree(TARGET_DIR)

    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    copied = []
    skipped = []

    for file_name in INCLUDE_FILES:
        src = PROJECT_DIR / file_name
        if src.exists() and src.is_file():
            copy_file(src, TARGET_DIR / file_name)
            copied.append(file_name)
        else:
            skipped.append(file_name)

    for dir_name in INCLUDE_DIRS:
        src_dir = PROJECT_DIR / dir_name
        if src_dir.exists() and src_dir.is_dir():
            copy_tree(src_dir, TARGET_DIR / dir_name)
            copied.append(f"{dir_name}/")
        else:
            skipped.append(f"{dir_name}/")

    (TARGET_DIR / ".gitignore").write_text(GITIGNORE_CONTENT, encoding="utf-8")
    copied.append(".gitignore")

    print("\nGitHub upload preparation completed.")
    print(f"Target folder: {TARGET_DIR}")
    print("\nCopied items:")
    for item in copied:
        print(f" - {item}")

    if skipped:
        print("\nSkipped missing items:")
        for item in skipped:
            print(f" - {item}")

    print("\nNext step: review github_upload/, then push it to GitHub or use it to create a clean repo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
