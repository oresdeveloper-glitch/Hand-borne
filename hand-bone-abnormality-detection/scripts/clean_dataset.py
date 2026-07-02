import os
import shutil
from PIL import Image


ROOT = os.path.join(os.getcwd(), "Dataset")
CORRUPT_DIR = os.path.join(ROOT, "corrupt")


def is_image_readable(path: str) -> bool:
    try:
        with Image.open(path) as im:
            im.convert("RGB")
            im.load()
        return True
    except Exception:
        return False


def main():
    moved = 0
    os.makedirs(CORRUPT_DIR, exist_ok=True)
    for split in ("Training", "Validation", "Testing"):
        split_dir = os.path.join(ROOT, split)
        if not os.path.isdir(split_dir):
            continue
        for class_name in os.listdir(split_dir):
            class_dir = os.path.join(split_dir, class_name)
            if not os.path.isdir(class_dir):
                continue
            target_dir = os.path.join(CORRUPT_DIR, split, class_name)
            for fname in os.listdir(class_dir):
                if not fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                    continue
                src = os.path.join(class_dir, fname)
                if not os.path.isfile(src):
                    continue
                if not is_image_readable(src):
                    os.makedirs(target_dir, exist_ok=True)
                    dst = os.path.join(target_dir, fname)
                    shutil.move(src, dst)
                    print(f"Moved corrupt image: {src} -> {dst}")
                    moved += 1

    print(f"Done. Moved {moved} corrupt images to {CORRUPT_DIR}")


if __name__ == "__main__":
    main()
