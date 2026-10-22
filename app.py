import os
import sys
import subprocess
import shutil
import time

print("==================================================")
print("[TeleTerm] Cloud Server Initializing on Hugging Face")
print("==================================================")
sys.stdout.flush()

REPO_URL = "https://github.com/nguyenhoanthien555-collab/Teleterm.git"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, "app_code")

# 1. Clone repository
if not os.path.exists(os.path.join(APP_DIR, "src", "server", "index.js")):
    print(f"[TeleTerm] Cloning repository from {REPO_URL}...")
    sys.stdout.flush()
    if os.path.exists(APP_DIR):
        shutil.rmtree(APP_DIR, ignore_errors=True)
    subprocess.run(["git", "clone", "--depth", "1", REPO_URL, APP_DIR], check=True)
else:
    print("[TeleTerm] Repository already cached.")
sys.stdout.flush()

# 2. Install dependencies
print("[TeleTerm] Running npm install --omit=dev...")
sys.stdout.flush()
subprocess.run(["npm", "install", "--omit=dev"], cwd=APP_DIR, check=True)

# 3. Environment variables
port = os.environ.get("PORT", "7860")
host = "0.0.0.0"

env = os.environ.copy()
env["PORT"] = str(port)
env["HOST"] = str(host)
env["NODE_ENV"] = "production"

server_script = os.path.join(APP_DIR, "src", "server", "index.js")
print(f"[TeleTerm] Executing: node {server_script} on port {port}...")
sys.stdout.flush()

node_bin = shutil.which("node") or "node"
os.execvpe(node_bin, [node_bin, server_script], env)
