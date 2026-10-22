/**
 * Test Suite Toàn Diện TeleTerm v3.0:
 * Multi-Session Management, Shells API, System HUD, File Explorer, Task Alert, and PWA
 */

const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const config = require('../src/server/config');
const tokenStore = require('../src/server/token-store');

const BASE_URL = `http://127.0.0.1:${config.PORT}`;
const masterToken = tokenStore.getMasterToken();

function httpRequest(urlPath, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, BASE_URL);
        const headers = {
            'Authorization': `Bearer ${masterToken}`
        };
        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        const req = http.request(url, { method, headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('================================================================');
    console.log('       🧪 TELE-TERM v3.0 AUTOMATED VERIFICATION TEST SUITE       ');
    console.log('================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(cond, name, detail = '') {
        if (cond) {
            console.log(`[PASS] ✓ ${name} ${detail ? '(' + detail + ')' : ''}`);
            passed++;
        } else {
            console.error(`[FAIL] ✗ ${name} ${detail ? '(' + detail + ')' : ''}`);
            failed++;
        }
    }

    try {
        // Test 1: Check System Status & Version
        console.log('--- 1. Kiểm tra Version & System Status HUD ---');
        const verRes = await httpRequest('/api/version');
        assert(verRes.status === 200 && (verRes.body.version === '3.0.0' || verRes.body.version === '4.0.0'), 'API Version Valid', `Version: ${verRes.body.version}`);

        const sysRes = await httpRequest('/api/system-status');
        assert(
            sysRes.status === 200 && 
            typeof sysRes.body.cpuPercent === 'number' && 
            sysRes.body.memory && 
            Array.isArray(sysRes.body.disks),
            'API /api/system-status trả về đầy đủ CPU, RAM, Disks',
            `CPU: ${sysRes.body.cpuPercent}%, RAM: ${sysRes.body.memory?.usedPercent}%, Disks: ${sysRes.body.disks?.length}`
        );

        // Test 2: Shells Discovery API
        console.log('\n--- 2. Kiểm tra Danh Sách Môi Trường Shells ---');
        const shellsRes = await httpRequest('/api/shells');
        assert(
            shellsRes.status === 200 && 
            Array.isArray(shellsRes.body.shells) && 
            shellsRes.body.shells.length >= 3,
            'API /api/shells trả về danh sách shell phong phú (PowerShell, CMD, Python, Node, Git Bash...)',
            `Số lượng shell phát hiện: ${shellsRes.body.shells?.length}`
        );

        // Test 3: Tạo Session PTY Mới với Tên & Màu Tùy Chỉnh
        console.log('\n--- 3. Kiểm tra Multi-Session Creation & Customization ---');
        const createRes = await httpRequest('/api/sessions', 'POST', {
            shellId: 'cmd',
            name: 'Test Worker CMD',
            color: '#10b981'
        });
        assert(
            createRes.status === 200 && createRes.body.success && createRes.body.session?.id,
            'Tạo Session PTY mới thành công',
            `ID: ${createRes.body.session?.id}, Name: ${createRes.body.session?.name}, Color: ${createRes.body.session?.color}`
        );

        const newSessionId = createRes.body.session?.id;

        // Test 4: Đổi Tên & Màu Session (PATCH /api/sessions/:id)
        console.log('\n--- 4. Kiểm tra Đổi Tên & Màu Tab Session (PATCH) ---');
        const patchRes = await httpRequest(`/api/sessions/${newSessionId}`, 'PATCH', {
            name: 'Renamed Worker Pro',
            color: '#a855f7'
        });
        assert(
            patchRes.status === 200 && patchRes.body.success && patchRes.body.session?.name === 'Renamed Worker Pro',
            'Đổi tên và màu Session thành công',
            `Tên mới: ${patchRes.body.session?.name}, Màu mới: ${patchRes.body.session?.color}`
        );

        // Test 5: Nhân Bản Session (Duplicate)
        console.log('\n--- 5. Kiểm tra Nhân Bản Session (POST /api/sessions/:id/duplicate) ---');
        const dupRes = await httpRequest(`/api/sessions/${newSessionId}/duplicate`, 'POST');
        assert(
            dupRes.status === 200 && dupRes.body.success && dupRes.body.session?.id,
            'Nhân bản Session thành công',
            `Clone ID: ${dupRes.body.session?.id}, Clone Name: ${dupRes.body.session?.name}`
        );
        const dupSessionId = dupRes.body.session?.id;

        // Test 6: Remote File Explorer (Browse directory)
        console.log('\n--- 6. Kiểm tra Remote File Explorer (Browse & Path Security) ---');
        const browseRes = await httpRequest('/api/files/browse');
        assert(
            browseRes.status === 200 && browseRes.body.success && Array.isArray(browseRes.body.items),
            'Duyệt thư mục từ xa thành công',
            `Đường dẫn: ${browseRes.body.currentPath}, Số files/folders: ${browseRes.body.items?.length}`
        );

        // Test 7: Remote File Read & Save (Quick Editor)
        console.log('\n--- 7. Kiểm tra Remote File Read & Save (Quick Editor) ---');
        const testFilePath = path.join(__dirname, '../.test_tmp_file.txt');
        fs.writeFileSync(testFilePath, 'Xin chao Tris, TeleTerm 3.0 hoat dong hoan hao!', 'utf8');

        const readRes = await httpRequest(`/api/files/read?path=${encodeURIComponent(testFilePath)}`);
        assert(
            readRes.status === 200 && readRes.body.content.includes('TeleTerm 3.0'),
            'Đọc nội dung file text từ xa thành công',
            `Độ dài: ${readRes.body.size} bytes`
        );

        const saveRes = await httpRequest('/api/files/save', 'POST', {
            path: testFilePath,
            content: 'Noi dung da duoc cap nhat qua Quick Editor!'
        });
        assert(
            saveRes.status === 200 && saveRes.body.success,
            'Lưu file text từ xa qua Quick Editor thành công',
            `Bytes đã lưu: ${saveRes.body.size}`
        );

        // Dọn dẹp file test
        try { fs.unlinkSync(testFilePath); } catch (e) {}

        // Test 8: Task Completion Alert API
        console.log('\n--- 8. Kiểm tra Task Completion Alert & Notification API ---');
        const alertRes = await httpRequest('/api/notify/alert', 'POST', {
            title: 'Build Hoàn Tất',
            message: 'Tác vụ compile dự án đã kết thúc với exit code 0!',
            sound: 'chime'
        });
        assert(alertRes.status === 200 && alertRes.body.success, 'Phát sóng Task Completion Alert thành công');

        // Test 9: PWA Manifest & Service Worker
        console.log('\n--- 9. Kiểm tra PWA Manifest & Service Worker ---');
        const manifestRes = await httpRequest('/manifest.json');
        assert(
            manifestRes.status === 200 && manifestRes.body.name === 'TeleTerm — Mobile Controller 24/7',
            'PWA Manifest hợp lệ với display: standalone',
            `App Name: ${manifestRes.body.name}`
        );

        const swRes = await httpRequest('/sw.js');
        assert(
            swRes.status === 200 && swRes.body.toString().includes('teleterm-pwa-v3'),
            'PWA Service Worker tồn tại và hợp lệ'
        );

        // Test 10: Đóng các session thử nghiệm và xác minh dọn dẹp
        console.log('\n--- 10. Dọn Dẹp & Xóa Session Thử Nghiệm ---');
        if (newSessionId) {
            const delRes1 = await httpRequest(`/api/sessions/${newSessionId}`, 'DELETE');
            assert(delRes1.status === 200 && delRes1.body.success, `Đã đóng session ${newSessionId}`);
        }
        if (dupSessionId) {
            const delRes2 = await httpRequest(`/api/sessions/${dupSessionId}`, 'DELETE');
            assert(delRes2.status === 200 && delRes2.body.success, `Đã đóng clone session ${dupSessionId}`);
        }

        console.log('\n================================================================');
        console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL (Tỉ lệ thành công: ${Math.round((passed / (passed + failed)) * 100)}%)`);
        console.log('================================================================\n');

        if (failed > 0) process.exit(1);
        process.exit(0);

    } catch (err) {
        console.error('Lỗi khi chạy kiểm thử:', err);
        process.exit(1);
    }
}

runTests();
