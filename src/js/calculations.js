/**
 * calculations.js
 * Purpose: Handling core business logic including Weight Gain (GDP) 
 * and Health Alert Status (Traffic light system).
 */

/**
 * Calculates the Average Daily Weight Gain (GDP).
 * Formula: (Current Weight - Previous Weight) / Days Elapsed
 * @param {number} currentWeight - Weight in kg from the most recent record.
 * @param {number} previousWeight - Weight in kg from the last record.
 * @param {string} lastDate - Date of the previous weight (YYYY-MM-DD).
 * @param {string} currentDate - Date of the current weight (YYYY-MM-DD).
 * @returns {Object} Result containing gdp value and performance status.
 */
export function calculateGDP(currentWeight, previousWeight, lastDate, currentDate) {
    const startDate = new Date(lastDate);
    const endDate = new Date(currentDate);

    // Calculate difference in days 
    const timeDiff = endDate - startDate;
    const daysElapsed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysElapsed <= 0) return { gdp: 0, status: 'Invalid date range' };

    const weightDiff = currentWeight - previousWeight;
    const gdp = (weightDiff / daysElapsed).toFixed(2); // [cite: 253]

    // Determine performance status based on typical livestock standards 
    let performance = 'stable';
    if (gdp > 0.8) performance = 'excellent';
    if (gdp < 0) performance = 'critical';

    return {
        gdp: parseFloat(gdp),
        days: daysElapsed,
        performance: performance
    };
}

/**
 * Determines the sanitary alert color based on the next vaccine date.
 * [cite: 336, 345]
 * @param {string} dueDate - The scheduled date for the next vaccine.
 * @returns {string} CSS class for the alert: danger (red), warning (yellow), success (green).
 */
export function getHealthStatus(dueDate) {
    const today = new Date();
    const deadline = new Date(dueDate);

    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'status-danger';  // Overdue (Red) [cite: 349]
    if (diffDays <= 7) return 'status-warning'; // Upcoming within a week (Yellow) [cite: 350]
    return 'status-success'; // On track (Green) [cite: 351]
}