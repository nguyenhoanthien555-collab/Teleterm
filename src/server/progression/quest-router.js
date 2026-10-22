/**
 * TELETERM 3D — QUEST & BOUNTY REST API ROUTER
 */

const express = require('express');
const router = express.Router();
const questService = require('./quest-service');
const logger = require('../logger');

function getUserId(req) {
    return req.authSession?.userId || null;
}

// GET /api/quests/state
router.get('/state', (req, res) => {
    try {
        const userId = getUserId(req);
        const state = questService.getClientQuestState(userId);
        res.json({ success: true, ...state });
    } catch (e) {
        logger.error(`[QuestRouter] GET /state error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

// POST /api/quests/accept
router.post('/accept', express.json(), (req, res) => {
    try {
        const userId = getUserId(req);
        const { questId } = req.body || {};
        if (!questId) {
            return res.status(400).json({ success: false, error: 'questId_required' });
        }
        const result = questService.acceptQuest(userId, questId);
        res.json(result);
    } catch (e) {
        logger.error(`[QuestRouter] POST /accept error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

// POST /api/quests/set-active
router.post('/set-active', express.json(), (req, res) => {
    try {
        const userId = getUserId(req);
        const { questId } = req.body || {};
        if (!questId) {
            return res.status(400).json({ success: false, error: 'questId_required' });
        }
        const result = questService.setActiveQuest(userId, questId);
        res.json(result);
    } catch (e) {
        logger.error(`[QuestRouter] POST /set-active error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

// POST /api/quests/claim
router.post('/claim', express.json(), (req, res) => {
    try {
        const userId = getUserId(req);
        const { questId } = req.body || {};
        if (!questId) {
            return res.status(400).json({ success: false, error: 'questId_required' });
        }
        const result = questService.claimQuest(userId, questId);
        res.json(result);
    } catch (e) {
        logger.error(`[QuestRouter] POST /claim error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

// POST /api/quests/event
router.post('/event', express.json(), (req, res) => {
    try {
        const userId = getUserId(req);
        const eventType = req.body?.eventType || req.body?.type;
        const data = req.body?.data || {};
        if (!eventType) {
            return res.status(400).json({ success: false, error: 'eventType_required' });
        }
        const result = questService.recordEvent(userId, eventType, data);
        res.json(result);
    } catch (e) {
        logger.error(`[QuestRouter] POST /event error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

// POST /api/quests/reset
router.post('/reset', express.json(), (req, res) => {
    try {
        const userId = getUserId(req);
        questService.resetUserState(userId);
        const state = questService.getClientQuestState(userId);
        res.json({ success: true, ...state });
    } catch (e) {
        logger.error(`[QuestRouter] POST /reset error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
