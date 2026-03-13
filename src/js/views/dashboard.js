/**
 * views/dashboard.js - FincApp Dashboard View
<<<<<<< HEAD
 * Shows KPI cards, weight trend chart, health alerts, and recent activity.
=======
 * KPIs, charts y actividad reciente con datos reales del backend.
 *
 * Endpoints usados:
 *   GET /api/sync                      → { animals, weights, health_records, farm_events }
 *   GET /api/analytics/health/alerts   → [{ alert_level, total }]
 *   GET /api/reports/animals-by-breed  → [{ breed, total }]
>>>>>>> master
 */

import { apiService, getLocal } from '../api.js';
import { calculateGDP } from '../calculations.js';
import { showToast } from '../ui-utils.js';
import { getCurrentUser, isAdmin } from '../auth.js';

<<<<<<< HEAD
=======
function destroyChart(id) { Chart.getChart(id)?.destroy(); }
function accent() { return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2d7a2d'; }

>>>>>>> master
export function renderDashboard() {
    const user = getCurrentUser();
    return `
    <div class="space-y-6">

        <!-- Welcome Banner -->
        <div class="card bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white border-0">
<<<<<<< HEAD
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p class="text-green-100 text-sm font-medium">Good day,</p>
                    <h2 class="text-2xl font-bold font-display">${user?.full_name || 'Farmer'} 👋</h2>
                    <p class="text-green-200 text-sm mt-1">${user?.farm_name || 'Your Farm'}</p>
                </div>
                <div class="text-right">
=======
            <div class="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                    <p class="text-green-100 text-sm font-medium">Good day,</p>
                    <h2 class="text-2xl font-bold">${user?.full_name || 'Farmer'} 👋</h2>
                    <p class="text-green-200 text-sm mt-1">${user?.farm_name || 'Your Farm'}</p>
                </div>
                <div class="text-right flex-shrink-0">
>>>>>>> master
                    <p class="text-green-200 text-xs uppercase font-bold">Today</p>
                    <p class="text-white font-bold" id="dashboard-date">--</p>
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
<<<<<<< HEAD
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards">
            <div class="stat-card">
                <p class="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Total Animals</p>
                <p class="text-3xl font-bold text-[var(--text-primary)]" id="kpi-total">--</p>
                <p class="text-xs text-[var(--text-secondary)]">In herd</p>
            </div>
            <div class="stat-card">
                <p class="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Health Alerts</p>
                <p class="text-3xl font-bold text-red-500" id="kpi-alerts">--</p>
                <p class="text-xs text-[var(--text-secondary)]">Need attention</p>
            </div>
            <div class="stat-card">
                <p class="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Avg ADG</p>
                <p class="text-3xl font-bold text-[var(--accent)]" id="kpi-adg">--</p>
                <p class="text-xs text-[var(--text-secondary)]">kg/day this month</p>
            </div>
            <div class="stat-card">
                <p class="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Vaccines Due</p>
                <p class="text-3xl font-bold text-amber-500" id="kpi-vaccines">--</p>
=======
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="stat-card !p-3 sm:!p-5">
                <p class="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Total Animals</p>
                <p class="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]" id="kpi-total">
                    <span class="inline-block w-8 h-6 bg-[var(--border-color)] rounded animate-pulse"></span>
                </p>
                <p class="text-xs text-[var(--text-secondary)]">In herd</p>
            </div>
            <div class="stat-card !p-3 sm:!p-5">
                <p class="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Health Alerts</p>
                <p class="text-2xl sm:text-3xl font-bold text-red-500" id="kpi-alerts">
                    <span class="inline-block w-8 h-6 bg-[var(--border-color)] rounded animate-pulse"></span>
                </p>
                <p class="text-xs text-[var(--text-secondary)]">Need attention</p>
            </div>
            <div class="stat-card !p-3 sm:!p-5">
                <p class="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Avg ADG</p>
                <p class="text-2xl sm:text-3xl font-bold text-[var(--accent)]" id="kpi-adg">
                    <span class="inline-block w-8 h-6 bg-[var(--border-color)] rounded animate-pulse"></span>
                </p>
                <p class="text-xs text-[var(--text-secondary)]">kg/day this month</p>
            </div>
            <div class="stat-card !p-3 sm:!p-5">
                <p class="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Vaccines Due</p>
                <p class="text-2xl sm:text-3xl font-bold text-[var(--warning)]" id="kpi-vaccines">
                    <span class="inline-block w-8 h-6 bg-[var(--border-color)] rounded animate-pulse"></span>
                </p>
>>>>>>> master
                <p class="text-xs text-[var(--text-secondary)]">Next 7 days</p>
            </div>
        </div>

<<<<<<< HEAD
        <!-- Charts Row -->
=======
        <!-- Charts -->
>>>>>>> master
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-chart-line text-[var(--accent)]"></i> Weight Trends
                </h3>
<<<<<<< HEAD
                <div class="h-52">
                    <canvas id="weightTrendChart"></canvas>
                </div>
            </div>
            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-chart-bar text-blue-500"></i> Health Distribution
                </h3>
                <div class="h-52">
                    <canvas id="healthDistChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Recent Alerts + Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-triangle-exclamation text-amber-500"></i> Upcoming Vaccines
                </h3>
                <div id="vaccine-alerts" class="space-y-2">
                    <div class="text-center py-6 text-[var(--text-secondary)] text-sm">
                        <i class="fas fa-spinner animate-spin text-xl mb-2 block"></i>
                        Loading...
=======
                <div class="h-40 sm:h-52"><canvas id="weightTrendChart"></canvas></div>
            </div>
            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-chart-bar text-[var(--accent)]"></i> Herd by Breed
                </h3>
                <div class="h-40 sm:h-52"><canvas id="healthDistChart"></canvas></div>
            </div>
        </div>

        <!-- Alerts + Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-triangle-exclamation text-amber-500"></i> Health Alerts
                </h3>
                <div id="vaccine-alerts" class="space-y-2">
                    <div class="text-center py-6 text-[var(--text-secondary)] text-sm">
                        <i class="fas fa-spinner animate-spin text-xl mb-2 block"></i> Loading...
>>>>>>> master
                    </div>
                </div>
                <button onclick="navigateTo('health')" class="btn-secondary w-full mt-4 text-xs">
                    View All Health Records <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
<<<<<<< HEAD

=======
>>>>>>> master
            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-clock-rotate-left text-[var(--accent)]"></i> Recent Activity
                </h3>
                <div id="recent-activity" class="space-y-2">
                    <div class="text-center py-6 text-[var(--text-secondary)] text-sm">
<<<<<<< HEAD
                        <i class="fas fa-spinner animate-spin text-xl mb-2 block"></i>
                        Loading...
=======
                        <i class="fas fa-spinner animate-spin text-xl mb-2 block"></i> Loading...
>>>>>>> master
                    </div>
                </div>
                <button onclick="navigateTo('activities')" class="btn-secondary w-full mt-4 text-xs">
                    View All Activities <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
<<<<<<< HEAD
    </div>
    `;
}

export async function initDashboardLogic() {
    // Set date
    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
        });
    }

    // Load data (API with local fallback)
    let animals = [];
    let activities = [];
    let vaccines = [];

    try {
        animals = await apiService.get('livestock');
    } catch {
        animals = getLocal('fincapp_livestock');
    }

    try {
        vaccines = await apiService.get('vaccines');
    } catch {
        vaccines = getLocal('fincapp_vaccines');
    }

    try {
        activities = await apiService.get('activities?limit=5');
    } catch {
        activities = getLocal('fincapp_activities').slice(-5);
    }

    // KPIs
    const kpiTotal = document.getElementById('kpi-total');
    if (kpiTotal) kpiTotal.textContent = animals.length;

    const criticalCount = animals.filter(a => a.status === 'critical').length;
    const kpiAlerts = document.getElementById('kpi-alerts');
    if (kpiAlerts) kpiAlerts.textContent = criticalCount;

    const today = new Date();
    const vaccinesDue = vaccines.filter(v => {
        const diff = (new Date(v.next_date) - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;
    const kpiVaccines = document.getElementById('kpi-vaccines');
    if (kpiVaccines) kpiVaccines.textContent = vaccinesDue;

    // Avg ADG mock calculation
    const kpiAdg = document.getElementById('kpi-adg');
    if (kpiAdg) kpiAdg.textContent = '0.72';

    // Charts
    renderWeightChart(animals);
    renderHealthChart(animals);

    // Vaccine alerts
    renderVaccineAlerts(vaccines);

    // Recent activity
    renderRecentActivity(activities);
}

function renderWeightChart(animals) {
    const ctx = document.getElementById('weightTrendChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Avg Weight (kg)',
                data: [385, 395, 402, 415, 428, 440],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2d7a2d',
                backgroundColor: 'rgba(45, 122, 45, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2d7a2d'
=======
    </div>`;
}

export async function initDashboardLogic() {
    // Fecha
    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    let animals = [], weights = [], healthRecords = [], events = [];
    let breedReport = [];

    // ── Carga principal via /api/sync ──────────────────────────────────────
    try {
        const sync = await apiService.get('sync');
        animals       = sync.animals        || [];
        weights       = sync.weights        || [];
        healthRecords = sync.health_records || [];
        events        = sync.farm_events    || [];

        // Persistir localmente para modo offline
        if (animals.length)       localStorage.setItem('fincapp_livestock',     JSON.stringify(animals));
        if (weights.length)       localStorage.setItem('fincapp_weights',        JSON.stringify(weights));
        if (healthRecords.length) localStorage.setItem('fincapp_health_records', JSON.stringify(healthRecords));
        if (events.length)        localStorage.setItem('fincapp_activities',     JSON.stringify(events));
    } catch {
        animals       = getLocal('fincapp_livestock');
        weights       = getLocal('fincapp_weights');
        healthRecords = getLocal('fincapp_health_records');
        events        = getLocal('fincapp_activities');
    }

    // ── Reporte por raza ───────────────────────────────────────────────────
    try {
        breedReport = await apiService.get('reports/animals-by-breed');
    } catch {
        const byBreed = {};
        animals.forEach(a => { const b = a.breed || 'Unknown'; byBreed[b] = (byBreed[b] || 0) + 1; });
        breedReport = Object.entries(byBreed).map(([breed, total]) => ({ breed, total }));
    }

    // ── KPI: Total animales ────────────────────────────────────────────────
    setKPI('kpi-total', animals.length);

    // ── KPI: Alertas críticas ──────────────────────────────────────────────
    let criticalCount = animals.filter(a => a.status === 'critical').length;
    try {
        const alertsReport = await apiService.get('analytics/health/alerts');
        const fromHealth   = alertsReport.find(r => r.alert_level === 'critical')?.total || 0;
        criticalCount      = Math.max(criticalCount, fromHealth);
    } catch { /* usa el conteo de animals */ }
    setKPI('kpi-alerts', criticalCount);

    // ── KPI: ADG promedio ──────────────────────────────────────────────────
    const adg = calcAvgADG(weights);
    setKPI('kpi-adg', adg !== null ? adg.toFixed(2) : '—');

    // ── KPI: Vacunas próximas ──────────────────────────────────────────────
    const today = new Date();
    const vaccinesDue = healthRecords.filter(h => {
        if (h.alert_level === 'warning' || h.alert_level === 'critical') return true;
        const due = h.next_vaccination_date || h.event_date;
        if (!due) return false;
        const diff = (new Date(due) - today) / 86400000;
        return diff >= 0 && diff <= 7;
    }).length;
    setKPI('kpi-vaccines', vaccinesDue);

    // ── Charts ────────────────────────────────────────────────────────────
    renderWeightChart(weights);
    renderBreedChart(breedReport, animals);

    // ── Listas ────────────────────────────────────────────────────────────
    renderHealthAlerts(healthRecords, animals, today);
    renderRecentActivity(events);
}

function setKPI(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '—';
}

// ADG promedio: toma los últimos 2 registros de peso por animal
function calcAvgADG(weights) {
    if (!weights?.length) return null;
    const byAnimal = {};
    weights.forEach(w => {
        const id = w.animal_id;
        if (!byAnimal[id]) byAnimal[id] = [];
        byAnimal[id].push(w);
    });
    const adgs = [];
    Object.values(byAnimal).forEach(logs => {
        if (logs.length < 2) return;
        logs.sort((a, b) => new Date(b.weighing_date || b.created_at) - new Date(a.weighing_date || a.created_at));
        const r = calculateGDP(
            parseFloat(logs[0].current_weight),
            parseFloat(logs[1].current_weight),
            logs[1].weighing_date || logs[1].created_at,
            logs[0].weighing_date || logs[0].created_at
        );
        if (r.gdp != null && !isNaN(r.gdp)) adgs.push(r.gdp);
    });
    if (!adgs.length) return null;
    return adgs.reduce((a, b) => a + b, 0) / adgs.length;
}

// ── Chart: Weight Trends ────────────────────────────────────────────────────
function renderWeightChart(weights) {
    destroyChart('weightTrendChart');
    const ctx = document.getElementById('weightTrendChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    const isMobile = window.innerWidth < 640;
    const ac = accent();

    // Agrupar pesos por mes
    const byMonth = {};
    weights.forEach(w => {
        const d = new Date(w.weighing_date || w.created_at);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(parseFloat(w.current_weight) || 0);
    });

    const months = getLast6Months();
    const labels = months.map(m => m.label);
    const data   = months.map(m => {
        const vals = byMonth[m.key];
        if (!vals?.length) return null;
        return parseFloat((vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1));
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Avg Weight (kg)',
                data,
                borderColor: ac,
                backgroundColor: 'rgba(45,122,45,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: ac,
                spanGaps: true,
>>>>>>> master
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
<<<<<<< HEAD
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { beginAtZero: false, ticks: { font: { size: 11 } } }
=======
                x: { grid: { display: false }, ticks: { font: { size: isMobile ? 9 : 11 } } },
                y: { beginAtZero: false,       ticks: { font: { size: isMobile ? 9 : 11 } } }
>>>>>>> master
            }
        }
    });
}

<<<<<<< HEAD
function renderHealthChart(animals) {
    const ctx = document.getElementById('healthDistChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    const safe = animals.filter(a => a.status === 'healthy' || a.status === 'safe').length || Math.max(1, animals.length - 2);
    const warning = animals.filter(a => a.status === 'warning').length || 1;
    const critical = animals.filter(a => a.status === 'critical').length || 1;
=======
function getLast6Months() {
    const out = [], now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({
            key:   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
            label: d.toLocaleDateString('en-US', { month: 'short' })
        });
    }
    return out;
}

// ── Chart: Herd by Breed ────────────────────────────────────────────────────
function renderBreedChart(breedReport, animals) {
    destroyChart('healthDistChart');
    const ctx = document.getElementById('healthDistChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    const isMobile = window.innerWidth < 640;
    let rows = breedReport.length ? breedReport : (() => {
        const m = {};
        animals.forEach(a => { const b = a.breed || 'Unknown'; m[b] = (m[b]||0)+1; });
        return Object.entries(m).map(([breed,total]) => ({ breed, total }));
    })();
    rows = rows.sort((a,b) => b.total - a.total).slice(0, 5);
    if (!rows.length) rows = [{ breed: 'No data', total: 1 }];

    const COLORS = ['#2d7a2d','#16a34a','#4ade80','#86efac','#d97706'];
>>>>>>> master

    new Chart(ctx, {
        type: 'doughnut',
        data: {
<<<<<<< HEAD
            labels: ['Healthy', 'Warning', 'Critical'],
            datasets: [{
                data: [safe, warning, critical],
                backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
=======
            labels: rows.map(r => r.breed),
            datasets: [{
                data: rows.map(r => r.total),
                backgroundColor: COLORS.slice(0, rows.length),
>>>>>>> master
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
<<<<<<< HEAD
                    position: 'bottom',
                    labels: { padding: 16, font: { size: 11 }, usePointStyle: true }
=======
                    position: isMobile ? 'bottom' : 'right',
                    labels: { padding: isMobile ? 10 : 16, font: { size: isMobile ? 9 : 11 }, usePointStyle: true }
>>>>>>> master
                }
            }
        }
    });
}

<<<<<<< HEAD
function renderVaccineAlerts(vaccines) {
    const container = document.getElementById('vaccine-alerts');
    if (!container) return;

    const today = new Date();
    const upcoming = vaccines
        .map(v => ({ ...v, daysLeft: Math.ceil((new Date(v.next_date) - today) / (1000 * 60 * 60 * 24)) }))
        .filter(v => v.daysLeft <= 14)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 4);

    if (upcoming.length === 0) {
        container.innerHTML = `
            <div class="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <i class="fas fa-check-circle text-green-500"></i>
                <p class="text-sm text-green-700 font-medium">All vaccines are up to date</p>
=======
// ── Health Alerts ───────────────────────────────────────────────────────────
function renderHealthAlerts(healthRecords, animals, today) {
    const container = document.getElementById('vaccine-alerts');
    if (!container) return;

    const alerts = [];

    healthRecords.forEach(h => {
        const level = h.alert_level || 'safe';
        if (level === 'safe') return;
        const due = h.next_vaccination_date || h.event_date;
        const daysLeft = due
            ? Math.ceil((new Date(due) - today) / 86400000)
            : (level === 'critical' ? -1 : 3);
        alerts.push({
            title:    `Animal #${h.animal_id || '—'}`,
            subtitle: h.medication_name || h.vaccine_name || h.ai_diagnosis || 'Health record',
            daysLeft, level,
        });
    });

    animals.filter(a => a.status === 'critical').forEach(a => {
        if (!alerts.find(al => al.title.includes(a.id))) {
            alerts.push({
                title:    `Animal #${a.tag_number || a.id}`,
                subtitle: a.breed || 'Critical status',
                daysLeft: -1,
                level:    'critical',
            });
        }
    });

    if (!alerts.length) {
        container.innerHTML = `
            <div class="flex items-center gap-3 p-3 bg-[var(--accent-light)] rounded-xl border border-[var(--border-color)]">
                <i class="fas fa-check-circle text-[var(--accent)]"></i>
                <p class="text-sm text-[var(--text-primary)] font-medium">All animals are healthy</p>
>>>>>>> master
            </div>`;
        return;
    }

<<<<<<< HEAD
    container.innerHTML = upcoming.map(v => {
        const isOverdue = v.daysLeft < 0;
        const isSoon = v.daysLeft <= 3;
        const badgeClass = isOverdue ? 'badge-critical' : isSoon ? 'badge-warning' : 'badge-safe';
        const label = isOverdue ? `${Math.abs(v.daysLeft)}d overdue` : v.daysLeft === 0 ? 'Today' : `${v.daysLeft}d left`;

        return `
        <div class="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-xl vaccine-card-${isOverdue ? 'overdue' : isSoon ? 'soon' : 'ok'}">
            <div>
                <p class="text-sm font-semibold">Animal #${v.animal_tag || v.animal_id}</p>
                <p class="text-xs text-[var(--text-secondary)]">${v.vaccine_name || 'Vaccine'}</p>
            </div>
            <span class="${badgeClass}">${label}</span>
=======
    alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    container.innerHTML = alerts.slice(0, 4).map(a => {
        const isOverdue = a.daysLeft < 0;
        const isSoon    = a.daysLeft <= 3;
        const badge  = isOverdue ? 'badge-critical' : isSoon ? 'badge-warning' : 'badge-safe';
        const label  = isOverdue ? `${Math.abs(a.daysLeft)}d overdue` : a.daysLeft === 0 ? 'Today' : `${a.daysLeft}d left`;
        return `
        <div class="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-xl">
            <div class="min-w-0 flex-1 mr-2">
                <p class="text-sm font-semibold truncate">${a.title}</p>
                <p class="text-xs text-[var(--text-secondary)] truncate">${a.subtitle}</p>
            </div>
            <span class="${badge} flex-shrink-0">${label}</span>
>>>>>>> master
        </div>`;
    }).join('');
}

<<<<<<< HEAD
function renderRecentActivity(activities) {
=======
// ── Recent Activity ─────────────────────────────────────────────────────────
function renderRecentActivity(events) {
>>>>>>> master
    const container = document.getElementById('recent-activity');
    if (!container) return;

    const icons = {
<<<<<<< HEAD
        'Bath': 'fa-shower', 'Feed': 'fa-seedling', 'Weight': 'fa-weight-scale',
        'Vaccine': 'fa-syringe', 'Repair': 'fa-wrench', 'Birth': 'fa-baby',
        'default': 'fa-circle-dot'
    };

    if (activities.length === 0) {
=======
        'Bath':'fa-shower','Feed':'fa-seedling','Weight':'fa-weight-scale',
        'Vaccine':'fa-syringe','Repair':'fa-wrench','Birth':'fa-baby',
        'Health':'fa-heart-pulse','default':'fa-circle-dot'
    };

    if (!events.length) {
>>>>>>> master
        container.innerHTML = `<p class="text-center text-[var(--text-secondary)] text-sm py-6">No recent activities</p>`;
        return;
    }

<<<<<<< HEAD
    container.innerHTML = activities.slice(0, 5).map(a => {
        const icon = icons[a.event_type] || icons.default;
        const date = a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
=======
    const sorted = [...events]
        .sort((a, b) => new Date(b.created_at || b.event_date || 0) - new Date(a.created_at || a.event_date || 0))
        .slice(0, 5);

    container.innerHTML = sorted.map(a => {
        const icon = icons[a.event_type] || icons.default;
        const date = (a.created_at || a.event_date)
            ? new Date(a.created_at || a.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Recent';
>>>>>>> master
        return `
        <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-main)] transition">
            <div class="w-8 h-8 bg-[var(--accent-light)] rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="fas ${icon} text-[var(--accent)] text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
<<<<<<< HEAD
                <p class="text-sm font-medium truncate">${a.description || a.event_type}</p>
                <p class="text-xs text-[var(--text-secondary)]">Animal #${a.animal_id} · ${date}</p>
            </div>
        </div>`;
    }).join('');
}
=======
                <p class="text-sm font-medium truncate">${a.description || a.event_type || 'Activity'}</p>
                <p class="text-xs text-[var(--text-secondary)]">Animal #${a.animal_id || '—'} · ${date}</p>
            </div>
        </div>`;
    }).join('');
}
>>>>>>> master
