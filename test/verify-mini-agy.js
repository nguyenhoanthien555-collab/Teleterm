const fs = require('fs');
const ag = require('../src/server/antigravity-manager');

(async () => {
    console.log('=== VERIFYING MINI-ANTIGRAVITY & MOBILE TERMINAL ===');
    
    // 1. Sidebar sessions
    const s = await ag.getSidebarSessions();
    console.log('1. Sidebar sessions test:', s.success ? 'PASS' : 'FAIL');
    console.log('   Pinned count:', s.pinned?.length, 'Recent count:', s.recent?.length);
    if (!s.success || !s.pinned || s.pinned.length === 0) {
        throw new Error('Sidebar sessions failed');
    }

    // 2. Session messages
    const targetSession = s.pinned[0];
    const msgs = await ag.getSessionMessages(targetSession.id);
    console.log('2. Session messages test for', targetSession.title, ':', msgs.success ? 'PASS' : 'FAIL');
    console.log('   Messages count:', msgs.messages?.length);
    if (!msgs.success || !Array.isArray(msgs.messages)) {
        throw new Error('Session messages failed');
    }

    // 3. HTML verification
    const html = fs.readFileSync('public/index.html', 'utf8');
    const checks = [
        ['id="agy-sidebar"', 'Sidebar Drawer Element'],
        ['id="agy-pinned-list"', 'Pinned List Element'],
        ['id="agy-projects-list"', 'Projects List Element'],
        ['id="agy-chat-messages"', 'Chat Messages Container'],
        ['id="btn-hud-toggle"', 'HUD Toggle in Top Bar'],
        ['id="quota-sheet"', 'Quota Bottom Sheet Modal'],
        ['id="agy-chat-input"', 'Chat Textarea Input'],
        ['id="btn-send-agy-prompt"', 'Send Button']
    ];

    checks.forEach(([snippet, label]) => {
        const ok = html.includes(snippet);
        console.log(`3. HTML check [${label}]:`, ok ? 'PASS' : 'FAIL');
        if (!ok) throw new Error(`Missing ${label} in index.html`);
    });

    // 4. JS verification
    const js = fs.readFileSync('public/app.js', 'utf8');
    const jsChecks = [
        ['loadSidebarSessions', 'loadSidebarSessions function'],
        ['loadSessionChat', 'loadSessionChat function'],
        ['renderChatMessages', 'renderChatMessages function'],
        ['sendAgyChatMessage', 'sendAgyChatMessage function'],
        ['TOUCH_SCROLL_SENSITIVITY', 'Mobile Touch Scrolling logic'],
        ['isUserScrolledUp', 'Screen Freeze when User Scrolled Up logic']
    ];

    jsChecks.forEach(([snippet, label]) => {
        const ok = js.includes(snippet);
        console.log(`4. JS check [${label}]:`, ok ? 'PASS' : 'FAIL');
        if (!ok) throw new Error(`Missing ${label} in app.js`);
    });

    // 5. CSS verification
    const css = fs.readFileSync('public/style.css', 'utf8');
    const cssChecks = [
        ['.agy-desktop-view', 'Mini-Desktop View Container'],
        ['.agy-sidebar', 'Sidebar Drawer Styles'],
        ['.user-bubble', 'User Message Bubble Style'],
        ['.agy-file-change-chip', 'File Change Summary Chip Style'],
        ['.agy-send-btn', 'Circular Send Button Style']
    ];

    cssChecks.forEach(([snippet, label]) => {
        const ok = css.includes(snippet);
        console.log(`5. CSS check [${label}]:`, ok ? 'PASS' : 'FAIL');
        if (!ok) throw new Error(`Missing ${label} in style.css`);
    });

    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY!');
})();
