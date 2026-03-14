/**
 * views/admin.js - Admin Panel (role-protected)
 */
import { apiService, getLocal } from '../api.js';
import { requireRole, isAdmin } from '../auth.js';
import { showToast } from '../ui-utils.js';
import { speak } from '../voice-logic.js';

export function renderAdmin() {
    if (!isAdmin()) {
        return `<div class="card text-center py-20">
            <i class="fas fa-shield-halved text-4xl text-red-400 mb-4"></i>
            <p class="font-bold text-lg">Access Denied</p>
            <p class="text-sm text-[var(--text-secondary)] mt-1">Admin role required</p>
        </div>`;
    }

    return `
    <div class="space-y-6">
        <div>
            <h2 class="text-xl font-bold">Admin Panel</h2>
            <p class="text-sm text-[var(--text-secondary)]">System overview and user management</p>
        </div>

        <!-- Farm-wide Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats">
            <div class="stat-card"><p class="text-xs font-bold text-[var(--text-secondary)] uppercase">Total Users</p>
                <p class="text-3xl font-bold" id="stat-users">—</p></div>
            <div class="stat-card"><p class="text-xs font-bold text-[var(--text-secondary)] uppercase">Total Animals</p>
                <p class="text-3xl font-bold text-[var(--accent)]" id="stat-animals">—</p></div>
            <div class="stat-card"><p class="text-xs font-bold text-[var(--text-secondary)] uppercase">Total Activities</p>
                <p class="text-3xl font-bold text-blue-500" id="stat-activities">—</p></div>
            <div class="stat-card"><p class="text-xs font-bold text-[var(--text-secondary)] uppercase">Health Alerts</p>
                <p class="text-3xl font-bold text-red-500" id="stat-alerts">—</p></div>
        </div>

        <!-- Filters -->
        <div class="card">
            <h3 class="font-bold text-sm mb-4">Filter Records</h3>
            <div class="flex flex-wrap gap-3">
                <select id="admin-filter-farm" class="form-input w-44">
                    <option value="">All Farms</option>
                </select>
                <select id="admin-filter-worker" class="form-input w-44">
                    <option value="">All Workers</option>
                </select>
                <select id="admin-filter-section" class="form-input w-44">
                    <option value="users">Users</option>
                    <option value="livestock">Livestock</option>
                    <option value="health">Health</option>
                    <option value="activities">Activities</option>
                    <option value="weights">Weights</option>
                </select>
            </div>
        </div>

        <!-- Dynamic Table -->
        <div class="card p-0 overflow-hidden" id="admin-table-container">
            <div class="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 class="font-bold text-sm" id="admin-table-title">User Management</h3>
            </div>
            <div class="overflow-x-auto">
                <div id="admin-table-body">
                    <div class="text-center py-8 text-[var(--text-secondary)] text-sm">
                        <i class="fas fa-spinner animate-spin text-xl mb-2 block"></i>
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

export async function initAdminLogic() {
    if (!isAdmin()) return;

    let users = [], animals = [], activities = [], healthRecords = [], weights = [];

    const [usersResult, animalsResult, activitiesResult, healthResult, weightsResult] = await Promise.allSettled([
        apiService.get('user'),
        apiService.get('animals'),
        apiService.get('farm-events'),
        apiService.get('health-records'),
        apiService.get('weights')
    ]);

    users = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) ? usersResult.value : [];
    animals = animalsResult.status === 'fulfilled' && Array.isArray(animalsResult.value) ? animalsResult.value : getLocal('fincapp_livestock');
    activities = activitiesResult.status === 'fulfilled' && Array.isArray(activitiesResult.value) ? activitiesResult.value : getLocal('fincapp_activities');
    healthRecords = healthResult.status === 'fulfilled' && Array.isArray(healthResult.value) ? healthResult.value : getLocal('fincapp_health_records');
    weights = weightsResult.status === 'fulfilled' && Array.isArray(weightsResult.value) ? weightsResult.value : getLocal('fincapp_weights');

    // Stats
    const statUsers = document.getElementById('stat-users');
    const statAnimals = document.getElementById('stat-animals');
    const statActivities = document.getElementById('stat-activities');
    const statAlerts = document.getElementById('stat-alerts');

    if (statUsers) statUsers.textContent = users.length;
    if (statAnimals) statAnimals.textContent = animals.length;
    if (statActivities) statActivities.textContent = activities.length;
    if (statAlerts) statAlerts.textContent = healthRecords.filter(r => r.alert_level === 'high').length;

    // Populate farm filter
    const farmFilter = document.getElementById('admin-filter-farm');
    if (farmFilter) {
        const farms = [...new Set(users.map(u => u.farm_name).filter(Boolean))];
        farms.forEach(farm => {
            const opt = document.createElement('option');
            opt.value = farm;
            opt.textContent = farm;
            farmFilter.appendChild(opt);
        });
    }

    // Populate worker filter
    const workerFilter = document.getElementById('admin-filter-worker');
    if (workerFilter) {
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.full_name;
            workerFilter.appendChild(opt);
        });
    }

    // ===== RENDER FUNCTIONS =====
    const getFilters = () => ({
        farm: document.getElementById('admin-filter-farm')?.value || '',
        worker: document.getElementById('admin-filter-worker')?.value || '',
        section: document.getElementById('admin-filter-section')?.value || 'users'
    });

    function renderCurrentSection() {
        const { farm, worker, section } = getFilters();

        const farmUserIds = farm
            ? users.filter(u => u.farm_name === farm).map(u => String(u.id))
            : null;

        let filteredUsers = users.filter(u =>
            (!farm || u.farm_name === farm) &&
            (!worker || String(u.id) === String(worker))
        );

        const filterRecords = (records) => records.filter(r => {
            const matchesFarm = !farmUserIds || farmUserIds.includes(String(r.user_id));
            const matchesWorker = !worker || String(r.user_id) === String(worker);
            return matchesFarm && matchesWorker;
        });

        const title = document.getElementById('admin-table-title');
        const container = document.getElementById('admin-table-body');
        if (!container) return;

        switch (section) {
            case 'users':
                if (title) title.textContent = `User Management (${filteredUsers.length})`;
                renderUsersTable(filteredUsers, container);
                break;
            case 'livestock':
                if (title) title.textContent = `Livestock (${filterRecords(animals).length})`;
                renderAnimalsTable(filterRecords(animals), container);
                break;
            case 'health':
                if (title) title.textContent = `Health Records (${filterRecords(healthRecords).length})`;
                renderHealthTable(filterRecords(healthRecords), container);
                break;
            case 'activities':
                if (title) title.textContent = `Farm Activities (${filterRecords(activities).length})`;
                renderActivitiesTable(filterRecords(activities), container);
                break;
            case 'weights':
                if (title) title.textContent = `Weight Logs (${filterRecords(weights).length})`;
                renderWeightsTable(filterRecords(weights), container);
                break;
        }
    }

    function renderUsersTable(data, container) {
        if (data.length === 0) {
            container.innerHTML = `<p class="text-center py-6 text-[var(--text-secondary)] text-sm">No users found</p>`;
            return;
        }
        container.innerHTML = `<table class="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Farm</th><th>Role</th><th>Joined</th><th class="text-right">Actions</th></tr></thead>
        <tbody>${data.map(u => `
        <tr>
            <td class="font-semibold">${u.full_name || '—'}</td>
            <td class="text-[var(--text-secondary)]">${u.email}</td>
            <td>${u.farm_name || '—'}</td>
            <td><span class="${u.role === 'admin' ? 'badge-critical' : 'badge-safe'}">${u.role}</span></td>
            <td class="text-[var(--text-secondary)]">${u.created_at ? new Date(u.created_at).toLocaleDateString('en-US') : '—'}</td>
            <td class="text-right">
                <button onclick="deleteUser(${u.id})" class="btn-danger text-xs">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>`).join('')}</tbody>
    </table>`;
    }

    function renderAnimalsTable(data, container) {
        if (data.length === 0) {
            container.innerHTML = `<p class="text-center py-6 text-[var(--text-secondary)] text-sm">No animals found</p>`;
            return;
        }
        container.innerHTML = `<table class="data-table">
        <thead><tr><th>Tag</th><th>Breed</th><th>Birth Date</th><th>Status</th><th>Owner ID</th></tr></thead>
        <tbody>${data.map(a => `
        <tr>
            <td class="font-bold">#${a.tag_number}</td>
            <td>${a.breed || '—'}</td>
            <td>${a.birth_date ? new Date(a.birth_date).toLocaleDateString('en-US') : '—'}</td>
            <td><span class="${a.status === 'critical' ? 'badge-critical' : a.status === 'warning' ? 'badge-warning' : 'badge-safe'}">${a.status || 'healthy'}</span></td>
            <td class="text-[var(--text-secondary)]">${a.user_id || '—'}</td>
        </tr>`).join('')}</tbody>
    </table>`;
    }

    function renderHealthTable(data, container) {
        if (data.length === 0) {
            container.innerHTML = `<p class="text-center py-6 text-[var(--text-secondary)] text-sm">No health records found</p>`;
            return;
        }
        container.innerHTML = `<table class="data-table">
        <thead><tr><th>Animal</th><th>Medication</th><th>Alert Level</th><th>Date</th></tr></thead>
        <tbody>${data.map(r => `
        <tr>
            <td class="font-bold">#${r.animal_id}</td>
            <td>${r.medication_name || '—'}</td>
            <td><span class="${r.alert_level === 'high' ? 'badge-critical' : r.alert_level === 'medium' ? 'badge-warning' : 'badge-safe'}">${r.alert_level || 'low'}</span></td>
            <td class="text-[var(--text-secondary)]">${r.event_date ? new Date(r.event_date).toLocaleDateString('en-US') : '—'}</td>
        </tr>`).join('')}</tbody>
    </table>`;
    }

    function renderActivitiesTable(data, container) {
        if (data.length === 0) {
            container.innerHTML = `<p class="text-center py-6 text-[var(--text-secondary)] text-sm">No activities found</p>`;
            return;
        }
        container.innerHTML = `<table class="data-table">
        <thead><tr><th>Animal</th><th>Type</th><th>Description</th><th>Date</th></tr></thead>
        <tbody>${data.map(a => `
        <tr>
            <td class="font-bold">#${a.animal_id || '—'}</td>
            <td>${a.event_type || '—'}</td>
            <td>${a.description || '—'}</td>
            <td class="text-[var(--text-secondary)]">${a.created_at ? new Date(a.created_at).toLocaleDateString('en-US') : '—'}</td>
        </tr>`).join('')}</tbody>
    </table>`;
    }

    function renderWeightsTable(data, container) {
        if (data.length === 0) {
            container.innerHTML = `<p class="text-center py-6 text-[var(--text-secondary)] text-sm">No weight records found</p>`;
            return;
        }
        container.innerHTML = `<table class="data-table">
        <thead><tr><th>Animal</th><th>Weight (kg)</th><th>Date</th><th>Recorded By</th></tr></thead>
        <tbody>${data.map(w => `
        <tr>
            <td class="font-bold">#${w.animal_id}</td>
            <td>${w.current_weight} kg</td>
            <td class="text-[var(--text-secondary)]">${w.weighing_date ? new Date(w.weighing_date).toLocaleDateString('en-US') : '—'}</td>
            <td class="text-[var(--text-secondary)]">${w.user_id || '—'}</td>
        </tr>`).join('')}</tbody>
    </table>`;
    }

    // ===== EVENT LISTENERS =====
    document.getElementById('admin-filter-farm')?.addEventListener('change', renderCurrentSection);
    document.getElementById('admin-filter-worker')?.addEventListener('change', renderCurrentSection);
    document.getElementById('admin-filter-section')?.addEventListener('change', renderCurrentSection);

    // Delete user
    window.deleteUser = async (id) => {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        try {
            await apiService.delete(`user/${id}`);
            showToast('User deleted', 'info');
            speak('User removed from the system');
            users = users.filter(u => u.id !== id);
            if (statUsers) statUsers.textContent = users.length;
            renderCurrentSection();
        } catch (err) {
            showToast('Delete failed: ' + err.message, 'error');
        }
    };

    // Initial render
    renderCurrentSection();
}
