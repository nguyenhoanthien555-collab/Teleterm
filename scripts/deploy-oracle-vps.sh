#!/bin/bash
# ==============================================================================
# TeleTerm 24/24 Always-Free Cloud VPS Deployer
# Tự động cài đặt và triển khai TeleTerm trên Oracle Cloud Always Free VPS / Linux
# ==============================================================================

set -e

# Màu sắc hiển thị
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "  _______   _    _______                     "
echo " |__   __| | |  |__   __|                    "
echo "    | | ___| | ___ | | ___ _ __ _ __ ___     "
echo "    | |/ _ \ |/ _ \| |/ _ \ '__| '_ \` _ \    "
echo "    | |  __/ |  __/| |  __/ |  | | | | | |   "
echo "    |_|\___|_|\___||_|\___|_|  |_| |_| |_|   "
echo "   🚀 24/7 Always-Free Cloud VPS Deployer    "
echo -e "${NC}"

# 1. Kiểm tra quyền root / sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}[!] Vui lòng chạy script với quyền sudo: sudo bash $0${NC}"
    exit 1
fi

echo -e "${GREEN}[1/6] Đang cập nhật hệ thống và cài đặt gói phụ trợ...${NC}"
apt-get update -y
apt-get install -y curl git ca-certificates iptables ufw

# 2. Cài đặt Docker & Docker Compose nếu chưa có
echo -e "${GREEN}[2/6] Kiểm tra Docker & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${CYAN}Docker chưa được cài đặt. Đang tiến hành cài đặt Docker Engine chính thức...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# 3. Mở cổng Firewall trên Oracle Cloud Ubuntu
echo -e "${GREEN}[3/6] Cấu hình tường lửa cho cổng 4000...${NC}"
# Oracle Cloud Ubuntu image thường có iptables DROP INPUT mặc định
if iptables -L INPUT -n | grep -q "DROP"; then
    echo -e "${CYAN}Đang mở cổng 4000 trên iptables...${NC}"
    iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT || true
    netfilter-persistent save 2>/dev/null || true
fi

if command -v ufw &> /dev/null; then
    ufw allow 4000/tcp comment 'TeleTerm Port' || true
fi

# 4. Tải hoặc cập nhật mã nguồn TeleTerm
APP_DIR="/opt/teleterm"
echo -e "${GREEN}[4/6] Chuẩn bị mã nguồn TeleTerm tại ${APP_DIR}...${NC}"

if [ -d "$APP_DIR/.git" ]; then
    echo -e "${CYAN}Thư mục đã tồn tại. Đang kéo bản cập nhật mới nhất từ GitHub...${NC}"
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    echo -e "${CYAN}Đang clone repository từ GitHub...${NC}"
    rm -rf "$APP_DIR"
    git clone https://github.com/nguyenhoanthien555-collab/Teleterm.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 5. Cấu hình file .env bảo mật nếu chưa có
echo -e "${GREEN}[5/6] Kiểm tra cấu hình bảo mật .env...${NC}"
mkdir -p "$APP_DIR/data"

if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${CYAN}Đang khởi tạo mã PIN bảo mật ngẫu nhiên...${NC}"
    PIN=$(shuf -i 100000-999999 -n 1)
    JWT=$(head -c 32 /dev/urandom | xxd -p)
    TOPIC="teleterm-$(head -c 4 /dev/urandom | xxd -p)"

    cat <<EOF > "$APP_DIR/.env"
# TeleTerm 24/7 Always-Free Configuration
PORT=4000
HOST=0.0.0.0
TELE_PASSWORD=${PIN}
JWT_SECRET=${JWT}
NTFY_TOPIC=${TOPIC}
NODE_ENV=production
TELETERM_USER_DATA_PATH=/app/data
# CLOUDFLARE_TUNNEL_TOKEN=
EOF
    echo -e "${GREEN}Đã tạo file .env thành công với PIN bí mật: ${BOLD}${PIN}${NC}"
fi

# 6. Build và khởi chạy Docker Container
echo -e "${GREEN}[6/6] Đang build và khởi chạy TeleTerm 24/24 với Docker Compose...${NC}"
docker compose down --remove-orphans 2>/dev/null || true
docker compose build
docker compose up -d

echo -e "${CYAN}Đang đợi server khởi động và kết nối Cloudflare Tunnel... (10s)${NC}"
sleep 10

# Lấy địa chỉ IP Public của VPS
VPS_IP=$(curl -s -4 https://ifconfig.me || curl -s -4 https://api.ipify.org || echo "YOUR_VPS_IP")
PIN_VALUE=$(grep -E '^TELE_PASSWORD=' "$APP_DIR/.env" | cut -d '=' -f2)

# Lấy URL Cloudflare Tunnel từ log container nếu có
CF_URL=$(docker compose logs teleterm-server 2>&1 | grep -oE "https://[a-zA-Z0-9-]+\.trycloudflare\.com" | tail -n 1 || true)

echo ""
echo -e "${GREEN}${BOLD}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}  🎉 TELETERM ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG VÀ ĐANG CHẠY 24/24!${NC}"
echo -e "${GREEN}${BOLD}==============================================================================${NC}"
echo ""
echo -e "🔑 ${BOLD}MÃ PIN ĐĂNG NHẬP:${NC} ${YELLOW}${BOLD}${PIN_VALUE}${NC}"
echo ""
echo -e "🌐 ${BOLD}ĐỊA CHỈ TRUY CẬP TỪ XA:${NC}"
if [ -n "$CF_URL" ]; then
    echo -e "   👉 ${CYAN}${BOLD}Cloudflare Tunnel (Khuyên dùng trên 4G/5G, có HTTPS):${NC}"
    echo -e "      ${BOLD}${CF_URL}${NC}"
fi
echo -e "   👉 ${CYAN}${BOLD}Truy cập trực tiếp qua IP VPS:${NC}"
echo -e "      http://${VPS_IP}:4000"
echo ""
echo -e "🛠️  ${BOLD}LỆNH QUẢN LÝ TIỆN ÍCH:${NC}"
echo -e "   • Xem log trực tiếp:      ${CYAN}cd /opt/teleterm && docker compose logs -f${NC}"
echo -e "   • Khởi động lại server:   ${CYAN}cd /opt/teleterm && docker compose restart${NC}"
echo -e "   • Dừng server:            ${CYAN}cd /opt/teleterm && docker compose down${NC}"
echo -e "   • Cập nhật code mới nhất: ${CYAN}cd /opt/teleterm && git pull && docker compose up -d --build${NC}"
echo ""
echo -e "${GREEN}${BOLD}Server tự động khởi động cùng hệ điều hành (restart: always) 24/7!${NC}"
echo -e "${GREEN}${BOLD}==============================================================================${NC}"
