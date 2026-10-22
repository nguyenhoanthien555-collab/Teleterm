import sys
import os
import json
import urllib.request
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

prompt = """You are Gemini 4 Argon / Gemini Principal Engine Architect.
Please provide a comprehensive technical architectural blueprint to optimize a Three.js (r128) WebGL2 3D open-world game (TeleTerm 3D) to achieve 120 FPS (8.33ms frame budget) on a modern PC, while strictly preserving high anime aesthetic fidelity (no reduction in visual beauty, keeping soft lighting, sakura petals, anime shaders, and atmospheric depth).

Also advise on the anime avatar face rig:
The user reported: 'cái môi nó cao quá, đem nó về chỗ cũ đi' (the mouth line is positioned too high up on the face, right under the nose, creating an unnatural chin/mouth proportion due to previous morph target overrides).
How should the morph targets (Fcl_MTH_Close, Fcl_MTH_Fun, Fcl_MTH_Joy, vowels A/I/U/E/O) in the face rig be configured at resting posture so that the mouth stays closed naturally at its original sculpted anatomical coordinates without being pulled upward?

Structure your advice into 5 pillars:
1. Anime Face Rig & Mouth Anatomical Position Restoration: Morph target calibration, why Fcl_MTH_Close/Fun displaced the mouth upward, and exact resting values.
2. WebGL2 Render Pipeline, Draw Call Batching & GPU Instancing (targeting 120 FPS / 8.33ms frame budget): Reducing 448 shadow casters, static matrixAutoUpdate disabling, texture/geometry sharing.
3. Shadow Map Optimization & Frustum / Occlusion Culling: Disabling shadow casting on micro-meshes (hair accessories, eyeballs, small interior props), culling offscreen chunks.
4. CPU Bottlenecks, Animation Retargeting & Secondary Motion (Zero-GC Vector Pooling): Distance-based tick throttling for NPCs (>15m, >30m), Float32Array/reusable vector pooling.
5. Post-Processing Pass Efficiency (Bloom, Tone Mapping) & DPR Calibration: Native 1.0 DPR vs 1.25 supersampling, half-resolution Bloom pass buffer, maintaining 120 FPS throughput.

Provide concrete mathematical invariants, Three.js r128 code structures, and optimization formulas."""

data = json.dumps({
    'model': 'gemini-3.8-flash',
    'messages': [
        {'role': 'user', 'content': prompt}
    ]
}).encode('utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:4981/openai/v1/chat/completions',
    data=data,
    headers={'Content-Type': 'application/json'}
)

print("Sending technical prompt to Gemini bridge (gemini-3.8-flash)...")
t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=60) as res:
        out = json.loads(res.read().decode('utf-8'))
        ans = out['choices'][0]['message']['content']
        elapsed = time.time() - t0
        print(f"Success in {elapsed:.1f}s! Saved response to argon_optimization_advice.md")
        with open('argon_optimization_advice.md', 'w', encoding='utf-8') as f:
            f.write(ans)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
