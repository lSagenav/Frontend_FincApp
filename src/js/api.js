/**
 * api.js
 * Purpose: Centralized API handler for all server communications.
 * Standards: Async/Await and JSON formatting for Riwi requirements.
 */

const BASE_URL = 'http://localhost:3000/api'; // Standard Node.js port

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