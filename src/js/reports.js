/**
 * Logic to populate a simple report table
 */

import { MOCK_LIVESTOCK } from './mockData.js';

export const reportService = {
    renderInventory() {
        const container = document.getElementById('inventory-container');
        if (!container) return;

        container.innerHTML = ''; 

        MOCK_LIVESTOCK.forEach(animal => {
            const card = `
                <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow status-${animal.status} mb-3 flex justify-between items-center">
                    <div>
                        <p class="font-bold dark:text-white">Tag: ${animal.id}</p>
                        <p class="text-sm text-gray-500">Weight: ${animal.weight}kg</p>
                    </div>
                    <button onclick="openHealthModal(${animal.id})" class="text-blue-500 underline text-sm">View Details</button>
                </div>
            `;
            container.innerHTML += card;
        });
    }
};

export function updateReportTable(animals) {
    const tableBody = document.getElementById('report-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear Table

    animals.forEach(animal => {
        const row = `
            <tr class="border-b">
                <td class="p-3">ID: ${animal.id}</td>
                <td class="p-3">${animal.last_weight} kg</td>
                <td class="p-3">
                    <button class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 btn-pdf" 
                            data-id="${animal.id}">
                        PDF
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Event delegation for PDF buttons
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-pdf')) {
            const id = e.target.getAttribute('data-id');
            console.log(`Generating PDF for animal ${id}...`);
        }
    });
}