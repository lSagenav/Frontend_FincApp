/**
 * ui-utils.js - UI Utility Functions
 * Toast notifications & PDF export profesional por tipo de reporte.
 */

// ===== TOAST SYSTEM =====
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'all 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ===== PDF HELPERS =====
function getJsPDF() {
    if (typeof window.jspdf !== 'undefined') return window.jspdf.jsPDF;
    if (typeof jsPDF !== 'undefined') return jsPDF;
    return null;
}

const GREEN      = [45, 122, 45];
const GREEN_LIGHT= [232, 244, 232];
const GRAY_TEXT  = [100, 100, 100];
const BLACK      = [30, 30, 30];

function addHeader(doc, title, subtitle) {
    // Barra verde superior
    doc.setFillColor(...GREEN);
    doc.rect(0, 0, 210, 32, 'F');

    // Logo / nombre app
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('FincApp', 14, 13);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Intelligence Livestock System', 14, 20);

    // Título del reporte (derecha)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 196, 12, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 196, 20, { align: 'right' });

    // Fecha de generación
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 196, 27, { align: 'right' });
}

function addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 248, 248);
        doc.rect(0, 282, 210, 15, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY_TEXT);
        doc.text('FincApp Intelligence System — Confidential', 14, 289);
        doc.text(`Page ${i} of ${pageCount}`, 196, 289, { align: 'right' });
    }
}

function addSummaryBox(doc, items, startY) {
    // Fila de KPIs rápidos debajo del header
    const boxW = 180 / items.length;
    items.forEach((item, i) => {
        const x = 14 + i * boxW;
        doc.setFillColor(...GREEN_LIGHT);
        doc.roundedRect(x, startY, boxW - 4, 18, 2, 2, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...GREEN);
        doc.text(String(item.value), x + (boxW - 4) / 2, startY + 9, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY_TEXT);
        doc.text(item.label, x + (boxW - 4) / 2, startY + 15, { align: 'center' });
    });
    return startY + 24;
}

// ===== REPORTE: LIVESTOCK INVENTORY =====
function exportInventoryPDF(data) {
    const JPDF = getJsPDF();
    if (!JPDF) return showToast('PDF library not loaded', 'error');
    const doc = new JPDF();

    addHeader(doc, 'Livestock Inventory', 'Complete herd register');

    const total   = data.length;
    const healthy = data.filter(a => a.status === 'healthy').length;
    const warning = data.filter(a => a.status === 'warning').length;
    const critical= data.filter(a => a.status === 'critical').length;

    let y = addSummaryBox(doc, [
        { label: 'Total Animals', value: total },
        { label: 'Healthy',       value: healthy },
        { label: 'Warning',       value: warning },
        { label: 'Critical',      value: critical },
    ], 38);

    doc.autoTable({
        startY: y,
        head: [['#', 'Tag', 'Breed', 'Birth Date', 'Weight (kg)', 'Status']],
        body: data.map((a, i) => [
            i + 1,
            a.tag_number || a.tag || '—',
            a.breed || '—',
            a.birth_date ? new Date(a.birth_date).toLocaleDateString('en-US') : '—',
            a.weight || a.current_weight || '—',
            (a.status || '—').toUpperCase(),
        ]),
        headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: BLACK },
        alternateRowStyles: { fillColor: GREEN_LIGHT },
        columnStyles: {
            5: { fontStyle: 'bold',
                 cellCallback: (cell, data) => {
                    const v = data.row.raw[5];
                    if (v === 'CRITICAL') cell.styles.textColor = [185, 28, 28];
                    else if (v === 'WARNING') cell.styles.textColor = [180, 83, 9];
                    else cell.styles.textColor = [21, 128, 61];
                 }
            }
        },
        margin: { left: 14, right: 14 },
        theme: 'striped',
        didDrawPage: () => {},
    });

    addFooter(doc);
    doc.save(`FincApp_Inventory_${Date.now()}.pdf`);
}

// ===== REPORTE: HEALTH =====
function exportHealthPDF(data) {
    const JPDF = getJsPDF();
    if (!JPDF) return showToast('PDF library not loaded', 'error');
    const doc = new JPDF();

    addHeader(doc, 'Health Report', 'Vaccines, treatments & alerts');

    const total   = data.length;
    const safe    = data.filter(a => a.alert_level === 'safe' || a.status === 'safe').length;
    const alerts  = data.filter(a => a.alert_level === 'warning' || a.status === 'warning').length;
    const critical= data.filter(a => a.alert_level === 'critical' || a.status === 'critical').length;

    let y = addSummaryBox(doc, [
        { label: 'Total Records', value: total },
        { label: 'Safe',          value: safe },
        { label: 'Warnings',      value: alerts },
        { label: 'Critical',      value: critical },
    ], 38);

    doc.autoTable({
        startY: y,
        head: [['#', 'Animal Tag', 'Vaccine / Treatment', 'Date', 'Next Due', 'Alert']],
        body: data.map((h, i) => [
            i + 1,
            h.animal_id || h.tag || '—',
            h.vaccine_name || h.treatment || h.description || '—',
            h.date || h.applied_date ? new Date(h.date || h.applied_date).toLocaleDateString('en-US') : '—',
            h.next_due ? new Date(h.next_due).toLocaleDateString('en-US') : '—',
            (h.alert_level || h.status || '—').toUpperCase(),
        ]),
        headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: BLACK },
        alternateRowStyles: { fillColor: [235, 243, 255] },
        margin: { left: 14, right: 14 },
        theme: 'striped',
    });

    addFooter(doc);
    doc.save(`FincApp_Health_${Date.now()}.pdf`);
}

// ===== REPORTE: WEIGHTS & GROWTH =====
function exportWeightsPDF(data) {
    const JPDF = getJsPDF();
    if (!JPDF) return showToast('PDF library not loaded', 'error');
    const doc = new JPDF();

    addHeader(doc, 'Weight & Growth', 'ADG trends and performance');

    const weights = data.map(w => parseFloat(w.current_weight || w.weight) || 0).filter(Boolean);
    const avgW    = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '—';
    const maxW    = weights.length ? Math.max(...weights) : '—';
    const minW    = weights.length ? Math.min(...weights) : '—';

    let y = addSummaryBox(doc, [
        { label: 'Records',    value: data.length },
        { label: 'Avg (kg)',   value: avgW },
        { label: 'Max (kg)',   value: maxW },
        { label: 'Min (kg)',   value: minW },
    ], 38);

    doc.autoTable({
        startY: y,
        head: [['#', 'Animal Tag', 'Weight (kg)', 'Date', 'ADG (kg/day)', 'Performance']],
        body: data.map((w, i) => [
            i + 1,
            w.animal_id || w.tag || '—',
            w.current_weight || w.weight || '—',
            w.weighing_date || w.date ? new Date(w.weighing_date || w.date).toLocaleDateString('en-US') : '—',
            w.adg != null ? Number(w.adg).toFixed(2) : '—',
            (w.performance || '—').toUpperCase(),
        ]),
        headStyles: { fillColor: [180, 83, 9], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: BLACK },
        alternateRowStyles: { fillColor: [255, 247, 235] },
        margin: { left: 14, right: 14 },
        theme: 'striped',
    });

    addFooter(doc);
    doc.save(`FincApp_Weights_${Date.now()}.pdf`);
}

// ===== REPORTE: ACTIVITIES =====
function exportActivitiesPDF(data) {
    const JPDF = getJsPDF();
    if (!JPDF) return showToast('PDF library not loaded', 'error');
    const doc = new JPDF();

    addHeader(doc, 'Activity Log', 'All farm operations');

    // Conteo por tipo
    const byType = {};
    data.forEach(a => { const t = a.event_type || 'Other'; byType[t] = (byType[t] || 0) + 1; });
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];

    let y = addSummaryBox(doc, [
        { label: 'Total Activities', value: data.length },
        { label: 'Types',            value: Object.keys(byType).length },
        { label: 'Most Common',      value: topType ? topType[0] : '—' },
        { label: 'Count',            value: topType ? topType[1] : '—' },
    ], 38);

    doc.autoTable({
        startY: y,
        head: [['#', 'Type', 'Animal Tag', 'Description', 'Date']],
        body: data.map((a, i) => [
            i + 1,
            a.event_type || '—',
            a.animal_id || '—',
            a.description || '—',
            a.created_at ? new Date(a.created_at).toLocaleDateString('en-US') : '—',
        ]),
        headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: BLACK },
        alternateRowStyles: { fillColor: [245, 240, 255] },
        columnStyles: { 3: { cellWidth: 70 } },
        margin: { left: 14, right: 14 },
        theme: 'striped',
    });

    addFooter(doc);
    doc.save(`FincApp_Activities_${Date.now()}.pdf`);
}

// ===== REPORTE: FULL FARM =====
function exportFullPDF(inv, health, weights, activities) {
    const JPDF = getJsPDF();
    if (!JPDF) return showToast('PDF library not loaded', 'error');
    const doc = new JPDF();

    // Página 1 — Portada
    doc.setFillColor(...GREEN);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.text('FincApp', 105, 100, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Full Farm Report', 105, 118, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(200, 240, 200);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 105, 132, { align: 'center' });

    // KPIs en portada
    const kpis = [
        { label: 'Animals',    value: inv.length },
        { label: 'Health rec.', value: health.length },
        { label: 'Weight logs', value: weights.length },
        { label: 'Activities', value: activities.length },
    ];
    kpis.forEach((k, i) => {
        const x = 25 + i * 42;
        doc.setFillColor(255, 255, 255, 0.15);
        doc.setDrawColor(255, 255, 255);
        doc.roundedRect(x, 155, 38, 30, 3, 3);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(String(k.value), x + 19, 170, { align: 'center' });
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 240, 200);
        doc.text(k.label, x + 19, 179, { align: 'center' });
    });

    doc.setFontSize(7.5);
    doc.setTextColor(200, 240, 200);
    doc.text('Intelligence Livestock System — Confidential', 105, 285, { align: 'center' });

    // Página 2 — Inventory
    doc.addPage();
    addHeader(doc, 'Livestock Inventory', 'Section 1 of 4');
    doc.autoTable({
        startY: 38,
        head: [['#', 'Tag', 'Breed', 'Weight (kg)', 'Status']],
        body: inv.map((a, i) => [i+1, a.tag_number||a.tag||'—', a.breed||'—', a.weight||a.current_weight||'—', (a.status||'—').toUpperCase()]),
        headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: GREEN_LIGHT },
        margin: { left: 14, right: 14 }, theme: 'striped',
    });

    // Página 3 — Health
    doc.addPage();
    addHeader(doc, 'Health Report', 'Section 2 of 4');
    doc.autoTable({
        startY: 38,
        head: [['#', 'Animal Tag', 'Vaccine / Treatment', 'Date', 'Alert']],
        body: health.map((h, i) => [i+1, h.animal_id||h.tag||'—', h.vaccine_name||h.treatment||'—', h.date ? new Date(h.date).toLocaleDateString('en-US') : '—', (h.alert_level||h.status||'—').toUpperCase()]),
        headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: [235, 243, 255] },
        margin: { left: 14, right: 14 }, theme: 'striped',
    });

    // Página 4 — Weights
    doc.addPage();
    addHeader(doc, 'Weight & Growth', 'Section 3 of 4');
    doc.autoTable({
        startY: 38,
        head: [['#', 'Animal Tag', 'Weight (kg)', 'Date', 'Performance']],
        body: weights.map((w, i) => [i+1, w.animal_id||w.tag||'—', w.current_weight||w.weight||'—', w.weighing_date||w.date ? new Date(w.weighing_date||w.date).toLocaleDateString('en-US') : '—', (w.performance||'—').toUpperCase()]),
        headStyles: { fillColor: [180, 83, 9], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: [255, 247, 235] },
        margin: { left: 14, right: 14 }, theme: 'striped',
    });

    // Página 5 — Activities
    doc.addPage();
    addHeader(doc, 'Activity Log', 'Section 4 of 4');
    doc.autoTable({
        startY: 38,
        head: [['#', 'Type', 'Animal', 'Description', 'Date']],
        body: activities.map((a, i) => [i+1, a.event_type||'—', a.animal_id||'—', a.description||'—', a.created_at ? new Date(a.created_at).toLocaleDateString('en-US') : '—']),
        headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: [245, 240, 255] },
        columnStyles: { 3: { cellWidth: 70 } },
        margin: { left: 14, right: 14 }, theme: 'striped',
    });

    addFooter(doc);
    doc.save(`FincApp_FullReport_${Date.now()}.pdf`);
}

// ===== EXPORT PRINCIPAL (llamado desde reports.js) =====
export function exportInventoryToPDF(data, type = 'inventory') {
    if (!getJsPDF()) {
        showToast('PDF library not loaded', 'error');
        return;
    }
    switch (type) {
        case 'health':      return exportHealthPDF(data);
        case 'weights':     return exportWeightsPDF(data);
        case 'activities':  return exportActivitiesPDF(data);
        default:            return exportInventoryPDF(data);
    }
}

// Función especial para el Full Report (necesita los 4 datasets)
export async function exportFullReport(safeGet) {
    showToast('Building full report...', 'info');
    try {
        const [inv, health, weights, activities] = await Promise.all([
            safeGet('livestock', 'fincapp_livestock'),
            safeGet('health-records', 'fincapp_health_records'),
            safeGet('weights', 'fincapp_weights'),
            safeGet('activities', 'fincapp_activities'),
        ]);
        exportFullPDF(inv, health, weights, activities);
        showToast('Full report ready!', 'success');
    } catch (err) {
        showToast('Export failed: ' + err.message, 'error');
    }
}