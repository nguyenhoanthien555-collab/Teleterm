import sys
import os
import json
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

prompt = """
Hãy phân tích kiến trúc kỹ thuật và lập lộ trình triển khai chi tiết cho hệ thống mặt nước và bờ biển phong cách anime điện ảnh (Makoto Shinkai / Genshin Impact) trên nền Three.js r128 (WebGL 2):

1. Toán học sóng Gerstner (Gerstner Wave) trong Vertex Shader:
   - Công thức vector x, y, z với bước sóng L, biên độ A, độ nhọn Q (choppy factor), hướng sóng D dạt bờ cát (trục Z).
   - Cách tính pháp tuyến giải tích (analytical normals) cho sóng Gerstner để ánh sáng mặt trời lấp lánh chính xác.
2. Shader độ sâu (Beer-Lambert Depth Gradient) trong Fragment Shader:
   - Cách đọc scene depth buffer và chuyển đổi sang linear depth.
   - Công thức pha trộn màu nước nông (Shallow Turquoise) và nước sâu (Deep Indigo).
3. Bọt sóng tiếp xúc bờ (Shoreline Contact Foam):
   - Tính chênh lệch độ sâu deltaZ = depthScene - depthWater.
   - Dùng procedural noise và hàm sin theo thời gian để tạo bọt sóng vỗ bờ dập dềnh.
4. Tối ưu hiệu năng 60 FPS:
   - Cách gom shader, giảm số lượng texture sampler, quản lý render pass độ sâu trong Three.js r128.
"""

BRIDGE_URL = "http://127.0.0.1:4981"
COMPLETIONS_URL = f"{BRIDGE_URL}/openai/v1/chat/completions"

data = json.dumps({
    "model": "gemini-4-argon",
    "messages": [
        {"role": "user", "content": prompt}
    ]
}).encode("utf-8")

req = urllib.request.Request(
    COMPLETIONS_URL,
    data=data,
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=120) as response:
        result = json.loads(response.read().decode("utf-8"))
        ans = result["choices"][0]["message"]["content"]
        with open("scratch/argon_water_approval.md", "w", encoding="utf-8") as f:
            f.write(ans)
        print("=== ARGON TECHNICAL SPECIFICATION ===")
        print(ans[:500] + "...\n[Full text saved to scratch/argon_water_approval.md]")
except Exception as e:
    print(f"Error querying Argon: {e}")
