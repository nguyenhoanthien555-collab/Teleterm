/**
 * TELETERM 3D — PROXIMITY VOICE CHAT SYSTEM
 * Implements Proximity WebRTC Voice Chat & 3D Spatial Audio Architecture
 * Directed by Gemini 4 Argon Architecture Mandate:
 * - Dynamic Proximity Mesh (15m connect / 20m disconnect hysteresis, max 6 active peers)
 * - Zero-GC 12Hz Spatial Audio Panning using AudioParam.setTargetAtTime
 * - Push-to-Talk (Hold V) with ConPTY Terminal Focus Safety (no key stealing in terminal)
 * - Alt + M Toggle Mute Hotkey
 * - 10Hz Low-overhead Voice Activity Detection (VAD)
 * - Compact <=24px HUD Mic Button & Overhead Speaking Waves
 */

export class VoiceChatManager {
    constructor() {
        this.ctx = null;
        this.localStream = null;
        this.isMuted = true; // Default hard-muted on world entry
        this.isSpeaking = false;
        this.isPttPressed = false;
        this.pttArmed = false;
        this.analyser = null;
        this._vadBuffer = null;
        this.vadTimer = null;
        this.lastSpokeTime = 0;

        this.peers = new Map(); // peerId -> { pc, panner, gain, audioEl, isSpeaking, queuedCandidates, lastSeenInRange }
        this.proximityCheckTimer = null;

        this.MAX_PEERS = 6;
        this.CONNECT_DIST_SQ = 15 * 15;    // 15m radius (225)
        this.DISCONNECT_DIST_SQ = 20 * 20; // 20m radius (400)

        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.hudButton = null;
        this.init();
    }

    init() {
        this.injectStyles();
        this.createHudButton();
        this.setupKeyboardListeners();

        // 1 Hz Proximity evaluation loop
        this.proximityCheckTimer = setInterval(() => {
            this.evaluateProximityPeers();
        }, 1000);
    }

    getAudioContext() {
        if (!this.ctx) {
            const existing = (window.openWorld3D && window.openWorld3D.audioCtx) || window.audioContext;
            if (existing && existing.state !== 'closed') {
                this.ctx = existing;
            } else {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    async initLocalMicrophone() {
        if (this.localStream) return true;

        const ctx = this.getAudioContext();
        if (!ctx) return false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    sampleRate: 48000
                },
                video: false
            });

            this.localStream = stream;

            // Setup VAD (Voice Activity Detection)
            this.analyser = ctx.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.4;
            this._vadBuffer = new Uint8Array(this.analyser.frequencyBinCount);

            const source = ctx.createMediaStreamSource(stream);
            source.connect(this.analyser);

            this.startVadLoop();

            // Set initial mute state
            this.setMuted(this.isMuted);

            // If we have connected peers, attach local tracks to their PeerConnections
            for (const [peerId, peer] of this.peers.entries()) {
                if (peer.pc && peer.pc.signalingState !== 'closed') {
                    const senders = peer.pc.getSenders();
                    const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
                    const localTrack = this.localStream.getAudioTracks()[0];
                    if (!audioSender && localTrack) {
                        peer.pc.addTrack(localTrack, this.localStream);
                    }
                }
            }

            return true;
        } catch (err) {
            console.warn('[VoiceChat] Microphone permission denied or device not found:', err.message);
            this.showToast('Microphone access unavailable or denied', 'warning');
            return false;
        }
    }

    startVadLoop() {
        if (this.vadTimer) clearInterval(this.vadTimer);

        // 10 Hz (100ms) interval - completely independent of 60 FPS render loop
        this.vadTimer = setInterval(() => {
            if (!this.analyser || !this._vadBuffer || this.isMuted || !this.localStream) {
                if (this.isSpeaking) {
                    this.isSpeaking = false;
                    this.broadcastVoiceState();
                    this.updateHudState();
                }
                return;
            }

            this.analyser.getByteFrequencyData(this._vadBuffer);
            let sum = 0;
            for (let i = 0; i < this._vadBuffer.length; i++) {
                sum += this._vadBuffer[i];
            }
            const avg = sum / this._vadBuffer.length;
            const now = Date.now();

            if (avg > 14) {
                this.lastSpokeTime = now;
                if (!this.isSpeaking) {
                    this.isSpeaking = true;
                    this.broadcastVoiceState();
                    this.updateHudState();
                }
            } else if (this.isSpeaking && now - this.lastSpokeTime > 350) {
                this.isSpeaking = false;
                this.broadcastVoiceState();
                this.updateHudState();
            }
        }, 100);
    }

    broadcastVoiceState() {
        if (window.multiplayerClient && window.multiplayerClient.isConnected) {
            window.multiplayerClient.send({
                type: 'voice_state',
                muted: this.isMuted,
                speaking: this.isSpeaking
            });
        }

        // Update local overhead indicator
        const overhead = window.openWorld3D?.overheadUi || window.openWorld3D?.overheadUiSystem;
        if (overhead) {
            overhead.setSpeaking('player', this.isSpeaking);
        }
    }

    async toggleMute() {
        if (!this.localStream) {
            const ok = await this.initLocalMicrophone();
            if (!ok) return;
        }
        this.setMuted(!this.isMuted);
    }

    setMuted(muted) {
        this.isMuted = Boolean(muted);
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !this.isMuted;
            });
        }

        if (this.isMuted && this.isSpeaking) {
            this.isSpeaking = false;
        }

        this.broadcastVoiceState();
        this.updateHudState();
    }

    // Attach 3D Spatial Audio Node to remote stream
    _attachSpatialAudio(peerId, remoteStream) {
        const ctx = this.getAudioContext();
        if (!ctx) return null;

        // Chromium WebRTC WebAudio bug workaround: feed to muted audio tag to ensure decoder runs
        const dummyAudio = new Audio();
        dummyAudio.srcObject = remoteStream;
        dummyAudio.muted = true;
        dummyAudio.setAttribute('playsinline', '');
        dummyAudio.play().catch(() => {});

        try {
            const source = ctx.createMediaStreamSource(remoteStream);
            const panner = ctx.createPanner();

            // 'equalpower' model guarantees lowest CPU consumption and zero GC thrash
            panner.panningModel = 'equalpower';
            panner.distanceModel = 'inverse';
            panner.refDistance = 2.0;   // 100% volume within 2 meters
            panner.maxDistance = 15.0;  // Attenuates down to near zero at 15 meters
            panner.rolloffFactor = 1.5;

            const gain = ctx.createGain();
            const playerVol = (window.soundSettings && typeof window.soundSettings.getEffectivePlayerSoundsVolume === 'function')
                ? window.soundSettings.getEffectivePlayerSoundsVolume()
                : 1.0;
            gain.gain.value = playerVol;

            source.connect(panner);
            panner.connect(gain);
            gain.connect(ctx.destination);

            return { source, panner, gain, dummyAudio };
        } catch (e) {
            console.warn('[VoiceChat] Failed to attach spatial audio:', e);
            return null;
        }
    }

    // 12 Hz tick called from multiplayer client
    updateSpatialPositions(localPos, localRotY, remotePlayersMap) {
        if (!this.ctx || this.peers.size === 0) return;
        const now = this.ctx.currentTime;
        const SMOOTH_TIME = 0.085; // 85ms smooth transition for 12Hz ticks

        // 1. Update listener (main player ear)
        const listener = this.ctx.listener;
        if (listener && listener.positionX && localPos) {
            listener.positionX.setTargetAtTime(localPos.x || 0, now, SMOOTH_TIME);
            listener.positionY.setTargetAtTime((localPos.y || 0) + 1.6, now, SMOOTH_TIME);
            listener.positionZ.setTargetAtTime(localPos.z || 0, now, SMOOTH_TIME);

            const rotY = localRotY || 0;
            listener.forwardX.setTargetAtTime(-Math.sin(rotY), now, SMOOTH_TIME);
            listener.forwardY.setTargetAtTime(0, now, SMOOTH_TIME);
            listener.forwardZ.setTargetAtTime(-Math.cos(rotY), now, SMOOTH_TIME);
            listener.upX.setTargetAtTime(0, now, SMOOTH_TIME);
            listener.upY.setTargetAtTime(1, now, SMOOTH_TIME);
            listener.upZ.setTargetAtTime(0, now, SMOOTH_TIME);
        }

        // 2. Update remote peer panner positions
        for (const [peerId, peer] of this.peers.entries()) {
            if (!peer.panner) continue;
            const remote = remotePlayersMap.get(peerId);
            if (!remote || !remote.group) continue;

            const pos = remote.group.position;
            peer.panner.positionX.setTargetAtTime(pos.x, now, SMOOTH_TIME);
            peer.panner.positionY.setTargetAtTime(pos.y + 1.6, now, SMOOTH_TIME);
            peer.panner.positionZ.setTargetAtTime(pos.z, now, SMOOTH_TIME);
        }
    }

    evaluateProximityPeers() {
        if (!window.multiplayerClient || !window.multiplayerClient.isConnected || !window.openWorld3D?.player) return;

        const myId = window.multiplayerClient.myUserId;
        if (!myId) return;

        const myPos = window.openWorld3D.player.position;
        const remoteMap = window.multiplayerClient.remotePlayers;
        const candidatePeers = [];

        for (const [peerId, rp] of remoteMap.entries()) {
            if (!rp.group) continue;
            const dx = myPos.x - rp.group.position.x;
            const dz = myPos.z - rp.group.position.z;
            const distSq = dx * dx + dz * dz;

            candidatePeers.push({ peerId, distSq });
        }

        // Sort by closest distance
        candidatePeers.sort((a, b) => a.distSq - b.distSq);

        // Check disconnections (distance > 20m for > 3 consecutive checks)
        for (const [peerId, peer] of this.peers.entries()) {
            const found = candidatePeers.find(c => c.peerId === peerId);
            if (!found || found.distSq > this.DISCONNECT_DIST_SQ) {
                peer.outOfRangeCount = (peer.outOfRangeCount || 0) + 1;
                if (peer.outOfRangeCount >= 3) {
                    this.disconnectPeer(peerId);
                }
            } else {
                peer.outOfRangeCount = 0;
            }
        }

        // Check new connections (distance <= 15m, max 6 peers)
        let activeCount = this.peers.size;
        for (const candidate of candidatePeers) {
            if (activeCount >= this.MAX_PEERS) break;
            if (candidate.distSq <= this.CONNECT_DIST_SQ && !this.peers.has(candidate.peerId)) {
                // Glare prevention rule: only the peer with lexicographically lower ID initiates offer
                if (String(myId) < String(candidate.peerId)) {
                    this.initiatePeerConnection(candidate.peerId);
                    activeCount++;
                }
            }
        }
    }

    getOrCreatePeer(peerId) {
        let peer = this.peers.get(peerId);
        if (peer) return peer;

        const pc = new RTCPeerConnection(this.rtcConfig);
        peer = {
            peerId,
            pc,
            source: null,
            panner: null,
            gain: null,
            dummyAudio: null,
            isSpeaking: false,
            queuedCandidates: [],
            outOfRangeCount: 0
        };

        // Add local tracks if microphone is active
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && window.multiplayerClient) {
                window.multiplayerClient.send({
                    type: 'voice_signal',
                    targetId: peerId,
                    signal: {
                        type: 'candidate',
                        candidate: event.candidate
                    }
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                const nodes = this._attachSpatialAudio(peerId, event.streams[0]);
                if (nodes) {
                    peer.source = nodes.source;
                    peer.panner = nodes.panner;
                    peer.gain = nodes.gain;
                    peer.dummyAudio = nodes.dummyAudio;
                }
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                this.disconnectPeer(peerId);
            }
        };

        this.peers.set(peerId, peer);
        return peer;
    }

    async initiatePeerConnection(peerId) {
        const peer = this.getOrCreatePeer(peerId);
        try {
            const offer = await peer.pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
            await peer.pc.setLocalDescription(offer);

            if (window.multiplayerClient) {
                window.multiplayerClient.send({
                    type: 'voice_signal',
                    targetId: peerId,
                    signal: {
                        type: 'offer',
                        sdp: offer.sdp
                    }
                });
            }
        } catch (err) {
            console.warn('[VoiceChat] Error creating offer for peer:', peerId, err);
        }
    }

    async handleIncomingSignal(senderId, signal) {
        if (!senderId || !signal) return;

        const peer = this.getOrCreatePeer(senderId);

        try {
            if (signal.type === 'offer') {
                await peer.pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));

                // Drain queued ICE candidates
                if (peer.queuedCandidates.length > 0) {
                    for (const cand of peer.queuedCandidates) {
                        await peer.pc.addIceCandidate(cand).catch(() => {});
                    }
                    peer.queuedCandidates = [];
                }

                // If local mic is active, attach tracks
                if (this.localStream) {
                    this.localStream.getAudioTracks().forEach(track => {
                        const senders = peer.pc.getSenders();
                        if (!senders.find(s => s.track && s.track.kind === 'audio')) {
                            peer.pc.addTrack(track, this.localStream);
                        }
                    });
                }

                const answer = await peer.pc.createAnswer();
                await peer.pc.setLocalDescription(answer);

                if (window.multiplayerClient) {
                    window.multiplayerClient.send({
                        type: 'voice_signal',
                        targetId: senderId,
                        signal: {
                            type: 'answer',
                            sdp: answer.sdp
                        }
                    });
                }
            } else if (signal.type === 'answer') {
                await peer.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));

                // Drain queued ICE candidates
                if (peer.queuedCandidates.length > 0) {
                    for (const cand of peer.queuedCandidates) {
                        await peer.pc.addIceCandidate(cand).catch(() => {});
                    }
                    peer.queuedCandidates = [];
                }
            } else if (signal.type === 'candidate' && signal.candidate) {
                const iceCandidate = new RTCIceCandidate(signal.candidate);
                if (peer.pc.remoteDescription && peer.pc.remoteDescription.type) {
                    await peer.pc.addIceCandidate(iceCandidate).catch(() => {});
                } else {
                    peer.queuedCandidates.push(iceCandidate);
                }
            }
        } catch (err) {
            console.warn('[VoiceChat] Error processing voice signal:', err);
        }
    }

    handleVoiceStateUpdate(playerId, muted, speaking) {
        const peer = this.peers.get(playerId);
        if (peer) {
            peer.isSpeaking = Boolean(speaking);
        }

        // Update overhead nametag
        const overhead = window.openWorld3D?.overheadUi || window.openWorld3D?.overheadUiSystem;
        if (overhead) {
            overhead.setSpeaking(playerId, speaking);
        }
    }

    disconnectPeer(peerId) {
        const peer = this.peers.get(peerId);
        if (!peer) return;

        try {
            if (peer.dummyAudio) {
                peer.dummyAudio.pause();
                peer.dummyAudio.srcObject = null;
            }
            if (peer.source) peer.source.disconnect();
            if (peer.panner) peer.panner.disconnect();
            if (peer.gain) peer.gain.disconnect();
            if (peer.pc) peer.pc.close();
        } catch (e) {}

        this.peers.delete(peerId);

        // Turn off overhead wave indicator
        const overhead = window.openWorld3D?.overheadUi || window.openWorld3D?.overheadUiSystem;
        if (overhead) {
            overhead.setSpeaking(peerId, false);
        }
    }

    setupKeyboardListeners() {
        const isInputFieldActive = () => {
            const el = document.activeElement;
            if (!el) return false;
            const tag = el.tagName.toLowerCase();
            return tag === 'input' || tag === 'textarea' || el.isContentEditable ||
                   el.classList.contains('xterm-helper-textarea') ||
                   Boolean(el.closest('#terminal-container') || el.closest('#css3d-viewport'));
        };

        window.addEventListener('keydown', (e) => {
            // Hotkey 1: Alt + M toggles mute everywhere
            if (e.altKey && (e.key === 'm' || e.key === 'M')) {
                e.preventDefault();
                this.toggleMute();
                return;
            }

            // Hotkey 2: Hold 'V' for Push-to-Talk (PTT)
            // STRICT SAFETY RULE: Ignore key 'V' when typing in Terminal or text inputs!
            if (e.key === 'v' || e.key === 'V') {
                if (isInputFieldActive() || e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;

                if (!this.isPttPressed) {
                    this.isPttPressed = true;
                    if (this.isMuted) {
                        this.pttArmed = true;
                        this.setMuted(false);
                    }
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'v' || e.key === 'V') {
                if (this.isPttPressed) {
                    this.isPttPressed = false;
                    if (this.pttArmed) {
                        this.pttArmed = false;
                        this.setMuted(true);
                    }
                }
            }
        });
    }

    createHudButton() {
        if (document.getElementById('btn-voice-mic')) return;

        const btn = document.createElement('button');
        btn.id = 'btn-voice-mic';
        btn.className = 'voice-mic-hud-btn is-muted';
        btn.type = 'button';
        btn.title = 'Microphone [Alt+M / Hold V]';
        btn.setAttribute('aria-label', 'Toggle Microphone');

        // Bounded strictly to <= 24px per TeleTerm UX specification
        btn.innerHTML = `
            <svg class="mic-icon mic-muted-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="2" y1="2" x2="22" y2="22"></line>
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
                <path d="M5 10v2a7 7 0 0 0 12 5"></path>
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <svg class="mic-icon mic-active-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
        `;

        btn.addEventListener('click', () => {
            this.toggleMute();
        });

        // Append to HUD action container or body
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.insertBefore(btn, navActions.firstChild);
        } else {
            document.body.appendChild(btn);
        }

        this.hudButton = btn;
        this.updateHudState();
    }

    updateHudState() {
        if (!this.hudButton) return;

        const mutedIcon = this.hudButton.querySelector('.mic-muted-icon');
        const activeIcon = this.hudButton.querySelector('.mic-active-icon');

        if (this.isMuted) {
            this.hudButton.className = 'voice-mic-hud-btn is-muted';
            if (mutedIcon) mutedIcon.style.display = 'block';
            if (activeIcon) activeIcon.style.display = 'none';
        } else {
            if (this.isSpeaking) {
                this.hudButton.className = 'voice-mic-hud-btn is-unmuted is-speaking';
            } else {
                this.hudButton.className = 'voice-mic-hud-btn is-unmuted';
            }
            if (mutedIcon) mutedIcon.style.display = 'none';
            if (activeIcon) activeIcon.style.display = 'block';
        }
    }

    injectStyles() {
        if (document.getElementById('voice-chat-styles')) return;

        const style = document.createElement('style');
        style.id = 'voice-chat-styles';
        style.textContent = `
            /* Compact <=24px HUD Microphone Button */
            .voice-mic-hud-btn {
                width: 24px;
                height: 24px;
                min-width: 24px;
                min-height: 24px;
                max-width: 24px;
                max-height: 24px;
                border-radius: 6px;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 1px solid #475569;
                background: rgba(15, 23, 42, 0.88);
                color: #ef4444;
                transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
                box-sizing: border-box;
                flex-shrink: 0;
            }
            .voice-mic-hud-btn:hover {
                border-color: #94a3b8;
                background: rgba(30, 41, 59, 0.95);
            }
            .voice-mic-hud-btn.is-unmuted {
                border-color: #10b981;
                color: #f8fafc;
                background: rgba(6, 78, 59, 0.85);
            }
            .voice-mic-hud-btn.is-speaking {
                border-color: #34d399;
                color: #10b981;
                background: rgba(16, 185, 129, 0.25);
                box-shadow: 0 0 8px rgba(16, 185, 129, 0.85), inset 0 0 4px rgba(16, 185, 129, 0.4);
            }

            /* Overhead Voice Speaking Wave Animation (GPU Composited) */
            .overhead-voice-indicator {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                animation: voice-pulse-glow 1.2s infinite ease-in-out;
            }
            @keyframes voice-pulse-glow {
                0%, 100% { transform: scale(0.92); opacity: 0.85; }
                50% { transform: scale(1.1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    showToast(message, type = 'info') {
        if (window.teletermToast) {
            window.teletermToast(message, type);
        } else {
            console.log(`[VoiceChat] ${message}`);
        }
    }
}

// Global instance attached to window
window.voiceChatManager = new VoiceChatManager();
