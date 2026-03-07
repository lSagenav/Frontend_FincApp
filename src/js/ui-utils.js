/**
 * Toast Notification System
 * @param {string} message - Text to display
 * @param {string} type - 'safe', 'warning', or 'critical'
 */
export function showToast(message, type = 'safe') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Dynamic classes according to health status (Traffic Light)
    const bgColors = {
        safe: 'bg-green-600',
        warning: 'bg-yellow-500',
        critical: 'bg-red-600'
    };

    toast.className = `${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-3 transform translate-y-10 opacity-0 transition-all duration-500`;
    toast.innerText = message;

    container.appendChild(toast);

    // Entrance animation
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 100);

    // Disappear after 4 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}