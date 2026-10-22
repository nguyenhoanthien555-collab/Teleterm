import os
import sys
import subprocess
import shutil
import urllib.request
import tarfile

print("==================================================")
print("[TeleTerm] Cloud Server Starting on Hugging Face")
print("==================================================")

NODE_VERSION = "v20.18.0"
NODE_DIST = f"node-{NODE_VERSION}-linux-x64"
NODE_URL = f"https://nodejs.org/dist/{NODE_VERSION}/{NODE_DIST}.tar.xz"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NODE_DIR = os.path.join(BASE_DIR, ".node_runtime")

def ensure_node():
    # Check if node already installed on the system
    try:
        ver = subprocess.check_output(["node", "--version"], text=True).strip()
        print(f"[OK] System Node.js found: {ver}")
        return "node", "npm"
    except Exception:
        pass

    # If not found or broken, ensure local standalone node binary
    node_bin = os.path.join(NODE_DIR, NODE_DIST, "bin", "node")
    npm_bin = os.path.join(NODE_DIR, NODE_DIST, "bin", "npm")
    
    if not os.path.exists(node_bin):
        print(f"[Setup] Downloading standalone Node.js {NODE_VERSION} for Linux x64...")
        os.makedirs(NODE_DIR, exist_ok=True)
        archive_path = os.path.join(NODE_DIR, "node.tar.xz")
        
        req = urllib.request.Request(
            NODE_URL,
            headers={"User-Agent": "TeleTerm-HuggingFace-Setup/1.0"}
        )
        with urllib.request.urlopen(req) as resp, open(archive_path, "wb") as f:
            shutil.copyfileobj(resp, f)
            
        print("[Setup] Extracting Node.js runtime...")
        subprocess.run(["tar", "-xf", archive_path, "-C", NODE_DIR], check=True)
        if os.path.exists(archive_path):
            os.remove(archive_path)

    os.environ["PATH"] = os.path.join(NODE_DIR, NODE_DIST, "bin") + os.pathsep + os.environ.get("PATH", "")
    return node_bin, npm_bin

def main():
    node_cmd, npm_cmd = ensure_node()
    
    # Check node modules
    node_modules = os.path.join(BASE_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("[Setup] Installing TeleTerm production dependencies...")
        subprocess.run([npm_cmd, "install", "--omit=dev"], cwd=BASE_DIR, check=True)

    # Port configuration for Hugging Face Spaces (default 7860)
    port = os.environ.get("PORT", "7860")
    host = os.environ.get("HOST", "0.0.0.0")

    env = os.environ.copy()
    env["PORT"] = str(port)
    env["HOST"] = str(host)
    env["NODE_ENV"] = "production"

    server_script = os.path.join(BASE_DIR, "src", "server", "index.js")
    print(f"[TeleTerm] Launching Server on {host}:{port}...")
    sys.stdout.flush()

    # Run the server and stream logs
    proc = subprocess.Popen([node_cmd, server_script], cwd=BASE_DIR, env=env)
    proc.wait()

if __name__ == "__main__":
    main()
