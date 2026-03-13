/**
 * api.js - FincApp Centralized API Service
 * Handles all HTTP communication with offline-first fallback.
 * Supports both Flask (Python) and Express (Node.js) backends.
 */

const BASE_URL = 'http://localhost:3000/api';
const PYTHON_URL = 'http://localhost:5000/api';
const OFFLINE_QUEUE_KEY = 'fincapp_offline_queue';

export const ENDPOINTS = {
    animals:       'animals',
    user:          'user',
    weights:       'weights',
    farmEvents:    'farm-events',
    healthRecords: 'health-records',
    vaccines:      'vaccines',
    analytics:     'analytics',
    reports:       'reports',
    sync:          'sync'
};

// ===== CORE API SERVICE =====
export const apiService = {
    async get(endpoint) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            headers: authHeaders()
        });
        if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.status}`);
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`POST ${endpoint} failed: ${response.status}`);
        return response.json();
    },

    async put(endpoint, data) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`PUT ${endpoint} failed: ${response.status}`);
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
        return response.json();
    }
};

// ===== OFFLINE-FIRST WRAPPER =====
/**
 * Wraps a POST/PUT with offline fallback.
 * If offline, saves to queue and syncs when back online.
 */
export async function offlinePost(endpoint, data, localKey = null) {
    if (!navigator.onLine) {
        queueForSync(endpoint, 'POST', data);
        if (localKey) saveLocal(localKey, data);
        return { status: 'queued', offline: true, data };
    }
    try {
        return await apiService.post(endpoint, data);
    } catch (err) {
        queueForSync(endpoint, 'POST', data);
        if (localKey) saveLocal(localKey, data);
        return { status: 'queued', offline: true, data };
    }
}

// ===== LOCAL STORAGE HELPERS =====
export function saveLocal(key, data) {
    try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ ...data, _id: Date.now(), _created: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) { console.warn('LocalStorage save failed:', e); }
}

export function getLocal(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
}

export function updateLocal(key, id, updates) {
    const items = getLocal(key);
    const idx = items.findIndex(i => i.id === id || i._id === id);
    if (idx >= 0) {
        items[idx] = { ...items[idx], ...updates };
        localStorage.setItem(key, JSON.stringify(items));
    }
}

export function deleteLocal(key, id) {
    const items = getLocal(key).filter(i => i.id !== id && i._id !== id);
    localStorage.setItem(key, JSON.stringify(items));
}

// ===== SYNC QUEUE =====
function queueForSync(endpoint, method, data) {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push({ endpoint, method, data, timestamp: new Date().toISOString() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    updateOfflineBadge();
}

export async function startOfflineSync() {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return { synced: 0, pending: 0 };

    console.log(`[Sync] Processing ${queue.length} queued records...`);
    let synced = 0;
    const failed = [];

    for (const item of queue) {
        try {
            if (item.method === 'POST') {
                await apiService.post(item.endpoint, item.data);
            } else if (item.method === 'PUT') {
                await apiService.put(item.endpoint, item.data);
            }
            synced++;
        } catch {
            failed.push(item);
        }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
    updateOfflineBadge();

    if (synced > 0) {
        const { showToast } = await import('./ui-utils.js');
        showToast(`✓ Synced ${synced} record${synced > 1 ? 's' : ''} to server`, 'success');
    }

    return { synced, pending: failed.length };
}

export function getPendingCount() {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]').length;
}

function updateOfflineBadge() {
    const count = getPendingCount();
    const badge = document.getElementById('offline-badge');
    const countEl = document.getElementById('offline-count');
    if (badge && countEl) {
        countEl.textContent = count;
        badge.classList.toggle('hidden', count === 0);
        badge.classList.toggle('flex', count > 0);
    }
}

// ===== PYTHON BACKEND (Flask) =====
export async function saveToPython(data) {
    try {
        const res = await fetch(`${PYTHON_URL}/livestock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Python backend error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn('[Python] Backend unavailable, saving locally');
        saveLocal('fincapp_livestock', data);
        return { status: 'queued', offline: true };
    }
}

export async function fetchFromPython() {
    try {
        const res = await fetch(`${PYTHON_URL}/livestock`, { headers: authHeaders() });
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return getLocal('fincapp_livestock');
    }
}

// ===== CONNECTION STATUS =====
export function updateOnlineStatus() {
    const status = document.getElementById('sync-status');
    const dot = document.getElementById('sync-dot');
    const text = document.getElementById('sync-text');
    if (!status) return;

    if (navigator.onLine) {
        status.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold';
        dot.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
        text.textContent = 'ONLINE';
    } else {
        status.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold';
        dot.className = 'w-2 h-2 rounded-full bg-amber-500';
        text.textContent = 'OFFLINE';
    }

    updateOfflineBadge();
}

// ===== HELPERS =====
function authHeaders() {
    const session = JSON.parse(localStorage.getItem('fincapp_session') || '{}');
    const token = session.token || session.user?.token;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}
