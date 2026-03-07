/**
 * mockData.js
 * Purpose: Temporary data for testing UI components and charts.
 */
export const MOCK_LIVESTOCK = [
    { id: 101, weight: 450, status: 'safe', history: [410, 425, 438, 450] },
    { id: 102, weight: 380, status: 'warning', history: [390, 385, 382, 380] }, // lost weight.
    { id: 103, weight: 210, status: 'critical', history: [220, 215, 212, 210] }
];

export const MOCK_DATES = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];