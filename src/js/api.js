/**
 * api.js
 * Purpose: Centralized API handler for all server communications.
 * Standards: Async/Await and JSON formatting for Riwi requirements.
 */

const BASE_URL = 'http://localhost:3000/api'; // Standard Node.js port
const API_URL = "http://127.0.0.1:5000/api/livestock";

/**
 * Sends animal data to the Python Backend
 * @param {Object} animalData - {tag, breed, birth_date}
 */
export async function saveToPython(animalData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(animalData)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Success from Python:", result.message);
        
        // Return result for UI feedback (Toast)
        return result;

    } catch (error) {
        console.error("❌ Error connecting to Python Backend:", error);
        return { status: "error", message: "Could not connect to server" };
    }
}

/**
 * Fetches the complete inventory from the Python Backend
 */
export async function fetchInventory() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching inventory:", error);
        return [];
    }
}

export const apiService = {
    /**
     * Generic GET request
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("API GET Error: ", error);
            throw error;
        }
    },

    /**
     * Generic POST request for Animal or Weight registration
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("API POST Error: ", error);
            throw error;
        }
    }
};

function updateOnlineStatus() {
    const status = document.getElementById('sync-status');
    const dot = document.getElementById('sync-dot');
    const text = document.getElementById('sync-text');

    if (navigator.onLine) {
        status.className = "flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700";
        dot.className = "w-2 h-2 rounded-full bg-green-500";
        text.innerText = "ONLINE MODE (API)";
    } else {
        status.className = "flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 animate-pulse";
        dot.className = "w-2 h-2 rounded-full bg-amber-500";
        text.innerText = "OFFLINE MODE (LOCALSTORAGE)";
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Initial check