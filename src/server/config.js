const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const userDataDir = process.env.TELETERM_USER_DATA_PATH;
const envPath = userDataDir ? path.join(userDataDir, '.env') : path.join(__dirname, '../../.env');

// Tự động tạo file .env cố định nếu chưa có (để giữ nguyên PIN và Secret sau mỗi lần khởi động)
if (!fs.existsSync(envPath)) {
    try {
        if (userDataDir && !fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        const initialPin = Math.floor(100000 + Math.random() * 900000).toString();
        const initialJwt = crypto.randomBytes(32).toString('hex');
        const initialTopic = 'teleterm-' + crypto.randomBytes(4).toString('hex');
        const envContent = [
            `# TeleTerm Cấu Hình Vận Hành Bền Vững 24/7`,
            `PORT=4000`,
            `HOST=0.0.0.0`,
            `TELE_PASSWORD=${initialPin}`,
            `JWT_SECRET=${initialJwt}`,
            `NTFY_TOPIC=${initialTopic}`,
            `# CLOUDFLARE_TUNNEL_TOKEN= (Điền token nếu bạn có Cloudflare Named Tunnel cố định)`
        ].join('\n');
        fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (e) {
        // Read-only or asar fallback: do not crash process
    }
}

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    const fallbackEnv = path.join(__dirname, '../../.env');
    if (fs.existsSync(fallbackEnv)) {
        require('dotenv').config({ path: fallbackEnv });
    }
}

// Phát hiện các shell có sẵn trên máy
function detectAvailableShells() {
    const shells = [];

    // Hỗ trợ môi trường Linux / Cloud VPS / Docker
    if (process.platform !== 'win32') {
        const bashPath = process.env.SHELL || '/bin/bash';
        if (fs.existsSync(bashPath)) {
            shells.push({ id: 'bash', name: '🐧 Bash', path: bashPath, args: [] });
        } else if (fs.existsSync('/bin/sh')) {
            shells.push({ id: 'sh', name: '🐧 Shell (sh)', path: '/bin/sh', args: [] });
        }
        if (fs.existsSync('/bin/zsh')) {
            shells.push({ id: 'zsh', name: '⚡ Zsh', path: '/bin/zsh', args: [] });
        }
        shells.push({ id: 'python', name: '🐍 Python Interactive REPL', path: 'python3', args: ['-i'] });
        shells.push({ id: 'node', name: '🟩 Node.js REPL', path: process.execPath || 'node', args: [] });
        return shells;
    }

    // 1. PowerShell 7 (pwsh.exe) nếu có
    const pwshPaths = [
        'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
        path.join(os.homedir(), 'AppData\\Local\\Microsoft\\WindowsApps\\pwsh.exe')
    ];
    for (const p of pwshPaths) {
        if (fs.existsSync(p)) {
            shells.push({ id: 'pwsh', name: 'PowerShell 7', path: p, args: [] });
            break;
        }
    }

    // 2. Windows PowerShell mặc định
    shells.push({
        id: 'powershell',
        name: 'Windows PowerShell',
        path: 'powershell.exe',
        args: ['-NoLogo']
    });

    // 3. Command Prompt
    shells.push({
        id: 'cmd',
        name: 'Command Prompt (CMD)',
        path: 'cmd.exe',
        args: []
    });

    // 4. WSL nếu có
    const wslPath = 'C:\\Windows\\System32\\wsl.exe';
    if (fs.existsSync(wslPath)) {
        shells.push({
            id: 'wsl',
            name: 'WSL (Linux)',
            path: wslPath,
            args: []
        });
    }

    // 5. Git Bash nếu có
    const gitBashPaths = [
        'C:\\Program Files\\Git\\bin\\bash.exe',
        'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
        path.join(os.homedir(), 'AppData\\Local\\Programs\\Git\\bin\\bash.exe')
    ];
    for (const gp of gitBashPaths) {
        if (fs.existsSync(gp)) {
            shells.push({
                id: 'gitbash',
                name: '🌿 Git Bash',
                path: gp,
                args: ['--login', '-i']
            });
            break;
        }
    }

    // 6. Python Interactive REPL
    const pythonPaths = [
        'C:\\Users\\Hoan Thien\\AppData\\Local\\Programs\\Python\\Python313\\python.exe',
        path.join(os.homedir(), 'AppData\\Local\\Programs\\Python\\Python312\\python.exe'),
        path.join(os.homedir(), 'AppData\\Local\\Programs\\Python\\Python311\\python.exe'),
        'python.exe'
    ];
    for (const py of pythonPaths) {
        if (py === 'python.exe' || fs.existsSync(py)) {
            shells.push({
                id: 'python',
                name: '🐍 Python Interactive REPL',
                path: py,
                args: ['-i']
            });
            break;
        }
    }

    // 7. Node.js Interactive REPL
    shells.push({
        id: 'node',
        name: '🟩 Node.js REPL',
        path: process.execPath || 'node.exe',
        args: []
    });

    // Antigravity CLI (agy.exe) nếu có
    const agyCliPath = path.join(os.homedir(), '.gemini', 'bin', 'agy.exe');
    if (fs.existsSync(agyCliPath)) {
        shells.push({
            id: 'agy',
            name: '🛸 Antigravity Agent (agy)',
            path: agyCliPath,
            args: ['-c'] // Mặc định tiếp tục phiên làm việc gần nhất
        });
        shells.push({
            id: 'agy-new',
            name: '🛸 Antigravity New Task',
            path: agyCliPath,
            args: []
        });
    }

    // Claude Code CLI
    shells.push({
        id: 'claude',
        name: '🟣 Claude Code',
        path: 'powershell.exe',
        args: ['-NoLogo', '-NoExit', '-Command', 'claude']
    });

    return shells;
}

// Sinh mã PIN ngẫu nhiên 6 chữ số nếu không có trong ENV
const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
const authPassword = process.env.TELE_PASSWORD || generatedPin;
const isGeneratedPassword = !process.env.TELE_PASSWORD;

module.exports = {
    PORT: parseInt(process.env.PORT || '4000', 10),
    HOST: process.env.HOST || '0.0.0.0',
    AUTH_PASSWORD: authPassword,
    IS_GENERATED_PASSWORD: isGeneratedPassword,
    JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
    BUFFER_SIZE: parseInt(process.env.BUFFER_SIZE || '5000', 10),
    DEFAULT_COLS: 80,
    DEFAULT_ROWS: 24,
    AVAILABLE_SHELLS: detectAvailableShells(),
    NTFY_TOPIC: process.env.NTFY_TOPIC || 'teleterm-default',
    CLOUDFLARE_TUNNEL_TOKEN: process.env.CLOUDFLARE_TUNNEL_TOKEN || '',
    // 100% Passwordless mode: Không bắt buộc mật khẩu, quét mã hoặc bấm link là vào thẳng
    AUTO_AUTH_LOCAL: true,
    REQUIRE_AUTH: false
};
