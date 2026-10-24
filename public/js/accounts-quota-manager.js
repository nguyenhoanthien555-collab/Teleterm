/**
 * TELETERM ACCOUNTS & QUOTA CONTROLLER
 * Fast 1-tap account switching (Antigravity & Claude), live token usage, and quota telemetry
 */

export class AccountsQuotaManager {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.onAccountSwitched = options.onAccountSwitched || null;

        this.modalEl = document.getElementById('quota-accounts-modal');
        this.closeBtn = document.getElementById('btn-close-quota-modal');
        this.btnRefresh = document.getElementById('btn-refresh-quota');
        
        // Data Containers
        this.codexTokensVal = document.getElementById('quota-codex-tokens');
        this.agyTierVal = document.getElementById('quota-agy-tier');
        this.agyActiveAccVal = document.getElementById('quota-agy-active-acc');
        this.agy5hVal = document.getElementById('quota-agy-5h');
        this.agyModelsQuotaList = document.getElementById('agy-models-quota-list');
        this.quotaResetCountdown = document.getElementById('quota-reset-countdown');
        this.agyAccountsList = document.getElementById('agy-accounts-list');
        this.claudeAccountsList = document.getElementById('claude-accounts-list');
        this.chkAutoRestart = document.getElementById('chk-auto-restart-agy');

        this.accountsData = null;
        this.quotaData = null;
        this.agyQuotaData = null;

        this.init();
    }

    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.modalEl) {
            this.modalEl.addEventListener('click', (e) => {
                if (e.target === this.modalEl) this.close();
            });
        }

        if (this.btnRefresh) {
            this.btnRefresh.addEventListener('click', () => {
                this.refresh(true);
            });
        }

        // Initial background fetch
        this.refresh(false);
    }

    vibrate(ms = 15) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(ms); } catch (e) {}
        }
    }

    async refresh(showNotice = false) {
        if (showNotice) {
            this.vibrate(10);
            this.onToast('Refreshing Quota & Accounts list...', 'info');
        }

        try {
            await Promise.all([
                this.fetchAccounts(),
                this.fetchQuotaStats(),
                this.fetchAntigravityQuota()
            ]);
            if (showNotice) {
                this.onToast('Updated latest Quota & Accounts', 'success');
            }
        } catch (err) {
            console.warn('[AccountsQuotaManager] Refresh error:', err);
            if (showNotice) {
                this.onToast('Quota update error: ' + err.message, 'error');
            }
        }
    }

    async fetchAccounts() {
        try {
            const res = await fetch('/api/accounts');
            if (!res.ok) return;
            const data = await res.json();
            this.accountsData = data;
            this.renderAccounts();
        } catch (e) {
            console.warn('[Fetch Accounts Error]', e);
        }
    }

    async fetchQuotaStats() {
        try {
            const res = await fetch('/api/accounts/quota');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success || data.codexTokens !== undefined) {
                this.quotaData = data;
                if (this.codexTokensVal) {
                    const formatted = new Intl.NumberFormat('en-US').format(data.codexTokens || 0);
                    this.codexTokensVal.textContent = `${formatted} Tokens`;
                }
            }
        } catch (e) {
            console.warn('[Fetch Quota Error]', e);
        }
    }

    async fetchAntigravityQuota() {
        try {
            const res = await fetch('/api/antigravity/quota');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                this.agyQuotaData = data;
                const acc = data.account || {};

                // 1. Tier and Credits
                if (this.agyTierVal) {
                    const creditsText = acc.promptCredits !== undefined ? ` • ${acc.promptCredits} cr` : '';
                    this.agyTierVal.textContent = `${acc.tier || 'Tier Pro'}${creditsText}`;
                }

                // 2. Active Account
                if (this.agyActiveAccVal) {
                    this.agyActiveAccVal.textContent = acc.email || acc.name || 'Google Profile';
                }

                // 3. 5-Hour Rolling Limit & Models Quota
                const models = data.modelQuotas || [];
                let activeResetModel = null;
                for (const m of models) {
                    if (m.resetHours > 0) {
                        if (!activeResetModel || m.resetHours < activeResetModel.resetHours) {
                            activeResetModel = m;
                        }
                    }
                }

                if (this.agy5hVal) {
                    if (activeResetModel) {
                        this.agy5hVal.textContent = `${activeResetModel.remainingPercent}% (Resets in ${activeResetModel.resetHours}h)`;
                        this.agy5hVal.className = activeResetModel.remainingPercent < 30 ? 'quota-stat-val val-rose' : 'quota-stat-val val-cyan';
                    } else {
                        this.agy5hVal.textContent = '100% (Available)';
                        this.agy5hVal.className = 'quota-stat-val val-emerald';
                    }
                }

                if (this.quotaResetCountdown) {
                    if (activeResetModel) {
                        this.quotaResetCountdown.textContent = `Resets in ${activeResetModel.resetHours}h (${activeResetModel.label})`;
                    } else {
                        this.quotaResetCountdown.textContent = `100% Quota Available`;
                    }
                }

                // 4. Render Model Quota Cards
                this.renderModelQuotas(models);
            }
        } catch (e) {
            console.warn('[Fetch Antigravity Quota Error]', e);
        }
    }

    renderModelQuotas(modelQuotas) {
        if (!this.agyModelsQuotaList) return;
        this.agyModelsQuotaList.innerHTML = '';

        if (!Array.isArray(modelQuotas) || modelQuotas.length === 0) {
            this.agyModelsQuotaList.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:6px;">No model quota information available</div>';
            return;
        }

        modelQuotas.forEach(m => {
            const card = document.createElement('div');
            card.className = 'model-quota-card';

            let badgeClass = 'gemini';
            let iconName = 'zap';
            if (m.family === 'claude') { badgeClass = 'claude'; iconName = 'cpu'; }
            else if (m.family === 'gpt') { badgeClass = 'gpt'; iconName = 'orbit'; }

            const iconSvg = window.TeleTermIcons ? window.TeleTermIcons.render(iconName, { size: 13, className: 'mq-icon' }) : '';

            let fillClass = 'high';
            if (m.remainingPercent < 25) fillClass = 'low';
            else if (m.remainingPercent < 60) fillClass = 'med';

            const resetText = m.resetHours > 0 ? `Resets in ${m.resetHours}h` : '100% Available';

            card.innerHTML = `
                <div class="mq-header">
                    <span class="mq-label" title="${m.label}">${iconSvg} ${m.label}</span>
                    <span class="mq-badge ${badgeClass}">${m.remainingPercent}%</span>
                </div>
                <div class="mq-progress-track">
                    <div class="mq-progress-fill ${fillClass}" style="width: ${m.remainingPercent}%;"></div>
                </div>
                <div class="mq-footer">
                    <span>${m.family.toUpperCase()}</span>
                    <span>${resetText}</span>
                </div>
            `;
            this.agyModelsQuotaList.appendChild(card);
        });
    }

    renderAccounts() {
        if (!this.accountsData) return;

        // 1. Google Antigravity Accounts
        const agyProfiles = Array.isArray(this.accountsData.antigravity)
            ? this.accountsData.antigravity
            : (this.accountsData.antigravity?.profiles || []);

        if (this.agyAccountsList) {
            this.agyAccountsList.innerHTML = '';
            if (agyProfiles.length === 0) {
                this.agyAccountsList.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:8px;">No Antigravity accounts detected</div>';
            }

            agyProfiles.forEach(acc => {
                const card = document.createElement('div');
                card.className = `acc-profile-card ${acc.isActive ? 'active' : ''}`;
                
                const checkSvg = window.TeleTermIcons ? window.TeleTermIcons.render('check', { size: 11, className: 'badge-icon' }) : '';
                const alertSvg = window.TeleTermIcons ? window.TeleTermIcons.render('alert-triangle', { size: 11, className: 'badge-icon' }) : '';
                const orbitSvg = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 15, color: '#00f0ff' }) : '';

                const tokenBadge = acc.hasSavedToken 
                    ? `<span class="acc-badge badge-green">${checkSvg} Saved Token</span>` 
                    : `<span class="acc-badge badge-yellow">${alertSvg} Needs Login</span>`;

                const activeTag = acc.isActive 
                    ? '<span class="acc-badge badge-active">ACTIVE</span>' 
                    : `<button class="btn-switch-acc" data-provider="antigravity" data-id="${acc.id}">Switch ⏎</button>`;

                if (acc.isActive && this.agyActiveAccVal) {
                    this.agyActiveAccVal.textContent = `${acc.email || acc.name}`;
                }

                card.innerHTML = `
                    <div class="acc-card-info">
                        <div class="acc-name-row">
                            <span class="acc-icon">${orbitSvg}</span>
                            <span class="acc-name">${acc.name || acc.email}</span>
                            ${activeTag}
                        </div>
                        <div class="acc-meta-row">
                            <span class="acc-email">${acc.email || ''}</span>
                            ${tokenBadge}
                        </div>
                    </div>
                `;

                const btnSwitch = card.querySelector('.btn-switch-acc');
                if (btnSwitch) {
                    btnSwitch.addEventListener('click', () => {
                        const autoRestart = this.chkAutoRestart ? this.chkAutoRestart.checked : false;
                        this.switchAccount('antigravity', acc.id, autoRestart);
                    });
                }

                this.agyAccountsList.appendChild(card);
            });
        }

        // 2. Claude AI Accounts
        const claudeProfiles = Array.isArray(this.accountsData.claude)
            ? this.accountsData.claude
            : (this.accountsData.claude?.profiles || []);

        if (this.claudeAccountsList) {
            this.claudeAccountsList.innerHTML = '';
            if (claudeProfiles.length === 0) {
                this.claudeAccountsList.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:8px;">No Claude accounts detected</div>';
            }

            claudeProfiles.forEach(acc => {
                const card = document.createElement('div');
                card.className = `acc-profile-card ${acc.isActive ? 'active' : ''}`;

                const cpuSvg = window.TeleTermIcons ? window.TeleTermIcons.render('cpu', { size: 15, color: '#00f0ff' }) : '';
                const activeTag = acc.isActive 
                    ? '<span class="acc-badge badge-active">ACTIVE</span>' 
                    : `<button class="btn-switch-acc" data-provider="claude" data-id="${acc.id}">Switch ⏎</button>`;

                card.innerHTML = `
                    <div class="acc-card-info">
                        <div class="acc-name-row">
                            <span class="acc-icon">${cpuSvg}</span>
                            <span class="acc-name">${acc.name || acc.email}</span>
                            ${activeTag}
                        </div>
                        <div class="acc-meta-row">
                            <span class="acc-email">${acc.email || ''}</span>
                        </div>
                    </div>
                `;

                const btnSwitch = card.querySelector('.btn-switch-acc');
                if (btnSwitch) {
                    btnSwitch.addEventListener('click', () => {
                        this.switchAccount('claude', acc.id, false);
                    });
                }

                this.claudeAccountsList.appendChild(card);
            });
        }
    }

    async switchAccount(provider, profileId, autoRestart = false) {
        this.vibrate(20);
        this.onToast(autoRestart ? 'Activating account & restarting Antigravity...' : 'Switching account...', 'info');

        try {
            const res = await fetch('/api/accounts/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    profileId,
                    autoRestartApp: autoRestart
                })
            });
            const data = await res.json();
            if (data.success) {
                this.vibrate(30);
                const accName = data.activeProfile?.name || profileId;
                if (data.appRestarted) {
                    this.onToast(`Switched to '${accName}' & restarted Antigravity!`, 'success');
                } else {
                    this.onToast(data.message || `Switched to '${accName}' successfully!`, 'success');
                }
                await this.refresh(false);
                if (this.onAccountSwitched) {
                    this.onAccountSwitched({ provider, profileId, profile: data.activeProfile });
                }
            } else {
                this.onToast(data.message || 'Error switching account', 'error');
            }
        } catch (e) {
            this.onToast('Connection error switching account: ' + e.message, 'error');
        }
    }

    open() {
        if (!this.modalEl) return;
        this.vibrate(10);
        this.modalEl.classList.remove('hidden');
        this.refresh(false);
    }

    close() {
        if (!this.modalEl) return;
        this.modalEl.classList.add('hidden');
    }
}
