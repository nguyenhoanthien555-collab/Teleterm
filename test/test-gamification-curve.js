const assert = require('assert');
const xpService = require('../src/server/progression/xp-service');
const titleService = require('../src/server/progression/title-service');
const profileRepo = require('../src/server/persistence/profile-repository');

console.log('--- RUNNING GAMIFICATION & XP UNIT TESTS ---');

// 1. Test Level Curve calculation
const reqLvl1 = xpService.getXpRequiredForNextLevel(1);
assert.strictEqual(reqLvl1, 100, 'Lvl 1 next req should be 100');

const reqLvl2 = xpService.getXpRequiredForNextLevel(2);
assert.strictEqual(reqLvl2, 283, 'Lvl 2 next req should be 283 (round(100 * 2^1.5))');

const reqLvl10 = xpService.getXpRequiredForNextLevel(10);
assert.strictEqual(reqLvl10, 3162, 'Lvl 10 next req should be 3162 (round(100 * 10^1.5))');
console.log('✓ Level curve mathematical formula verified');

// 2. Test Titles conforming to Master Spec v4 Section 83
assert.strictEqual(titleService.getTitleForLevel(1), 'Novice');
assert.strictEqual(titleService.getTitleForLevel(5), 'Apprentice');
assert.strictEqual(titleService.getTitleForLevel(10), 'Coder');
assert.strictEqual(titleService.getTitleForLevel(20), 'Engineer');
assert.strictEqual(titleService.getTitleForLevel(50), 'Systems Architect');
assert.strictEqual(titleService.getTitleForLevel(75), 'Distinguished Architect');
console.log('✓ Master Spec v4 Title/Rank progression tiers verified');

// 3. Test XP Award & Cooldown
const testUser = 'unit_test_user_' + Date.now();
const res1 = xpService.awardXp(testUser, 'test_passed');
assert.strictEqual(res1.awarded, 10, 'First test_passed should award 10 XP');
assert.strictEqual(res1.level, 1);

// Immediately repeating should trigger cooldown
const res2 = xpService.awardXp(testUser, 'test_passed');
assert.strictEqual(res2.awarded, 0, 'Immediate repeat should be blocked by cooldown');
assert.strictEqual(res2.reason, 'cooldown_active');
console.log('✓ Strict cooldown anti-abuse verified');

// 4. Test Build Success
const res3 = xpService.awardXp(testUser, 'build_success');
assert.strictEqual(res3.awarded, 20, 'build_success should award 20 XP');
console.log('✓ Multi-event category independent cooldowns verified');

console.log('--- ALL GAMIFICATION TESTS PASSED SUCCESSFULLY! ---');
