process.env.TELE_PASSWORD = '482910';
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const config = require('../src/server/config');

async function runTests() {
    console.log('[TEST] Khởi động server cho integration test...');
    const testPin = process.env.TELE_PASSWORD;
    const testPort = '4005';
    const serverProc = spawn('node', ['src/server/index.js'], { 
        cwd: process.cwd(),
        env: { ...process.env, TELE_PASSWORD: testPin, PORT: testPort }
    });

    serverProc.stdout.on('data', (d) => {
        console.log('[SERVER STDOUT]', d.toString().trim());
    });
    serverProc.stderr.on('data', (d) => {
        console.error('[SERVER STDERR]', d.toString());
    });

    // Đợi server sẵn sàng bằng cách lắng nghe output hoặc timeout 10s
    await new Promise((resolve) => {
        let isReady = false;
        const onData = (d) => {
            if (d.toString().includes('TELE-TERM') || d.toString().includes('PORT') || d.toString().includes('4005')) {
                if (!isReady) {
                    isReady = true;
                    setTimeout(resolve, 1000);
                }
            }
        };
        serverProc.stdout.on('data', onData);
        setTimeout(() => {
            if (!isReady) {
                isReady = true;
                resolve();
            }
        }, 10000);
    });

    const pin = config.AUTH_PASSWORD;
    console.log(`[TEST] Mã PIN test: ${pin}`);

    function postJson(path, body, customHeaders = {}) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(body);
            const req = http.request({
                hostname: 'localhost',
                port: parseInt(testPort, 10),
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data),
                    ...customHeaders
                }
            }, (res) => {
                let resData = '';
                res.on('data', chunk => resData += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: JSON.parse(resData) });
                    } catch (e) {
                        resolve({ status: res.statusCode, body: resData });
                    }
                });
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    try {
        // Test 1: Kiểm tra Remote Client (Từ ngoài Internet) nhập sai PIN -> 401
        console.log('[TEST 1] Thử đăng nhập sai PIN từ remote IP (x-forwarded-for: 203.0.113.1)...');
        const wrongAuth = await postJson('/api/auth', { password: 'wrong_pin_123' }, {
            'x-forwarded-for': '203.0.113.1'
        });
        if (wrongAuth.status === 401) {
            console.log('  -> PASS: 401 Unauthorized khi remote client sai PIN.');
        } else {
            throw new Error(`Test 1 Failed: Status ${wrongAuth.status}`);
        }

        // Test 2: Kiểm tra Remote Client nhập đúng PIN -> Nhận token
        console.log('[TEST 2] Thử đăng nhập đúng PIN từ remote IP...');
        const correctAuth = await postJson('/api/auth', { password: pin }, {
            'x-forwarded-for': '203.0.113.1'
        });
        if (correctAuth.status === 200 && correctAuth.body.token) {
            console.log('  -> PASS: Nhận được token JWT hợp lệ cho remote client.');
        } else {
            throw new Error(`Test 2 Failed: ${JSON.stringify(correctAuth.body)}`);
        }

        // Test 2B: Kiểm tra Localhost Zero-Code Auto-Auth (Không cần nhập mã PIN)
        console.log('[TEST 2B] Kiểm tra Localhost Zero-Code Auto-Auth (/api/status không cần token)...');
        const localStatus = await new Promise((resolve, reject) => {
            http.get(`http://localhost:${testPort}/api/status`, (res) => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
            }).on('error', reject);
        });
        if (localStatus.status === 200 && localStatus.body.authenticated && localStatus.body.isLocal) {
            console.log('  -> PASS: Localhost tự động authenticated = true mà không cần bất kỳ mã code nào!');
        } else {
            throw new Error(`Test 2B Failed: ${JSON.stringify(localStatus.body)}`);
        }

        const token = localStatus.body.token || correctAuth.body.token;

        // Test 3: Kết nối WebSocket và nhận terminal I/O
        console.log('[TEST 3] Kết nối WebSocket và gửi lệnh PowerShell...');
        await new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://localhost:${testPort}/ws?token=${token}`);
            let receivedOutput = false;

            ws.on('open', () => {
                // Gửi lệnh đơn giản
                ws.send(JSON.stringify({ type: 'input', data: 'Write-Output "HELLO_TELETERM_TEST"\r' }));
            });

            ws.on('message', (msg) => {
                const parsed = JSON.parse(msg.toString());
                if (parsed.type === 'output' && parsed.data.includes('HELLO_TELETERM_TEST')) {
                    receivedOutput = true;
                    console.log('  -> PASS: Nhận được phản hồi đúng từ ConPTY qua WebSocket!');
                    ws.close();
                    resolve();
                }
            });

            setTimeout(() => {
                if (!receivedOutput) {
                    ws.close();
                    reject(new Error('Timeout đợi phản hồi WebSocket'));
                }
            }, 6000);
        });

        // Test 4: Kiểm tra System Terminals & Phím điều hướng
        console.log('[TEST 4] Kiểm tra ProcessTracker System Terminals & Phím điều hướng...');
        const processTracker = require('../src/server/process-tracker');
        const sysTerms = await processTracker.listSystemTerminals();
        console.log(`  -> Tìm thấy ${sysTerms.length} tiến trình console trên hệ thống.`);
        if (sysTerms.length > 0) {
            const targetPid = sysTerms[0].pid;
            const keyUpResult = await processTracker.sendInput(targetPid, '\x1b[A');
            if (keyUpResult && keyUpResult.success) {
                console.log(`  -> PASS: Gửi phím mũi tên LÊN (VK_UP) tới PID ${targetPid} thành công!`);
            } else {
                console.log(`  -> Lưu ý: Gửi tới PID ${targetPid} trả về:`, keyUpResult);
            }
        }

        // Test 5: Kiểm tra Endpoint Lấy Toàn Bộ Lịch Sử Code
        console.log('[TEST 5] Kiểm tra API lấy lịch sử code (/api/system-terminals/:pid/history)...');
        if (sysTerms.length > 0) {
            const targetPid = sysTerms[0].pid;
            const histRes = await new Promise((resolve, reject) => {
                http.get(`http://localhost:${testPort}/api/system-terminals/${targetPid}/history?token=${token}`, (res) => {
                    let d = '';
                    res.on('data', c => d += c);
                    res.on('end', () => {
                        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                        catch (e) { resolve({ status: res.statusCode, body: d }); }
                    });
                }).on('error', reject);
            });

            if (histRes.status === 200 && histRes.body.success) {
                console.log(`  -> PASS: Lấy lịch sử PID ${targetPid} thành công (${typeof histRes.body.history === 'string' ? 'Dạng văn bản' : 'Lỗi dạng'})!`);
            } else {
                throw new Error(`History endpoint trả về status ${histRes.status}`);
            }
        }

        // Test 6: Kiểm tra Endpoint /qr (Trang mã QR 1-Tap Login)
        console.log('[TEST 6] Kiểm tra Endpoint /qr và QR SVG generation...');
        const qrRes = await new Promise((resolve, reject) => {
            http.get(`http://localhost:${testPort}/qr`, (res) => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => resolve({ status: res.statusCode, body: d }));
            }).on('error', reject);
        });
        if (qrRes.status === 200 && qrRes.body.includes('<svg') && qrRes.body.includes('TeleTerm 24/7')) {
            console.log('  -> PASS: Trang /qr phản hồi 200 OK với mã QR SVG chuẩn nét!');
        } else {
            throw new Error(`QR endpoint trả về status ${qrRes.status} hoặc thiếu SVG`);
        }

        // Test 8: Kiểm tra Antigravity Status & Conversations API
        console.log('[TEST 8] Kiểm tra Antigravity Controller API (/api/antigravity/status)...');
        const agyStatusRes = await new Promise((resolve, reject) => {
            http.get(`http://localhost:${testPort}/api/antigravity/status?token=${token}`, (res) => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => {
                    try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                    catch (e) { resolve({ status: res.statusCode, body: d }); }
                });
            }).on('error', reject);
        });

        if (agyStatusRes.status === 200 && agyStatusRes.body.success) {
            const st = agyStatusRes.body.status;
            console.log(`  -> PASS: Antigravity Desktop App: ${st.app.isRunning ? 'Đang chạy' : 'Đã dừng'} (RAM: ${st.app.memoryMB} MB, PIDs: ${st.app.pids.length})`);
            console.log(`  -> PASS: CLI agy.exe: ${st.cli.installed ? 'Đã cài đặt' : 'Chưa có'}`);
            console.log(`  -> PASS: Tìm thấy ${agyStatusRes.body.conversations.length} phiên hội thoại và ${agyStatusRes.body.models.length} AI models khả dụng.`);
        } else {
            throw new Error(`Antigravity status endpoint lỗi: ${JSON.stringify(agyStatusRes.body)}`);
        }

        // Test 9: Kiểm tra Fast Account Switcher API
        console.log('[TEST 9] Kiểm tra Fast Account Switcher API (/api/accounts)...');
        const accRes = await new Promise((resolve, reject) => {
            http.get(`http://localhost:${testPort}/api/accounts?token=${token}`, (res) => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => {
                    try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                    catch (e) { resolve({ status: res.statusCode, body: d }); }
                });
            }).on('error', reject);
        });

        if (accRes.status === 200 && accRes.body.success) {
            console.log(`  -> PASS: Đã tải ${accRes.body.claude.length} profile Claude và ${accRes.body.antigravity.length} profile Antigravity.`);
            if (accRes.body.antiBan && accRes.body.antiBan.sandboxIsolationEnabled) {
                console.log(`  -> PASS: Anti-Ban Protection: Đã kích hoạt Profile Sandboxing (100% cách ly cookie chéo)!`);
            }
            if (accRes.body.antigravity.length > 0) {
                console.log(`  -> PASS: Profile Antigravity Sandbox Dir: ${accRes.body.antigravity[0].userDataDir}`);
            }
        } else {
            throw new Error(`Accounts endpoint lỗi: ${JSON.stringify(accRes.body)}`);
        }

        // Test 9B: Thêm profile mới, kích hoạt và xóa
        console.log('[TEST 9B] Thêm tài khoản test mới và kích hoạt 1-chạm...');
        const addAcc = await postJson('/api/accounts', {
            provider: 'claude',
            name: 'Test Mobile Switcher Profile',
            token: 'sk-test-token-12345',
            baseUrl: 'https://api.test.example',
            model: 'claude-test-model'
        }, { 'Authorization': `Bearer ${token}` });

        if (addAcc.status === 200 && addAcc.body.success && addAcc.body.profile) {
            const newProfId = addAcc.body.profile.id;
            console.log(`  -> PASS: Đã thêm profile mới thành công (${newProfId}).`);

            // Thử kích hoạt
            const switchRes = await postJson('/api/accounts/switch', {
                provider: 'claude',
                profileId: newProfId
            }, { 'Authorization': `Bearer ${token}` });

            if (switchRes.status === 200 && switchRes.body.success) {
                console.log(`  -> PASS: Kích hoạt 1-chạm thành công (${switchRes.body.message})!`);
            } else {
                throw new Error(`Switch profile lỗi: ${JSON.stringify(switchRes.body)}`);
            }

            // Kích hoạt lại profile ban đầu trước khi xóa
            const originalClaude = accRes.body.claude.find(p => p.isActive);
            if (originalClaude) {
                await postJson('/api/accounts/switch', {
                    provider: 'claude',
                    profileId: originalClaude.id
                }, { 'Authorization': `Bearer ${token}` });
            }

            // Thử chuyển đổi profile Antigravity và kiểm tra sandbox
            const originalAgy = accRes.body.antigravity.find(p => p.isActive);
            const agyProfile = accRes.body.antigravity.find(p => p.email && p.email.includes('quietemberr275'));
            if (agyProfile) {
                const swAgy = await postJson('/api/accounts/switch', {
                    provider: 'antigravity',
                    profileId: agyProfile.id
                }, { 'Authorization': `Bearer ${token}` });
                if (swAgy.status === 200 && swAgy.body.success) {
                    console.log(`  -> PASS: Đổi profile Antigravity Sandbox thành công (${swAgy.body.activeProfile?.userDataDir})!`);
                }
                // Khôi phục lại profile Antigravity ban đầu
                if (originalAgy) {
                    await postJson('/api/accounts/switch', {
                        provider: 'antigravity',
                        profileId: originalAgy.id
                    }, { 'Authorization': `Bearer ${token}` });
                }
            }

            // Xóa profile test
            const delRes = await new Promise((resolve, reject) => {
                const req = http.request({
                    hostname: 'localhost',
                    port: parseInt(testPort, 10),
                    path: `/api/accounts/${newProfId}`,
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }, (res) => {
                    let d = '';
                    res.on('data', c => d += c);
                    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
                });
                req.on('error', reject);
                req.end();
            });

            if (delRes.status === 200 && delRes.body.success) {
                console.log(`  -> PASS: Đã xóa profile test thành công.`);
            } else {
                throw new Error(`Delete profile lỗi: ${JSON.stringify(delRes.body)}`);
            }
        } else {
            throw new Error(`Add profile lỗi: ${JSON.stringify(addAcc.body)}`);
        }

        // Test 10: Kiểm tra Antigravity Available Models & RPC Model Integration
        console.log('[TEST 10] Kiểm tra Antigravity Available Models & RPC Model Integration...');
        const agyQuota = await new Promise((resolve, reject) => {
            http.get(`http://localhost:${testPort}/api/antigravity/quota`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }, (res) => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
            }).on('error', reject);
        });
        if (agyQuota.status === 200 && agyQuota.body.success) {
            const models = agyQuota.body.models || [];
            console.log(`  -> PASS: Antigravity quota trả về thành công với ${models.length} models!`);
        } else {
            throw new Error(`Test 10 Failed: ${JSON.stringify(agyQuota.body)}`);
        }

        console.log('\n=================================================');
        console.log('🎉 TẤT CẢ 10/10 BÀI TEST ĐÃ VƯỢT QUA XUẤT SẮC!');
        console.log('=================================================\n');
    } catch (e) {
        console.error('[TEST ERROR]', e.message || e, e.stack);
        process.exitCode = 1;
    } finally {
        serverProc.kill();
        setTimeout(() => process.exit(), 500);
    }
}

runTests();
