/**
 * TeleTerm v4.0 - Automated Test Suite: The True Remote Terminal
 * Tests:
 * 1. Version 4.0.0 check
 * 2. Smart File Dropper / Upload to CWD API
 * 3. Session CWD configuration
 * 4. Process Tree Inspector (Task Manager API)
 * 5. Emergency Process Kill API
 * 6. WebSocket Mosh Resilience: sync_queue & queue_ack
 * 7. Clean up test artifacts
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:4000';
const MASTER_PIN = '284530';

let authToken = '';
let testSessionId = '';
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ✓ ${message}`);
        passed++;
    } else {
        console.error(`[FAIL] ✕ ${message}`);
        failed++;
    }
}

async function runTests() {
    console.log('================================================================');
    console.log('       🧪 TELE-TERM v4.0 TRUE REMOTE TERMINAL TEST SUITE        ');
    console.log('================================================================\n');

    // 1. Version Check
    console.log('--- 1. Kiểm tra API Version v4.0.0 ---');
    try {
        const res = await fetch(`${BASE_URL}/api/version`);
        const data = await res.json();
        assert(data.success && data.version === '4.0.0', `API Version 4.0.0 hoạt động chính xác (Version: ${data.version})`);
    } catch (e) {
        assert(false, `Lỗi kiểm tra version: ${e.message}`);
    }

    // 2. Auth via PIN to get token
    console.log('\n--- 2. Xác thực và Lấy Token Bảo Mật ---');
    try {
        const res = await fetch(`${BASE_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: MASTER_PIN })
        });
        const data = await res.json();
        authToken = data.token;
        assert(data.success && authToken, `Đăng nhập thành công, nhận token: ${authToken ? authToken.substring(0, 16) + '...' : ''}`);
    } catch (e) {
        assert(false, `Lỗi xác thực: ${e.message}`);
    }

    // 3. Create Session for testing
    console.log('\n--- 3. Khởi tạo Test Session PTY ---');
    try {
        const res = await fetch(`${BASE_URL}/api/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: 'V4 Test Worker',
                shellId: 'cmd',
                cwd: 'E:\\Terminal control'
            })
        });
        const data = await res.json();
        testSessionId = data.session.id;
        assert(data.success && testSessionId, `Đã tạo session PTY (ID: ${testSessionId}, Shell: ${data.session.shellName})`);
    } catch (e) {
        assert(false, `Lỗi tạo session: ${e.message}`);
    }

    // 4. Test File Upload to CWD
    console.log('\n--- 4. Kiểm tra Smart File Dropper / Upload to CWD API ---');
    const testFileName = `test_upload_v4_${Date.now()}.txt`;
    const testContent = 'TeleTerm v4.0 True Remote Terminal upload test string!';
    const testBase64 = Buffer.from(testContent).toString('base64');
    try {
        const res = await fetch(`${BASE_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                filename: testFileName,
                base64Data: testBase64,
                sessionId: testSessionId
            })
        });
        const data = await res.json();
        assert(data.success && data.filename === testFileName, `API /api/files/upload phản hồi thành công (File: ${data.filename})`);

        const createdFilePath = path.join('E:\\Terminal control', testFileName);
        const fileExists = fs.existsSync(createdFilePath);
        assert(fileExists, `File đã được ghi thành công vào thư mục máy tính: ${createdFilePath}`);

        if (fileExists) {
            const readBack = fs.readFileSync(createdFilePath, 'utf8');
            assert(readBack === testContent, `Nội dung file tải lên trùng khớp hoàn hảo (Size: ${data.size} bytes)`);
            fs.unlinkSync(createdFilePath); // dọn dẹp file test
        }
    } catch (e) {
        assert(false, `Lỗi test upload: ${e.message}`);
    }

    // 5. Test Process Tree Inspector API
    console.log('\n--- 5. Kiểm tra Cây Tiến Trình Con (Process Inspector / Task Manager) ---');
    try {
        const res = await fetch(`${BASE_URL}/api/sessions/${encodeURIComponent(testSessionId)}/processes`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        assert(data.success && data.rootPid, `API /api/sessions/:id/processes trả về cây tiến trình (Root PID: ${data.rootPid})`);
        assert(Array.isArray(data.processes) && data.processes.length > 0, `Danh sách tiến trình con hợp lệ (Số lượng tiến trình: ${data.processes.length})`);
    } catch (e) {
        assert(false, `Lỗi kiểm tra processes: ${e.message}`);
    }

    // 6. Test Emergency Force Kill API
    console.log('\n--- 6. Kiểm tra Emergency Force Kill API ---');
    try {
        // Spawn a temporary sleep process to kill
        const { spawn } = require('child_process');
        const dummyProc = spawn('powershell.exe', ['-NoProfile', '-Command', 'Start-Sleep 60'], { detached: false });
        const dummyPid = dummyProc.pid;

        // Đợi 300ms cho process spawn
        await new Promise(r => setTimeout(r, 300));

        const killRes = await fetch(`${BASE_URL}/api/sessions/${encodeURIComponent(testSessionId)}/processes/${dummyPid}/kill`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const killData = await killRes.json();
        assert(killData.success, `API /api/sessions/:id/processes/:pid/kill ép tắt PID ${dummyPid} thành công`);
    } catch (e) {
        assert(false, `Lỗi kiểm tra force kill: ${e.message}`);
    }

    // 7. Test WebSocket Mosh Resilience: sync_queue & queue_ack
    console.log('\n--- 7. Kiểm tra Mosh-Grade Network Resilience (sync_queue & queue_ack) ---');
    await new Promise((resolve) => {
        const wsUrl = `ws://localhost:4000/ws?token=${encodeURIComponent(authToken)}&sessionId=${encodeURIComponent(testSessionId)}`;
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
            // Giả lập sau khi rớt mạng, client gửi dồn 3 lệnh từ outboxQueue
            const mockQueue = [
                { type: 'input', data: 'echo "cmd 1"\r' },
                { type: 'input', data: 'echo "cmd 2"\r' },
                { type: 'input', data: 'echo "cmd 3"\r' }
            ];
            ws.send(JSON.stringify({ type: 'sync_queue', queue: mockQueue }));
        });

        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.type === 'queue_ack') {
                    assert(msg.processed === 3, `WebSocket trả về queue_ack xác nhận xử lý đủ ${msg.processed}/3 lệnh ngoại tuyến`);
                    ws.close();
                    resolve();
                }
            } catch (err) {}
        });

        setTimeout(() => {
            ws.close();
            resolve();
        }, 3000);
    });

    // 8. Clean up test session
    console.log('\n--- 8. Dọn Dẹp Session Thử Nghiệm ---');
    try {
        const res = await fetch(`${BASE_URL}/api/sessions/${encodeURIComponent(testSessionId)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        assert(data.success, `Đã đóng session thử nghiệm ${testSessionId}`);
    } catch (e) {
        assert(false, `Lỗi đóng session: ${e.message}`);
    }

    console.log('\n================================================================');
    console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL (Tỉ lệ thành công: ${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
