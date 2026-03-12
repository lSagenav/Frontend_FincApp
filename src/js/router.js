// js/router.js
const appContent = document.getElementById('app-content');
import { saveToPython, fetchInventory } from './api.js';
import { showToast } from './ui-utils.js';

async function renderTable() {
    const tbody = document.getElementById('report-table-body');
    if (!tbody) return;

    const data = await fetchInventory(); // Trae los datos de Python

    // Limpiamos y llenamos la tabla
    tbody.innerHTML = data.map(animal => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="p-4 font-bold text-slate-700">#${animal.tag}</td>
            <td class="p-4 text-slate-600">${animal.breed}</td>
            <td class="p-4 text-slate-500">${animal.birth_date}</td>
            <td class="p-4">
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
                    Registered
                </span>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="p-10 text-center text-slate-400 italic">No animals registered yet.</td></tr>';
}

const views = {
    landing: `
        <section class="text-center py-20 animate-fade-in">
            <h1 class="text-5xl font-extrabold text-gray-800 mb-6">Welcome to FincApp</h1>
            <p class="text-xl text-gray-600 mb-8">Manage your ranch's health and weight from a single dashboard.</p>
            <button onclick="navigateTo('inventory')" class="bg-green-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg">Enter System</button>
        </section>
    `,
    inventory: `
    <div class="animate-fade-in space-y-10">
        <header class="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div>
                <h2 class="text-2xl font-black text-slate-800 tracking-tight text-green-700">LIVESTOCK INVENTORY</h2>
            </div>
            <button onclick="navigateTo('dashboard')" class="text-slate-400 hover:text-green-600 transition text-xl">
                <i class="fas fa-times-circle"></i>
            </button>
            <button id="btn-export-pdf" class="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs     font-bold hover:bg-black transition flex items-center gap-2">
                <i class="fas fa-file-pdf"></i> EXPORT REPORT
            </button>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <section class="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border-t-8 border-green-600">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fas fa-plus-circle text-green-600 text-xl"></i>
                    <h3 class="text-xl font-bold text-slate-800 uppercase">Register Animal</h3>
                </div>

                <form id="livestock-form" class="space-y-6">
                    <div class="space-y-1">
                        <label for="livestock-tag" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tag Number</label>
                        <input type="text" id="livestock-tag" placeholder="e.g. 101" required
                            class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold">
                    </div>

                    <div class="space-y-1">
                        <label for="livestock-breed" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breed</label>
                        <input type="text" id="livestock-breed" placeholder="e.g. Brahman" required
                            class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold">
                    </div>

                    <div class="space-y-1">
                        <label for="birth-date" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Date</label>
                        <input type="date" id="birth-date" required
                            class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold">
                    </div>

                    <button type="submit" id="btn-save-record" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-widest">
                        Save Animal
                    </button>
                </form>
            </section>

            <section class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 class="font-bold text-slate-700 uppercase text-xs tracking-tighter">Current Herd List</h3>
                    <div class="flex gap-2">
                        <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Live Data</span>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th class="p-5">Tag</th>
                                <th class="p-5">Breed</th>
                                <th class="p-5">Last Weight</th>
                                <th class="p-5">Health Status</th>
                            </tr>
                        </thead>
                        <tbody id="report-table-body" class="divide-y divide-slate-50">
                            <tr class="text-slate-300 italic text-sm">
                                <td colspan="4" class="p-10 text-center">
                                    <i class="fas fa-spinner animate-spin mr-2"></i> Waiting for livestock data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
`,

    dashboard: `
    <div class="p-8 space-y-10 animate-fade-in">
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-[var(--bg-card)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)]">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-chart-line text-green-600"></i> Weight Evolution Trends
                </h3>
                <div class="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200">
                    <canvas id="weightTrendChart"></canvas>
                    </div>
            </div>

            <div class="bg-[var(--bg-card)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)]">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-seedling text-blue-600"></i> Production Yields (Monthly)
                </h3>
                <div class="h-64">
                    <canvas id="productionYieldChart"></canvas>
                </div>
            </div>
        </section>

        <section class="bg-[var(--bg-card)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                        <th class="p-5">Animal Tag</th>
                        <th class="p-5">Health Status</th>
                        <th class="p-5">Performance</th>
                        <th class="p-5 text-right">Profile</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--border-color)]">
                    <tr class="hover:bg-green-50/30 transition cursor-pointer" onclick="openAnimalModal(101)">
                        <td class="p-5 font-bold">#101</td>
                        <td class="p-5">
                            <span class="status-safe px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-600/20 uppercase">
                                <i class="fas fa-check-circle mr-1"></i> Safe
                            </span>
                        </td>
                        <td class="p-5 text-slate-500 text-sm italic">Optimal Growth</td>
                        <td class="p-5 text-right">
                            <button class="text-green-600 hover:scale-110 transition"><i class="fas fa-external-link-alt"></i></button>
                        </td>
                    </tr>
                    <tr class="hover:bg-red-50/30 transition cursor-pointer" onclick="openAnimalModal(103)">
                        <td class="p-5 font-bold">#103</td>
                        <td class="p-5">
                            <span class="status-critical px-3 py-1 rounded-full text-xs font-bold ring-1 ring-red-600/20 uppercase">
                                <i class="fas fa-exclamation-triangle mr-1"></i> Critical
                            </span>
                        </td>
                        <td class="p-5 text-red-500 text-sm font-bold animate-pulse">Weight Loss Detected</td>
                        <td class="p-5 text-right text-slate-400 font-bold">View</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>

    <div id="animal-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4">
        <div class="bg-[var(--bg-card)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transform scale-95 transition-all duration-300" id="modal-container">
            <div id="modal-alert-banner" class="p-4 text-center text-white font-bold uppercase tracking-widest text-sm">
                AI Health Diagnosis Active
            </div>
            
            <div class="p-8 space-y-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-3xl font-black text-slate-800" id="modal-tag">Animal #101</h2>
                        <p class="text-slate-500" id="modal-breed">Breed: Brahman Purebred</p>
                    </div>
                    <button onclick="closeModal()" class="text-slate-400 hover:text-red-500 text-2xl">&times;</button>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <p class="text-[10px] font-black text-slate-400 uppercase">Weight Log</p>
                        <p class="text-xl font-bold" id="modal-weight">450.5 kg</p>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-green-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase">AI Diagnosis</p>
                        <p class="text-sm italic" id="modal-diagnosis">Healthy development. Maintain current grazing plan.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="toast-container" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] space-y-2"></div>
`


};


export function navigateTo(viewKey) {
    const container = document.getElementById('app-content');
    if (!container) return;

    container.innerHTML = views[viewKey] || views.landing;

    window.scrollTo(0, 0);

    setTimeout(() => {
        attachLogic(viewKey);
    }, 50);
}

function attachLogic(viewKey) {
    console.log(`[Router] Attaching logic for: ${viewKey}`);

    // --- LOGIC FOR INVENTORY VIEW ---
    if (viewKey === 'inventory') {
        renderTable();

        document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
            const data = await fetchInventory(); // Trae los datos de Python
            const { exportInventoryToPDF } = await import('./ui-utils.js');
            exportInventoryToPDF(data);
        });

        // 2. Handle the specific Livestock Registration Form
        const form = document.getElementById('livestock-form');
        if (form) {
            console.log("Found livestock-form, adding event listener...");
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Extract data from the IDs defined in Week 1
                const formData = {
                    tag: document.getElementById('livestock-tag').value,
                    breed: document.getElementById('livestock-breed').value,
                    birth_date: document.getElementById('birth-date').value
                };

                console.log("SPA Form submitted with data:", formData);

                const result = await saveToPython(formData);

                if (result.status === "success") {
                    form.reset();
                    renderTable();
                    showToast("Animal Registered Successfully!", "success"); // Notificación PRO
                } else {
                    showToast("Server Connection Failed", "error");
                }
            });
        }
    }

    // --- LOGIC FOR DASHBOARD VIEW ---
    if (viewKey === 'dashboard') {
        console.log("Initializing Dashboard Visuals (Charts & Stats)...");

        // 1. Initialize Weight Evolution Chart (Week 3 Requirement)

        if (typeof Chart === 'undefined') {
            console.warn("Chart.js is not loaded yet. Retrying in 200ms...");
            setTimeout(() => attachLogic('dashboard'), 200);
            return;
        }

        const weightCtx = document.getElementById('weightTrendChart')?.getContext('2d');
        if (weightCtx) {
            new Chart(weightCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{
                        label: 'Avg Weight (kg)',
                        data: [400, 420, 415, 440, 450],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }

        // 2. Initialize Production Yield Chart (Week 3 Requirement)
        const yieldCtx = document.getElementById('productionYieldChart')?.getContext('2d');
        if (yieldCtx) {
            new Chart(yieldCtx, {
                type: 'bar',
                data: {
                    labels: ['Meat', 'Milk', 'Offspring'],
                    datasets: [{
                        label: 'Yield Index',
                        data: [85, 92, 70],
                        backgroundColor: '#2563eb',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }
}

export function initRouter() {
    // Detectar si el usuario usa las flechas del navegador (Atrás/Adelante)
    window.addEventListener('popstate', (e) => {
        const view = e.state?.view || 'landing';
        navigateTo(view);
    });

    navigateTo('landing');
}