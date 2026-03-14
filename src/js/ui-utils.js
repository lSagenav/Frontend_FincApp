/**
 * ui-utils.js - UI Utility Functions
 * Toast notifications, PDF export, modal helpers.
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

// ===== PDF EXPORT =====
export function exportInventoryToPDF(data, type = 'inventory') {
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
        showToast('PDF library not loaded', 'error');
        return;
    }

    const { jsPDF } = window.jspdf || { jsPDF };
    const doc = new jsPDF();

    // Header
    doc.setFillColor(45, 122, 45);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('FincApp', 15, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 15, 27);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 140, 22);

    // Determine columns and data based on type
    let head, body;

    switch (type) {
        case 'inventory':
        case 'animals':
            head = [['#', 'Tag', 'Breed', 'Birth Date', 'Status', 'Last Weight']];
            body = data.map((item, i) => [
                i + 1,
                item.tag_number || item.tag || '—',
                item.breed || '—',
                item.birth_date ? new Date(item.birth_date).toLocaleDateString('en-US') : '—',
                item.status || 'healthy',
                item.current_weight ? `${item.current_weight} kg` : item.weight ? `${item.weight} kg` : '—'
            ]);
            break;
        case 'weights':
            head = [['#', 'Animal Tag', 'Weight (kg)', 'Date', 'Recorded By']];
            body = data.map((item, i) => [
                i + 1,
                item.animal_id || '—',
                item.current_weight || '—',
                item.weighing_date ? new Date(item.weighing_date).toLocaleDateString('en-US') : '—',
                item.user_id || '—'
            ]);
            break;
        case 'health':
            head = [['#', 'Animal', 'Medication', 'Alert Level', 'Date', 'AI Diagnosis']];
            body = data.map((item, i) => [
                i + 1,
                item.animal_id || '—',
                item.medication_name || '—',
                item.alert_level || 'low',
                item.event_date ? new Date(item.event_date).toLocaleDateString('en-US') : '—',
                item.ai_diagnosis || '—'
            ]);
            break;
        case 'activities':
            head = [['#', 'Animal', 'Type', 'Description', 'Date']];
            body = data.map((item, i) => [
                i + 1,
                item.animal_id || '—',
                item.event_type || '—',
                item.description || '—',
                item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : '—'
            ]);
            break;
        default:
            head = [['#', 'Tag', 'Breed', 'Status', 'Weight']];
            body = data.map((item, i) => [
                i + 1,
                item.tag_number || item.tag || item.animal_id || '—',
                item.breed || item.vaccine_name || item.event_type || '—',
                item.status || item.alert_level || '—',
                item.weight || item.current_weight ? `${item.weight || item.current_weight} kg` : '—'
            ]);
    }

    if (typeof doc.autoTable === 'function') {
        doc.autoTable({
            startY: 45,
            head: head,
            body: body,
            headStyles: { fillColor: [45, 122, 45], textColor: 255, fontStyle: 'bold', fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [240, 248, 240] },
            theme: 'striped',
            margin: { left: 15, right: 15 }
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        data.forEach((item, i) => {
            doc.text(`${i + 1}. ${item.tag_number || item.tag || '—'} - ${item.breed || '—'} - ${item.status || '—'}`, 15, 50 + i * 8);
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('FincApp Intelligence System — Confidential', 15, 287);
        doc.text(`Page ${i} of ${pageCount}`, 180, 287);
    }

    doc.save(`FincApp_${type}_${Date.now()}.pdf`);
}
