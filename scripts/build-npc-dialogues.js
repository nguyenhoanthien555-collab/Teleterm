const fs = require('fs');
const path = require('path');

const { luminaLines } = require('./dialogue-lumina.js');
const { sakuraLines } = require('./dialogue-sakura.js');
const { renLines } = require('./dialogue-ren.js');
const { kaedeLines } = require('./dialogue-kaede.js');

const CATEGORIES = [
    'greeting',
    'repeat_visit',
    'player_idle',
    'player_walk',
    'player_run',
    'player_sitting',
    'player_holding_can',
    'player_holding_mug',
    'player_holding_bottle',
    'player_holding_phone',
    'player_holding_book',
    'player_drinking',
    'player_using_terminal',
    'player_chatting',
    'location_hub',
    'location_village',
    'location_rice_field',
    'location_river',
    'location_bridge',
    'location_cherry_grove',
    'location_mountain',
    'location_beach',
    'location_pier',
    'high_rank',
    'low_level',
    'wind_weather',
    'farewell'
];

console.log('Validating dialogue datasets...');

const npcData = {
    lumina: luminaLines,
    sakura: sakuraLines,
    ren: renLines,
    kaede: kaedeLines
};

let totalLines = 0;
for (const [npcId, lines] of Object.entries(npcData)) {
    console.log(`- ${npcId}: ${lines.length} lines`);
    if (lines.length < 200) {
        throw new Error(`NPC ${npcId} has only ${lines.length} lines (requires >= 200)!`);
    }
    totalLines += lines.length;

    // Check category coverage
    const catMap = new Map();
    lines.forEach((l, idx) => {
        if (!l.id) throw new Error(`${npcId} line ${idx} missing id`);
        if (!l.category) throw new Error(`${npcId} line ${idx} missing category`);
        if (!l.en || typeof l.en !== 'string' || l.en.trim().length === 0) {
            throw new Error(`${npcId} line ${l.id} missing en text`);
        }
        if (!l.vi || typeof l.vi !== 'string' || l.vi.trim().length === 0) {
            throw new Error(`${npcId} line ${l.id} missing vi text`);
        }
        catMap.set(l.category, (catMap.get(l.category) || 0) + 1);
    });

    for (const cat of CATEGORIES) {
        if (!catMap.has(cat) || catMap.get(cat) === 0) {
            throw new Error(`NPC ${npcId} missing lines for category ${cat}`);
        }
    }
}

console.log(`Total lines verified: ${totalLines} (>= 800 required)`);

const outFile = path.join(__dirname, '../public/js/npc/npc-dialogue-data.js');

const jsContent = `/**
 * TELETERM 3D — MASTER NPC DIALOGUE REPOSITORY
 * 4 Rich Anime Characters (Lumina, Sakura, Ren, Kaede)
 * Total: ${totalLines} Authored Lines (>= 200 lines per NPC)
 * Strict bilingual parity (EN and VI) across 27 Context Categories.
 */

export const DIALOGUE_CATEGORIES = ${JSON.stringify(CATEGORIES, null, 4)};

export const NPC_DIALOGUE_DATABASE = {
    lumina: ${JSON.stringify(luminaLines, null, 4)},
    sakura: ${JSON.stringify(sakuraLines, null, 4)},
    ren: ${JSON.stringify(renLines, null, 4)},
    kaede: ${JSON.stringify(kaedeLines, null, 4)}
};

/**
 * Get all lines for an NPC in a specific category
 */
export function getNpcDialogueLines(npcId, category) {
    const list = NPC_DIALOGUE_DATABASE[npcId];
    if (!list) return [];
    if (!category) return list;
    return list.filter(item => item.category === category);
}

/**
 * Priority Order Context Category Resolver (Master Spec Section 50)
 * Context priority:
 * 1. Player active action (drinking)
 * 2. Player equipped handheld item (can, mug, bottle, phone, book)
 * 3. Player activity (terminal, chatting)
 * 4. Player posture (sitting)
 * 5. Player movement (running, walking, idle)
 * 6. Player rank/level (high_rank, low_level)
 * 7. Location (bridge, pier, beach, river, mountain, cherry_grove, rice_field, village, hub)
 * 8. Repeat visit (if visited recently)
 * 9. Default greeting
 */
export function resolveContextCategory(playerContext, lastInteraction = null) {
    if (!playerContext) return 'greeting';

    // 1. Drinking action (Highest Priority)
    if (playerContext.currentAction === 'drinking') {
        return 'player_drinking';
    }

    // 2. Equipped handheld item
    if (playerContext.equippedItemId) {
        const id = playerContext.equippedItemId;
        if (id.includes('can')) return 'player_holding_can';
        if (id.includes('mug') || id.includes('coffee')) return 'player_holding_mug';
        if (id.includes('bottle') || id.includes('water')) return 'player_holding_bottle';
        if (id.includes('phone')) return 'player_holding_phone';
        if (id.includes('book')) return 'player_holding_book';
    }

    // 3. Activity (Terminal or MMO Chat)
    if (playerContext.currentAction === 'terminal') {
        return 'player_using_terminal';
    }
    if (playerContext.currentAction === 'chatting') {
        return 'player_chatting';
    }

    // 4. Posture (Sitting on bench/chair)
    if (playerContext.posture === 'sitting') {
        return 'player_sitting';
    }

    // 5. Movement (Running vs Walking)
    if (playerContext.movement === 'running') {
        return 'player_run';
    }

    // 6. Progression Extremes (High Rank vs Low Level)
    if (playerContext.level >= 20 || (playerContext.rank && /Architect|Principal|Master/i.test(playerContext.rank))) {
        // 35% chance to acknowledge high rank
        if (Math.random() < 0.35) return 'high_rank';
    } else if (playerContext.level <= 2 || (playerContext.rank && /Novice|Tập Sự/i.test(playerContext.rank))) {
        // 35% chance to acknowledge novice
        if (Math.random() < 0.35) return 'low_level';
    }

    // 7. Location specific
    if (playerContext.location) {
        const locMap = {
            bridge: 'location_bridge',
            pier: 'location_pier',
            beach: 'location_beach',
            river: 'location_river',
            mountain: 'location_mountain',
            cherry_grove: 'location_cherry_grove',
            rice_field: 'location_rice_field',
            village: 'location_village',
            hub: 'location_hub'
        };
        if (locMap[playerContext.location] && Math.random() < 0.70) {
            return locMap[playerContext.location];
        }
    }

    // 8. Repeat visit (Visited within last 90 seconds)
    if (lastInteraction && (Date.now() - lastInteraction.timestamp) < 90000) {
        return 'repeat_visit';
    }

    // 9. Movement idle vs walk
    if (playerContext.movement === 'walking') {
        return 'player_walk';
    }
    if (playerContext.movement === 'idle' && Math.random() < 0.4) {
        return 'player_idle';
    }

    return 'greeting';
}

/**
 * Resolve a contextual dialogue line for an NPC with cooldown protection
 */
export function resolveContextualDialogue(npcId, playerContext, lastInteraction = null) {
    const category = resolveContextCategory(playerContext, lastInteraction);
    let candidates = getNpcDialogueLines(npcId, category);

    if (!candidates || candidates.length === 0) {
        candidates = getNpcDialogueLines(npcId, 'greeting');
    }

    // Filter out recently used line to prevent immediate repetition
    let filtered = candidates;
    if (lastInteraction && lastInteraction.lineId && candidates.length > 1) {
        filtered = candidates.filter(c => c.id !== lastInteraction.lineId);
    }
    if (filtered.length === 0) filtered = candidates;

    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    return {
        line: chosen,
        category
    };
}
`;

fs.writeFileSync(outFile, jsContent, 'utf8');
console.log('✅ Successfully generated:', outFile);
console.log('File size:', (fs.statSync(outFile).size / 1024).toFixed(2), 'KB');
