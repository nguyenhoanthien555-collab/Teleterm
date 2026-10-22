const fs = require('fs');

console.log('=== TEST TAB SEPARATION & VISIBILITY ===');

const css = fs.readFileSync('public/style.css', 'utf8');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/app.js', 'utf8');

// 1. Verify CSS rules
const hasNoneRule = css.includes('display: none !important;');
const hasActiveRule = css.includes('display: flex !important;');
const hasAgyDesktopClass = css.includes('.agy-desktop-view') && css.includes('.app-view.agy-desktop-view');

console.log('1. CSS display: none !important rule:', hasNoneRule ? 'PASS' : 'FAIL');
console.log('2. CSS display: flex !important rule:', hasActiveRule ? 'PASS' : 'FAIL');
console.log('3. CSS scoped class selectors:', hasAgyDesktopClass ? 'PASS' : 'FAIL');

if (!hasNoneRule || !hasActiveRule || !hasAgyDesktopClass) {
    throw new Error('CSS verification failed');
}

// 2. Verify HTML initial state
const terminalInitialActive = html.includes('id="view-terminal" class="app-view active"');
const agyInitialInactive = html.includes('id="view-antigravity" class="app-view agy-desktop-view"') &&
    !html.includes('id="view-antigravity" class="app-view agy-desktop-view active"');

console.log('4. HTML view-terminal initially active:', terminalInitialActive ? 'PASS' : 'FAIL');
console.log('5. HTML view-antigravity initially inactive:', agyInitialInactive ? 'PASS' : 'FAIL');

if (!terminalInitialActive || !agyInitialInactive) {
    throw new Error('HTML initial state verification failed');
}

// 3. Verify JavaScript switchView handles both tabs cleanly
const hasViewSwitchTerminal = js.includes("targetViewId === 'view-terminal'");
const hasViewSwitchAgy = js.includes("targetViewId === 'view-antigravity'");
const hasFitTerminal = js.includes('fitAddon.fit()');
const hasScrollBottom = js.includes('term.scrollToBottom()');

console.log('6. JS switchView handling Terminal:', hasViewSwitchTerminal ? 'PASS' : 'FAIL');
console.log('7. JS switchView handling Antigravity:', hasViewSwitchAgy ? 'PASS' : 'FAIL');
console.log('8. JS auto-fit and scroll terminal:', (hasFitTerminal && hasScrollBottom) ? 'PASS' : 'FAIL');

if (!hasViewSwitchTerminal || !hasViewSwitchAgy || !hasFitTerminal || !hasScrollBottom) {
    throw new Error('JS switchView verification failed');
}

console.log('\n🎉 ALL TAB SEPARATION CHECKS PASSED 100%!');
