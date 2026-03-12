/**
 * views/dashboard.js - FincApp Dashboard View
 * Shows KPI cards, weight trend chart, health alerts, and recent activity.
 */

import { apiService, getLocal } from '../api.js';
import { calculateGDP } from '../calculations.js';
import { showToast } from '../ui-utils.js';
import { getCurrentUser, isAdmin } from '../auth.js';

export function renderDashboard() {
    const user = getCurrentUser();
    return `
    <div class="space-y-6">

        <!-- Welcome Banner -->
        <div class="card bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white border-0">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p class="text-green-100 text-sm font-medium">Good day,</p>
                    <h2 class="text-2xl font-bold font-display">${user?.full_name || 'Farmer'} 👋</h2>
                    <p class="text-green-200 text-sm mt-1">${user?.farm_name || 'Your Farm'}</p>
                </div>
                <div class="text-right">
                    <p class="text-green-200 text-xs uppercase font-bold">Today</p>
                    <p class="text-white font-bold" id="dashboard-date">--</p>
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
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
                <p class="text-xs text-[var(--text-secondary)]">Next 7 days</p>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-chart-line text-[var(--accent)]"></i> Weight Trends
                </h3>
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
                    </div>
                </div>
                <button onclick="navigateTo('health')" class="btn-secondary w-full mt-4 text-xs">
                    View All Health Records <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>

            <div class="card">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm">
                    <i class="fas fa-clock-rotate-left text-[var(--accent)]"></i> Recent Activity
                </h3>
                <div id="recent-activity" class="space-y-2">
                    <div class="text-center py-6 text-[var(--text-secondary)] text-sm">
                        <i class="fas fa-spinner animate-spin text-xl mb-2 block"></i>
                        Loading...
                    </div>
                </div>
                <button onclick="navigateTo('activities')" class="btn-secondary w-full mt-4 text-xs">
                    View All Activities <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
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
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { beginAtZero: false, ticks: { font: { size: 11 } } }
            }
        }
    });
}

function renderHealthChart(animals) {
    const ctx = document.getElementById('healthDistChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    const safe = animals.filter(a => a.status === 'healthy' || a.status === 'safe').length || Math.max(1, animals.length - 2);
    const warning = animals.filter(a => a.status === 'warning').length || 1;
    const critical = animals.filter(a => a.status === 'critical').length || 1;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Healthy', 'Warning', 'Critical'],
            datasets: [{
                data: [safe, warning, critical],
                backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, font: { size: 11 }, usePointStyle: true }
                }
            }
        }
    });
}

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
            </div>`;
        return;
    }

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
        </div>`;
    }).join('');
}

function renderRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    const icons = {
        'Bath': 'fa-shower', 'Feed': 'fa-seedling', 'Weight': 'fa-weight-scale',
        'Vaccine': 'fa-syringe', 'Repair': 'fa-wrench', 'Birth': 'fa-baby',
        'default': 'fa-circle-dot'
    };

    if (activities.length === 0) {
        container.innerHTML = `<p class="text-center text-[var(--text-secondary)] text-sm py-6">No recent activities</p>`;
        return;
    }

    container.innerHTML = activities.slice(0, 5).map(a => {
        const icon = icons[a.event_type] || icons.default;
        const date = a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
        return `
        <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-main)] transition">
            <div class="w-8 h-8 bg-[var(--accent-light)] rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="fas ${icon} text-[var(--accent)] text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">${a.description || a.event_type}</p>
                <p class="text-xs text-[var(--text-secondary)]">Animal #${a.animal_id} · ${date}</p>
            </div>
        </div>`;
    }).join('');
}
