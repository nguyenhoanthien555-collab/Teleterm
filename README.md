# ⚡ TeleTerm — Mobile Remote Terminal Controller for Windows

**TeleTerm** cho phép bạn truy cập, giám sát và điều khiển toàn bộ các terminal (PowerShell, CMD, WSL, Claude Code, Aider, Python scripts...) trên laptop Windows từ điện thoại ở bất kỳ đâu qua Internet — không cần mở port router, không bị ngắt tiến trình khi mất mạng (Session Persistence) và có bàn phím ảo tối ưu cho mobile.

---

## 🎯 Điểm Nổi Bật

1. **Điều khiển từ xa không giới hạn khoảng cách**: Tự động tạo đường hầm an toàn qua Cloudflare Tunnel (`https://*.trycloudflare.com`) kèm mã QR in thẳng lên màn hình laptop để điện thoại quét phát ăn ngay.
2. **Session Persistence (chạy ngầm như tmux)**: Khi di chuyển ngoài đường hoặc rớt mạng 4G, tiến trình (Claude Code, train AI, script...) vẫn tiếp tục chạy độc lập trên laptop. Kết nối lại sẽ tự động re-stream toàn bộ lịch sử terminal.
3. **Mobile Touch Bar tối ưu**: 
   - Hàng phím tiện ích: `ESC`, `TAB`, `Ctrl+C`, `Ctrl+Z`, `↑`, `↓`, `←`, `→`, `ENTER`.
   - Phím phản hồi nhanh: `y` (confirm lệnh), `n` (hủy).
   - Hộp nhập liệu riêng: Hỗ trợ gõ lệnh dài và gõ tiếng Việt mượt mà không bị xung đột với bộ gõ mobile.
4. **Hỗ trợ đa terminal**: Quản lý nhiều phiên cùng lúc (PowerShell 7, Windows PowerShell, CMD, WSL).
5. **Bảo mật tuyệt đối (Anti-RCE)**: Yêu cầu mã PIN / Mật khẩu xác thực + Rate-limiting chống dò mật khẩu + Token xác thực WebSocket.

---

## 🚀 Hướng Dẫn Sử Dụng

### Cách 1: Khởi động nhanh (Khuyên dùng)
Nhấp đúp chuột vào file `start.bat`.

### Cách 2: Chạy bằng dòng lệnh
```powershell
cd "C:\Users\Hoan Thien\tele-term"
npm start
```

Màn hình console sẽ in ra:
- **MÃ PIN ĐĂNG NHẬP** (ví dụ: `482910`).
- **URL TRUY CẬP TỪ XA** (`https://xyz.trycloudflare.com` hoặc IP nội bộ WiFi).
- **MÃ QR CODE**: Mở camera điện thoại lên quét là vào được ngay.


---

## ⚙️ Cấu Hình Tùy Chỉnh (File `.env`)

Tạo file `.env` cạnh `package.json` (tham khảo `.env.example`):
```env
# Cổng chạy local (mặc định 4000)
PORT=4000

# Mật khẩu cố định của bạn (nếu không đặt, mỗi lần mở app sẽ sinh mã PIN 6 số ngẫu nhiên)
TELE_PASSWORD=matkhau_cua_ban_123
```

---

## 💡 Mẹo sử dụng với Claude Code từ xa

1. Khi bạn đang cho Claude Code thực hiện một task dài (ví dụ: refactor code, tạo tính năng lớn), bạn có thể gập nửa màn hình laptop hoặc để máy ở nhà.
2. Mở điện thoại vào link TeleTerm.
3. Khi Claude dừng lại hỏi `Do you want to proceed? (y/n)`, chỉ cần chạm nhẹ vào nút **`y`** trên thanh Touch Bar ở đáy màn hình điện thoại.
4. Nếu muốn hủy lệnh hoặc dừng agent khẩn cấp, chạm nút **`Ctrl+C`**.
