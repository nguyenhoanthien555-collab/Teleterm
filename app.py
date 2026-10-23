import os
import sys
import subprocess
import shutil
import threading
import time
import asyncio
import spaces
from fastapi import FastAPI, APIRouter
import gradio as gr
import httpx
from starlette.requests import Request
from starlette.responses import Response, RedirectResponse, HTMLResponse
from starlette.websockets import WebSocket, WebSocketDisconnect
import websockets

NODE_PORT = 3000
NODE_HOST = "127.0.0.1"
NODE_BASE_URL = f"http://{NODE_HOST}:{NODE_PORT}"
NODE_WS_URL = f"ws://{NODE_HOST}:{NODE_PORT}"

# Official GitHub Release for TeleTerm Windows Desktop Installer (145MB)
INSTALLER_URL = "https://github.com/nguyenhoanthien555-collab/Teleterm/releases/download/v1.0.0/TeleTerm.Setup.exe"

# Background thread: prepare and launch TeleTerm Node.js server
def start_teleterm():
    time.sleep(1)
    print("==================================================")
    print("  Initializing TeleTerm Cloud Multiplayer Server")
    print("==================================================")
    
    app_dir = "/app" if os.path.exists("/app/src") else os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.join(app_dir, "Teleterm")
    
    # Clone or sync TeleTerm repository
    if not os.path.exists(os.path.join(repo_dir, "package.json")):
        print("[TeleTerm] Cloning official repository...")
        subprocess.run(["git", "clone", "https://github.com/nguyenhoanthien555-collab/Teleterm.git", repo_dir])
    else:
        print("[TeleTerm] Pulling latest repository updates...")
        subprocess.run(["git", "pull", "origin", "main"], cwd=repo_dir)
    
    work_dir = repo_dir if os.path.exists(os.path.join(repo_dir, "package.json")) else app_dir
    
    # Ensure core Node dependencies are installed
    if not os.path.exists(os.path.join(work_dir, "node_modules", "express")):
        print("[TeleTerm] Installing core dependencies (express, ws, qrcode)...")
        subprocess.run(["npm", "install", "express@^4.19.2", "ws@^8.18.0", "qrcode@^1.5.3", "qrcode-terminal@^0.12.0", "dotenv@^16.4.5", "--no-audit", "--no-fund"], cwd=work_dir)
    
    node_bin = shutil.which("node") or "/usr/local/bin/node" or "/usr/bin/node"
    server_script = os.path.join(work_dir, "src", "server", "index.js")
    
    if not os.path.exists(server_script):
        print(f"[TeleTerm] Server script not found at {server_script}, checking fallback...")
        server_script = os.path.join(app_dir, "src", "server", "index.js")
        work_dir = app_dir
        
    print(f"[TeleTerm] Launching Node.js from {work_dir} on port {NODE_PORT}...")
    env = os.environ.copy()
    env["PORT"] = str(NODE_PORT)
    env["HOST"] = NODE_HOST
    env["NODE_ENV"] = "production"
    subprocess.run([node_bin, server_script], env=env, cwd=work_dir)

threading.Thread(target=start_teleterm, daemon=True).start()

# ZeroGPU requirement: registered function decorated with @spaces.GPU
@spaces.GPU
def server_ping(message):
    return f"TeleTerm Cloud MMO Active | ZeroGPU Engine Online | Echo: {message}"

# Define custom routes in APIRouter to prepend before Gradio catch-all
custom_router = APIRouter()

@custom_router.get("/download")
async def download_installer():
    return RedirectResponse(url=INSTALLER_URL)

@custom_router.get("/game")
async def serve_game(request: Request):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=30.0) as client:
        try:
            resp = await client.get("/")
            html = resp.text
            if "<head>" in html:
                html = html.replace("<head>", '<head><base href="/game/">')
            return HTMLResponse(content=html, status_code=resp.status_code, media_type="text/html; charset=utf-8")
        except Exception as e:
            return HTMLResponse(f"<h3>TeleTerm Server Starting... Please wait ({e})</h3>", status_code=503)

@custom_router.get("/game/{path:path}")
async def proxy_game_subpaths(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=30.0) as client:
        try:
            resp = await client.get(f"/{path}")
            content_type = resp.headers.get("content-type", "application/octet-stream")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception as e:
            return Response(str(e), status_code=502)

@custom_router.get("/app.js")
async def get_app_js():
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get("/app.js")
            return Response(content=resp.content, status_code=resp.status_code, media_type="application/javascript")
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/style.css")
async def get_style_css():
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get("/style.css")
            return Response(content=resp.content, status_code=resp.status_code, media_type="text/css")
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/manifest.json")
async def get_manifest():
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get("/manifest.json")
            return Response(content=resp.content, status_code=resp.status_code, media_type="application/json")
        except Exception:
            return Response("{}", status_code=404)

@custom_router.get("/js/{path:path}")
async def get_js_assets(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get(f"/js/{path}")
            content_type = resp.headers.get("content-type", "application/javascript")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/css/{path:path}")
async def get_css_assets(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get(f"/css/{path}")
            content_type = resp.headers.get("content-type", "text/css")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/vendor/{path:path}")
async def get_vendor_assets(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get(f"/vendor/{path}")
            content_type = resp.headers.get("content-type", "application/octet-stream")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/models/{path:path}")
async def get_models(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get(f"/models/{path}")
            content_type = resp.headers.get("content-type", "application/octet-stream")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/textures/{path:path}")
async def get_textures(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get(f"/textures/{path}")
            content_type = resp.headers.get("content-type", "application/octet-stream")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception:
            return Response("", status_code=404)

@custom_router.get("/audio/{path:path}")
async def get_audio(path: str):
    async with httpx.AsyncClient(base_url=NODE_BASE_URL, timeout=15.0) as client:
        try:
            resp = await client.get(f"/audio/{path}")
            content_type = resp.headers.get("content-type", "audio/mpeg")
            return Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        except Exception:
            return Response("", status_code=404)

# Real-time Multiplayer WebSocket Proxy
@custom_router.websocket("/ws/world")
async def websocket_world(client_ws: WebSocket):
    await client_ws.accept()
    try:
        async with websockets.connect(f"{NODE_WS_URL}/ws/world", ping_interval=20, ping_timeout=20) as node_ws:
            async def client_to_node():
                try:
                    while True:
                        data = await client_ws.receive_text()
                        await node_ws.send(data)
                except Exception:
                    pass
            
            async def node_to_client():
                try:
                    async for msg in node_ws:
                        await client_ws.send_text(msg)
                except Exception:
                    pass
            
            await asyncio.gather(client_to_node(), node_to_client())
    except Exception as e:
        print(f"[WS Bridge] Connection closed: {e}")
    finally:
        try:
            await client_ws.close()
        except Exception:
            pass

# Monkey-patch Gradio's App.create_app to prepend custom_router
orig_create_app = gr.routes.App.create_app

def patched_create_app(*args, **kwargs):
    app = orig_create_app(*args, **kwargs)
    app.router.routes = custom_router.routes + app.router.routes
    return app

gr.routes.App.create_app = patched_create_app

# Custom CSS for seamless AAA 3D MMO display inside Gradio
custom_css = """
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

.gradio-container {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #06080f !important;
    color: #e2e8f0 !important;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
    min-height: 100vh !important;
    display: flex !important;
    flex-direction: column !important;
}

.header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 24px;
    background: rgba(11, 15, 25, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
}

.header-brand {
    display: flex;
    align-items: center;
    gap: 14px;
}

.brand-glyph {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.brand-glyph svg {
    width: 100%;
    height: 100%;
}

.brand-title {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #f8fafc;
    text-transform: uppercase;
}

.brand-mmo-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 9999px;
    background: rgba(0, 240, 255, 0.12);
    color: #00f0ff;
    border: 1px solid rgba(0, 240, 255, 0.3);
    letter-spacing: 0.04em;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.25);
}

.pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-download {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    color: #00f0ff !important;
    background: rgba(0, 240, 255, 0.12);
    border: 1px solid rgba(0, 240, 255, 0.45);
    text-decoration: none !important;
    cursor: pointer;
    box-shadow: 0 0 16px rgba(0, 240, 255, 0.2);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-download:hover {
    background: #00f0ff;
    color: #040711 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 240, 255, 0.5);
}

.btn-fullscreen {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    color: #cbd5e1 !important;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    text-decoration: none !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-fullscreen:hover {
    color: #f8fafc !important;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
}

.game-frame-container {
    width: 100%;
    height: calc(100vh - 58px);
    min-height: 640px;
    background: #000;
    position: relative;
    flex: 1;
}

.game-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}

.zerogpu-panel {
    display: none !important;
}
"""

with gr.Blocks(title="TeleTerm Cyberdeck 3D MMO", css=custom_css, theme=gr.themes.Default()) as demo:
    gr.HTML(f"""
    <div class="header-bar">
        <div class="header-brand">
            <span class="brand-glyph" aria-label="TeleTerm Brand">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="tt-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#00f0ff"/>
                            <stop offset="100%" stop-color="#8b5cf6"/>
                        </linearGradient>
                    </defs>
                    <path d="M 5 7.5 L 11 12.5 L 5 17.5" stroke="url(#tt-brand-grad)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M 13 17.5 L 19 17.5" stroke="url(#tt-brand-grad)" stroke-width="2.6" stroke-linecap="round"/>
                    <path d="M 16 4.5 C 16 6.3 17.2 7.5 19 7.5 C 17.2 7.5 16 8.7 16 10.5 C 16 8.7 14.8 7.5 13 7.5 C 14.8 7.5 16 6.3 16 4.5 Z" fill="url(#tt-brand-grad)"/>
                </svg>
            </span>
            <span class="brand-title">TeleTerm</span>
            <span class="brand-mmo-tag">3D MMO Studio</span>
            <span class="status-pill">
                <span class="pulse-dot"></span>
                <span>CLOUD MULTIPLAYER LIVE</span>
            </span>
        </div>
        <div class="header-actions">
            <a href="{INSTALLER_URL}" class="btn-download" target="_blank" rel="noopener noreferrer" title="Tải File Cài Đặt TeleTerm cho Windows (145MB .exe)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Tải Game PC (Windows · 145MB)</span>
            </a>
            <a href="/game" class="btn-fullscreen" target="_blank" title="Mở Trực Tiếp Toàn Màn Hình">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
                <span>Toàn Màn Hình</span>
            </a>
        </div>
    </div>
    <div class="game-frame-container">
        <iframe src="/game" class="game-iframe" allow="autoplay; fullscreen; clipboard-read; clipboard-write; microphone; camera;"></iframe>
    </div>
    """)
    
    with gr.Row(elem_classes=["zerogpu-panel"]):
        input_text = gr.Textbox(value="ping", label="ZeroGPU Engine Status Check", scale=3)
        output_text = gr.Textbox(label="Result", scale=3)
        verify_btn = gr.Button("⚡ Verify ZeroGPU Engine", variant="primary")
        verify_btn.click(fn=server_ping, inputs=input_text, outputs=output_text)

if __name__ == "__main__":
    demo.queue().launch(server_name="0.0.0.0", server_port=7860, ssr_mode=False)
