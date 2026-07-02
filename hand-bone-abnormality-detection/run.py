import subprocess, time, sys

print("Starting HBA App...")
p = subprocess.Popen(
    ["npm.cmd", "run", "dev"],
    shell=True,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
)
time.sleep(0.5)
if p.poll() is None:
    print("Vite server started on http://localhost:5173")
    sys.stdout.flush()
    for line in p.stdout:
        print(line.decode(errors="replace"), end="")
else:
    print("Failed to start")
