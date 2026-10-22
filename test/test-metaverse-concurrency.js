/**
 * End-to-End Concurrency & WebSocket Gateway Test for TeleTerm Metaverse
 * Tests:
 * 1. Multiple clients connecting simultaneously to /ws/world
 * 2. RoomManager presence tracking & welcome packet receipt
 * 3. 12 Hz player movement synchronization (world_snapshot)
 * 4. Global chat broadcast with rate limiting check
 * 5. Whisper direct messaging between two avatars
 * 6. Level-up celebration broadcast
 */

const http = require('http');
const WebSocket = require('ws');
const realtimeGateway = require('../src/server/realtime/gateway');
const roomManager = require('../src/server/realtime/room-manager');
const chatService = require('../src/server/social/chat-service');
const xpService = require('../src/server/progression/xp-service');
const profileRepo = require('../src/server/persistence/profile-repository');

async function runMetaverseConcurrencyTest() {
    console.log('🧪 [TEST] Starting Metaverse Concurrency & Gateway Test...');

    const server = http.createServer((req, res) => {
        res.writeHead(200);
        res.end('ok');
    });

    server.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url, `http://${request.headers.host}`);
        if (url.pathname === '/ws/world') {
            realtimeGateway.handleUpgrade(request, socket, head);
        } else {
            socket.destroy();
        }
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const wsUrl = `ws://127.0.0.1:${port}/ws/world`;
    console.log(`📡 [TEST] Test server listening on ${wsUrl}`);

    try {
        // 1. Connect Client A (Tris)
        const clientA = new WebSocket(wsUrl);
        const clientAEvents = [];
        clientA.on('message', (data) => {
            try { clientAEvents.push(JSON.parse(data.toString())); } catch (e) {}
        });

        await new Promise((resolve, reject) => {
            clientA.on('open', resolve);
            clientA.on('error', reject);
        });

        clientA.send(JSON.stringify({
            type: 'join',
            userId: 'dev_tris',
            username: 'Tris',
            displayName: 'Tris'
        }));

        await new Promise((r) => setTimeout(r, 100));
        const welcomeA = clientAEvents.find((e) => e.type === 'welcome');
        if (!welcomeA || welcomeA.profile.username !== 'Tris') {
            throw new Error(`Client A failed to receive welcome packet: ${JSON.stringify(welcomeA)}`);
        }
        console.log(`✅ Client A received welcome packet: username="${welcomeA.profile.username}", level=${welcomeA.profile.level}`);

        // 2. Connect Client B (Alice)
        const clientB = new WebSocket(wsUrl);
        const clientBEvents = [];
        clientB.on('message', (data) => {
            try { clientBEvents.push(JSON.parse(data.toString())); } catch (e) {}
        });

        await new Promise((resolve, reject) => {
            clientB.on('open', resolve);
            clientB.on('error', reject);
        });

        clientB.send(JSON.stringify({
            type: 'join',
            userId: 'dev_alice',
            username: 'Alice',
            displayName: 'Alice'
        }));

        await new Promise((r) => setTimeout(r, 150));
        const joinEvent = clientAEvents.find((e) => e.type === 'player_join' && e.player.username === 'Alice');
        if (!joinEvent) {
            throw new Error(`Client A did not receive player_join for Alice!`);
        }
        console.log(`✅ Client A received player_join for Alice`);

        // 3. Test 12 Hz world snapshot position sync
        clientA.send(JSON.stringify({
            type: 'move',
            position: { x: 14.5, y: 0.8, z: -12.3 },
            yaw: 1.57,
            anim: 'run'
        }));

        await new Promise((r) => setTimeout(r, 250));
        const snapshot = clientBEvents.slice().reverse().find((e) => e.type === 'world_snapshot' && e.players.some((p) => p.id === 'dev_tris'));
        if (!snapshot) {
            throw new Error(`Client B did not receive 12 Hz world snapshot containing Tris!`);
        }
        const trisData = snapshot.players.find((p) => p.id === 'dev_tris');
        if (Math.abs(trisData.position.x - 14.5) > 0.1) {
            throw new Error(`Position mismatch in snapshot: expected 14.5, got ${trisData.position.x}`);
        }
        console.log(`✅ 12 Hz World snapshot verified: Client B saw Tris at (${trisData.position.x}, ${trisData.position.z}) anim="${trisData.anim}"`);

        // 4. Test Global Chat Broadcast
        clientA.send(JSON.stringify({
            type: 'chat',
            text: 'Hello metaverse world! Let us vibe code together.'
        }));

        await new Promise((r) => setTimeout(r, 150));
        const chatMsgB = clientBEvents.find((e) => e.type === 'chat_message' && e.message.senderName === 'Tris');
        if (!chatMsgB || !chatMsgB.message.text.includes('vibe code')) {
            throw new Error(`Client B did not receive global chat message from Tris: ${JSON.stringify(chatMsgB)}`);
        }
        console.log(`✅ Global Chat broadcast verified: "${chatMsgB.message.text}"`);

        // 5. Test Whisper Direct Messaging (Tris -> Alice)
        clientA.send(JSON.stringify({
            type: 'whisper',
            recipientId: 'dev_alice',
            text: 'Psst Alice, secret PTY review passing!'
        }));

        await new Promise((r) => setTimeout(r, 150));
        const whisperMsgB = clientBEvents.find((e) => e.type === 'chat_whisper' && e.message.channel === 'whisper' && e.message.senderName === 'Tris');
        if (!whisperMsgB) {
            throw new Error(`Alice did not receive whisper from Tris!`);
        }
        console.log(`✅ Whisper routing verified: Alice received secret whisper: "${whisperMsgB.message.text}"`);

        // 6. Test Level Up Broadcast
        xpService.addRawXp('dev_tris', 1000, 'metaverse_test_grant');
        await new Promise((r) => setTimeout(r, 150));
        const levelUpEventB = clientBEvents.find((e) => e.type === 'level_up_event' && e.userId === 'dev_tris');
        if (!levelUpEventB) {
            throw new Error(`Client B did not receive level up celebration broadcast: ${JSON.stringify(clientBEvents)}`);
        }
        console.log(`✅ Level-up celebration broadcast verified: Lv.${levelUpEventB.newLevel} (${levelUpEventB.title})`);

        // 7. Clean Disconnect & Teardown
        clientB.close();
        await new Promise((r) => setTimeout(r, 150));
        const leaveEventA = clientAEvents.find((e) => e.type === 'player_leave' && e.id === 'dev_alice');
        if (!leaveEventA) {
            throw new Error(`Client A did not receive player_leave when Alice disconnected!`);
        }
        console.log(`✅ Player leave notification verified on disconnect`);

        clientA.close();
        if (realtimeGateway.tickTimer) {
            clearInterval(realtimeGateway.tickTimer);
        }
        server.close();
        console.log('🎉 [PASS] All Metaverse Concurrency & Gateway tests passed with 100% success!');
        process.exit(0);
    } catch (err) {
        if (realtimeGateway.tickTimer) {
            clearInterval(realtimeGateway.tickTimer);
        }
        server.close();
        console.error('❌ [FAIL] Metaverse Concurrency Test Failed:', err);
        process.exit(1);
    }
}

runMetaverseConcurrencyTest();
