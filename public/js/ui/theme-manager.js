/**
 * TELETERM — CLAUDE.AI MINIMALIST THEME ENGINE
 * Provides instant, zero-reload Dark / Light theme switching with localStorage persistence,
 * synchronized cross-subsystem updates (Top Nav, Modals, Terminal, ADE Studio, 3D World lighting).
 */

export class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.themeToggleBtn = null;
        this.themeToggleIcon = null;
        this.themeToggleText = null;
        this.gfxThemeSelect = null;

        this.init();
    }

    getStoredTheme() {
        try {
            const saved = localStorage.getItem('teleterm_theme');
            if (saved === 'light' || saved === 'dark') {
                return saved;
            }
        } catch (e) {}
        return 'dark'; // Default Claude Obsidian Dark
    }

    init() {
        // Apply theme immediately to <html> root
        this.applyTheme(this.currentTheme, false);

        // Bind DOM after DOMContentLoaded or immediately if ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindUI());
        } else {
            this.bindUI();
        }
    }

    bindUI() {
        this.themeToggleBtn = document.getElementById('btn-theme-toggle');
        this.themeToggleIcon = document.getElementById('theme-toggle-icon');
        this.themeToggleText = document.getElementById('theme-toggle-text');
        this.gfxThemeSelect = document.getElementById('gfx-theme-select');

        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });
        }

        if (this.gfxThemeSelect) {
            this.gfxThemeSelect.value = this.currentTheme;
            this.gfxThemeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        this.updateUIState();
    }

    toggle() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
    }

    setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') theme = 'dark';
        this.currentTheme = theme;

        try {
            localStorage.setItem('teleterm_theme', theme);
        } catch (e) {}

        this.applyTheme(theme, true);
        this.updateUIState();
    }

    applyTheme(theme, isUserAction = false) {
        document.documentElement.setAttribute('data-theme', theme);
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
            if (theme === 'light') {
                document.body.classList.add('theme-light');
                document.body.classList.remove('theme-dark');
            } else {
                document.body.classList.add('theme-dark');
                document.body.classList.remove('theme-light');
            }
        }

        // Notify 3D World if initialized
        if (typeof window !== 'undefined') {
            if (window.openWorld3D && typeof window.openWorld3D.setTheme === 'function') {
                window.openWorld3D.setTheme(theme);
            }

            // Sync with ADE Studio iframe if open
            const adeFrame = document.getElementById('ade-studio-frame');
            if (adeFrame && adeFrame.contentWindow) {
                try {
                    adeFrame.contentWindow.postMessage({ type: 'teleterm:set-theme', theme }, '*');
                    if (adeFrame.contentDocument?.documentElement) {
                        adeFrame.contentDocument.documentElement.setAttribute('data-theme', theme);
                    }
                } catch (e) {}
            }

            // Dispatch global event for other components
            window.dispatchEvent(new CustomEvent('teleterm:theme-changed', {
                detail: { theme, isUserAction }
            }));
        }
    }

    updateUIState() {
        const isDark = this.currentTheme === 'dark';
        if (this.themeToggleIcon) {
            if (window.TeleTermIcons) {
                this.themeToggleIcon.innerHTML = window.TeleTermIcons.render(isDark ? 'moon' : 'sun', { size: 16 });
                window.TeleTermIcons.hydrate(this.themeToggleIcon);
            } else {
                this.themeToggleIcon.innerHTML = `<span class="tt-icon tt-icon-16" data-icon="${isDark ? 'moon' : 'sun'}"></span>`;
            }
        }
        if (this.themeToggleText) {
            this.themeToggleText.textContent = isDark ? 'Dark' : 'Light';
        }
        if (this.themeToggleBtn) {
            this.themeToggleBtn.setAttribute('title', isDark ? 'Switch to Claude Paper Cream (Light)' : 'Switch to Claude Obsidian (Dark)');
        }
        if (this.gfxThemeSelect) {
            this.gfxThemeSelect.value = this.currentTheme;
        }
    }
}

// Create singleton instance and export
export const themeManager = new ThemeManager();
if (typeof window !== 'undefined') {
    window.themeManager = themeManager;
}
