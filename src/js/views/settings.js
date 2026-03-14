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
    const user = JSON.parse(localStorage.getItem('fincapp_session') || '{}');

    return `
    <div class="max-w-2xl mx-auto space-y-6">

    <!-- User Profile -->
        <div class="card">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <i class="fas fa-user text-[var(--accent)]"></i> My Profile
            </h2>
            <div class="space-y-3">
                <div class="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
                    <p class="text-sm text-[var(--text-secondary)]">Full Name</p>
                    <p class="font-semibold text-sm">${user.full_name || '—'}</p>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
                    <p class="text-sm text-[var(--text-secondary)]">Email</p>
                    <p class="font-semibold text-sm">${user.email || '—'}</p>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
                    <p class="text-sm text-[var(--text-secondary)]">Farm</p>
                    <p class="font-semibold text-sm">${user.farm_name || '—'}</p>
                </div>
                <div class="flex items-center justify-between py-2">
                    <p class="text-sm text-[var(--text-secondary)]">Role</p>
                    <span class="${user.role === 'admin' ? 'badge-critical' : 'badge-safe'}">${user.role || 'farmer'}</span>
                </div>
            </div>
        </div>

        <!-- Change Password -->
        <div class="card">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <i class="fas fa-lock text-[var(--accent)]"></i> Change Password
            </h2>
            <div class="space-y-4">
                <div>
                    <label class="form-label">Current Password</label>
                    <input type="password" id="setting-current-password" class="form-input" placeholder="••••••••">
                </div>
                <div>
                    <label class="form-label">New Password</label>
                    <input type="password" id="setting-new-password" class="form-input" placeholder="Min 6 characters">
                </div>
                <div>
                    <label class="form-label">Confirm New Password</label>
                    <input type="password" id="setting-confirm-password" class="form-input" placeholder="Repeat new password">
                </div>
                <button id="btn-change-password" class="btn-primary w-full">
                    <i class="fas fa-key mr-2"></i> Update Password
                </button>
            </div>
        </div>

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

    // Change password
    document.getElementById('btn-change-password')?.addEventListener('click', async () => {
        const current = document.getElementById('setting-current-password').value;
        const newPass = document.getElementById('setting-new-password').value;
        const confirm = document.getElementById('setting-confirm-password').value;

        if (!current || !newPass || !confirm) {
            showToast('Please fill in all password fields', 'warning');
            return;
        }
        if (newPass !== confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (newPass.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('fincapp_session') || '{}');
            await apiService.put(`user/${user.id}/password`, {
                current_password: current,
                new_password: newPass
            });
            showToast('Password updated successfully!', 'success');
            document.getElementById('setting-current-password').value = '';
            document.getElementById('setting-new-password').value = '';
            document.getElementById('setting-confirm-password').value = '';
        } catch (err) {
            showToast('Failed to update password: ' + err.message, 'error');
        }
    });
}
