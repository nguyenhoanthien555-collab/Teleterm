const { EventEmitter } = require('events');

/**
 * TeleTerm ADE Unified EventBus
 * Provides strictly monotonic sequence numbering, normalized event envelope,
 * in-memory ring buffer for reconnect replay, and filtering.
 */
class EventBus extends EventEmitter {
    constructor(options = {}) {
        super();
        this.maxBufferSize = options.maxBufferSize || 2000;
        this.sequence = 0;
        this.ringBuffer = [];
        this.setMaxListeners(100);
    }

    /**
     * Emit a normalized ADE event
     * @param {string} type - Event type (e.g. 'file_changed', 'agent_activity')
     * @param {any} payload - Event payload
     * @param {object} metadata - { workspaceId, sessionId, source }
     */
    emitEvent(type, payload = {}, metadata = {}) {
        const sequence = ++this.sequence;
        const event = {
            eventId: `evt-${sequence}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            workspaceId: metadata.workspaceId || 'ws-default',
            sessionId: metadata.sessionId || null,
            timestamp: Date.now(),
            sequence,
            type,
            source: metadata.source || 'system',
            payload
        };

        // Maintain bounded ring buffer for client reconnection replay
        this.ringBuffer.push(event);
        if (this.ringBuffer.length > this.maxBufferSize) {
            this.ringBuffer.shift();
        }

        // Emit typed event and wildcard event
        this.emit(type, event);
        this.emit('*', event);

        return event;
    }

    /**
     * Get missed events after a specific sequence number
     * @param {number} lastSequence 
     * @param {object} filter - { workspaceId, sessionId }
     */
    getEventsSince(lastSequence = 0, filter = {}) {
        return this.ringBuffer.filter(evt => {
            if (evt.sequence <= lastSequence) return false;
            if (filter.workspaceId && evt.workspaceId !== filter.workspaceId) return false;
            if (filter.sessionId && evt.sessionId && evt.sessionId !== filter.sessionId) return false;
            return true;
        });
    }

    /**
     * Get current sequence number
     */
    getCurrentSequence() {
        return this.sequence;
    }

    /**
     * Clear buffer (primarily for test resets)
     */
    reset() {
        this.sequence = 0;
        this.ringBuffer = [];
    }
}

// Global default instance anchored to process to survive hot-reloading
if (!global.__adeEventBus) {
    global.__adeEventBus = new EventBus();
}
const defaultEventBus = global.__adeEventBus;

module.exports = {
    EventBus,
    defaultEventBus
};
