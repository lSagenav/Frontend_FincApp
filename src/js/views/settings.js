/**
 * settings.js - Theme, voice, and app settings management
 */

import { showToast } from '../ui-utils.js';
import { setTTS, getTTSStatus } from '../voice-logic.js';
import { getPendingCount, startOfflineSync } from '../api.js';

// ===== THEME =====
export function loadTheme() {
    const saved = localStorage.getItem('fincapp_theme') || 'light';
    applyTheme(saved);
}

export function toggleTheme() {
    const current = localStorage.getItem('fincapp_theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('fincapp_theme', next);
}

function applyTheme(theme) {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        html.classList.add('dark');
        if (icon) { icon.classList.replace('fa-moon', 'fa-sun'); }
    } else {
        html.classList.remove('dark');
        if (icon) { icon.classList.replace('fa-sun', 'fa-moon'); }
    }
}

// ===== SETTINGS VIEW =====
export function renderSettings() {
    const ttsOn = getTTSStatus();
    const darkOn = localStorage.getItem('fincapp_theme') === 'dark';
    const apiKey = localStorage.getItem('fincapp_openai_key') || '';
    const pendingCount = getPendingCount();

    return `
    <div class="max-w-2xl mx-auto space-y-6">

        <div class="card">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <i class="fas fa-palette text-[var(--accent)]"></i> Appearance
            </h2>
            <div class="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
                <div>
                    <p class="font-semibold text-sm">Dark Mode</p>
                    <p class="text-xs text-[var(--text-secondary)]">Easier on the eyes at night</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="setting-dark-mode" ${darkOn ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <div class="card">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <i class="fas fa-microphone text-[var(--accent)]"></i> Voice Assistant
            </h2>
            <div class="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
                <div>
                    <p class="font-semibold text-sm">Voice Responses (TTS)</p>
                    <p class="text-xs text-[var(--text-secondary)]">The mic is always on — this controls spoken replies</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="setting-tts" ${ttsOn ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        

        <div class="card">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <i class="fas fa-wifi text-[var(--accent)]"></i> Offline Sync
            </h2>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold text-sm">Pending Records</p>
                    <p class="text-xs text-[var(--text-secondary)]">${pendingCount} record(s) waiting to sync</p>
                </div>
                <button id="btn-force-sync" class="btn-secondary flex items-center gap-2">
                    <i class="fas fa-rotate"></i> Sync Now
                </button>
            </div>
        </div>

        <div class="card border-red-200">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2 text-red-600">
                <i class="fas fa-triangle-exclamation"></i> Danger Zone
            </h2>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold text-sm">Clear All Local Data</p>
                    <p class="text-xs text-[var(--text-secondary)]">Removes offline cache (not server data)</p>
                </div>
                <button id="btn-clear-cache" class="btn-danger">Clear Cache</button>
            </div>
        </div>
    </div>
    `;
}

export function initSettingsLogic() {
    // Dark mode toggle
    document.getElementById('setting-dark-mode')?.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        localStorage.setItem('fincapp_theme', theme);
        // Update icon
        const icon = document.getElementById('theme-icon');
        if (e.target.checked) {
            document.documentElement.classList.add('dark');
            if (icon) { icon.classList.replace('fa-moon', 'fa-sun'); }
        } else {
            document.documentElement.classList.remove('dark');
            if (icon) { icon.classList.replace('fa-sun', 'fa-moon'); }
        }
    });

    // TTS toggle
    document.getElementById('setting-tts')?.addEventListener('change', (e) => {
        setTTS(e.target.checked);
        showToast(`Voice responses ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
    });

    // Save API Key
    document.getElementById('btn-save-api-key')?.addEventListener('click', () => {
        const key = document.getElementById('setting-api-key').value.trim();
        if (key && key.startsWith('sk-')) {
            localStorage.setItem('fincapp_openai_key', key);
            showToast('API key saved successfully', 'success');
        } else if (key === '') {
            localStorage.removeItem('fincapp_openai_key');
            showToast('API key removed', 'info');
        } else {
            showToast('Invalid API key format (must start with sk-)', 'error');
        }
    });

    // Force sync
    document.getElementById('btn-force-sync')?.addEventListener('click', async () => {
        if (!navigator.onLine) {
            showToast('No internet connection available', 'warning');
            return;
        }
        const btn = document.getElementById('btn-force-sync');
        btn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i> Syncing...';
        btn.disabled = true;
        const result = await startOfflineSync();
        btn.innerHTML = '<i class="fas fa-rotate mr-2"></i> Sync Now';
        btn.disabled = false;
        if (result.synced === 0 && result.pending === 0) {
            showToast('All records are already synced', 'info');
        }
    });

    // Clear cache
    document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
        if (confirm('Clear all local cache? Server data will not be affected.')) {
            const keysToKeep = ['fincapp_session', 'fincapp_theme', 'fincapp_tts', 'fincapp_openai_key'];
            Object.keys(localStorage).forEach(key => {
                if (!keysToKeep.includes(key)) localStorage.removeItem(key);
            });
            showToast('Local cache cleared', 'success');
        }
    });
}
