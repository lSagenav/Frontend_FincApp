/**
 * Logic to prepare data for Chart.js
 */
async function renderGrowthChart(animalId) {
    try {
        // Fetch historical weight data from Juan Carlos's API
        const history = await apiService.get(`livestock/${animalId}/history`);

        // Prepare labels (Dates) and data (Weights)
        const labels = history.map(record => record.date);
        const weights = history.map(record => record.weight);

        // This object is what Chart.js will use
        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Weight Trend - Animal ${animalId}`,
                    data: weights,
                    borderColor: '#2ecc71', // Riwi green or farm green
                    fill: false
                }]
            }
        };

        console.log("📈 Chart data ready to be injected into the Canvas.");
        return chartConfig;

    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
}

export const chartService = {
    renderGrowthChart(canvasId, labels, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Destroy previous graphic if it exists to avoid rendering errors.
        if (window.myChart) { window.myChart.destroy(); }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // Dates: ['Jan', 'Feb', 'Mar']
                datasets: [{
                    label: 'Weight (kg)',
                    data: data, // Weights: [200, 250, 280]
                    borderColor: '#16a34a', // Emerald Green
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } }
            }
        });
    }
};