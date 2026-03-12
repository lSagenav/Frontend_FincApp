/**
 * Toast Notification System
 * @param {string} message - Text to display
 * @param {string} type - 'safe', 'warning', or 'critical'
 */
export function showToast(message, type = 'safe') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Dynamic classes according to health status (Traffic Light)
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in transition-all duration-500`;
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="font-bold text-sm uppercase tracking-wide">${message}</span>
    `;

    container.appendChild(toast);

    // Disappear after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);

    // Entrance animation
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 100);

}

export function openAnimalModal(animalId) {
    const modal = document.getElementById('animal-modal');
    const banner = document.getElementById('modal-alert-banner');
    
    // Cambiar color del banner basado en lógica (Traffic Light)
    banner.className = animalId === 103 ? 'bg-red-600' : 'bg-green-600';
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modal-container').classList.remove('scale-95');
    }, 10);
}

export async function exportInventoryToPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // FincApp Branding
    doc.setFontSize(22);
    doc.setTextColor(22, 101, 52); // Green-800
    doc.text("FincApp | Livestock Health Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} - Strictly English UI`, 14, 28);

    // Table Generation
    const tableRows = data.map(animal => [
        `#${animal.tag}`,
        animal.breed,
        animal.birth_date,
        "Healthy / Stable" // AI Diagnosis Placeholder
    ]);

    doc.autoTable({
        startY: 35,
        head: [['Tag', 'Breed', 'Birth Date', 'AI Status']],
        body: tableRows,
        headStyles: { fillColor: [22, 101, 52] },
        theme: 'striped'
    });

    doc.save(`FincApp_Inventory_${Date.now()}.pdf`);
}