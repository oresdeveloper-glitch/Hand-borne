#!/usr/bin/env python3
"""
Simple script to run model training
"""
import os
import subprocess
import sys

# Change to the project directory
project_dir = r"c:\Users\LETFIX\Downloads\hand-bone-abnormality-detection (2)\hand-bone-abnormality-detection"
os.chdir(project_dir)

# Run the training script
cmd = [
    sys.executable,
    "train.py",
    "--train-all",
    "--epochs", "30",
    "--batch-size", "16",
    "--img-size", "224"
]

print(f"Running: {' '.join(cmd)}")
print(f"In directory: {os.getcwd()}")
print(f"Python: {sys.executable}")
print("")

result = subprocess.run(cmd, check=False)
sys.exit(result.returncode)
