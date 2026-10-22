/**
 * Test Suite for TeleTerm v4.6 Killer Features:
 * 1. 1-Tap Quick Claude Terminal Launcher
 * 2. Bi-directional Clipboard Sync
 * 3. Smart Process Watchdog
 * 4. Context-Aware Command Palette & Macro Chips
 */

const http = require('http');

const PORT = 4000;
const TOKEN = '346e2be7d80c891fa9706d521a494d4f0697d67f0b11a790733896f1f2765aa2';
const PIN = '284530';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'x-access-token': TOKEN,
        'x-pin': PIN,
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting TeleTerm v4.6 Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Health / Status Check
  try {
    const res = await request('GET', '/api/status');
    if (res.status === 200 && (res.data.success || res.data.online)) {
      console.log('✅ TEST 1: Server Status OK (Port 4000, Platform:', res.data.platform, ')');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 1 EXCEPTION:', err.message);
    failed++;
  }

  // Test 2: 1-Tap Quick Claude Terminal Creation
  let claudeSessionId = null;
  try {
    const res = await request('POST', '/api/sessions/quick-claude');
    if (res.status === 200 && res.data.success && res.data.session) {
      claudeSessionId = res.data.session.id;
      console.log(`✅ TEST 2: 1-Tap Quick Claude Terminal Spawned Successfully (ID: ${claudeSessionId}, Title: ${res.data.session.title}, Icon: ${res.data.session.icon})`);
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 2 EXCEPTION:', err.message);
    failed++;
  }

  // Test 3: Context-Aware Command Palette & Macro Chips
  try {
    if (claudeSessionId) {
      const res = await request('GET', `/api/sessions/${claudeSessionId}/context-chips`);
      if (res.status === 200 && res.data.success && Array.isArray(res.data.chips)) {
        console.log(`✅ TEST 3: Context Chips Detected (${res.data.chips.length} chips found in cwd):`);
        res.data.chips.forEach(c => console.log(`   - [${c.icon}] ${c.label} -> \`${c.cmd}\``));
        passed++;
      } else {
        console.error('❌ TEST 3 FAILED:', res);
        failed++;
      }
    }
  } catch (err) {
    console.error('❌ TEST 3 EXCEPTION:', err.message);
    failed++;
  }

  // Test 4: Windows Clipboard Sync (Set & Get)
  try {
    const testSecret = `TeleTerm-Sync-Test-${Date.now()}`;
    const setRes = await request('POST', '/api/clipboard', { text: testSecret });
    if (setRes.status === 200 && setRes.data.success) {
      const getRes = await request('GET', '/api/clipboard');
      if (getRes.status === 200 && getRes.data.success && getRes.data.text.trim() === testSecret) {
        console.log(`✅ TEST 4: Bi-directional Clipboard Sync Verified (Set -> Get matched: "${testSecret}")`);
        passed++;
      } else {
        console.error('❌ TEST 4 FAILED: Readback mismatch:', getRes);
        failed++;
      }
    } else {
      console.error('❌ TEST 4 FAILED to set clipboard:', setRes);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 4 EXCEPTION:', err.message);
    failed++;
  }

  // Test 5: Smart Process Watchdog Arming
  try {
    if (claudeSessionId) {
      const res = await request('POST', `/api/sessions/${claudeSessionId}/watchdog`, { command: 'claude' });
      if (res.status === 200 && res.data.success && res.data.armed) {
        console.log(`✅ TEST 5: Smart Process Watchdog Armed Successfully on session ${claudeSessionId}`);
        passed++;
      } else {
        console.error('❌ TEST 5 FAILED:', res);
        failed++;
      }
    }
  } catch (err) {
    console.error('❌ TEST 5 EXCEPTION:', err.message);
    failed++;
  }

  // Cleanup: Close the test session
  if (claudeSessionId) {
    try {
      await request('DELETE', `/api/sessions/${claudeSessionId}`);
      console.log(`🧹 Cleaned up test session ${claudeSessionId}`);
    } catch (e) {
      // ignore
    }
  }

  console.log(`\n================================`);
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
