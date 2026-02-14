/**
 * activityLogger.js
 * Purpose: Manages the daily activity log for the farm.
 * Includes local storage backup for "Offline First" functionality as requested.
 */

export class ActivityLogger {
    constructor() {
        this.activities = [];
        // The endpoint will be provided by Juan Carlos from the Backend
        this.apiEndpoint = 'http://localhost:3000/api/activities'; 
    }

    /**
     * Registers a new event in the farm log.
     * @param {number} animalId - Unique identifier for the animal.
     * @param {string} type - Event category (e.g., 'Birth', 'Illness', 'Movement').
     * @param {string} description - Detailed notes about the event.
     */
    async registerEvent(animalId, type, description) {
        const newActivity = {
            animal_id: animalId,
            event_type: type,
            description: description,
            date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newActivity)
            });

            if (!response.ok) throw new Error("Server communication failed");

            console.log("✅ Activity successfully synced with server");
            return true;

        } catch (error) {
            // Offline First strategy: Save to LocalStorage if the server is unreachable
            console.warn("⚠️ Server unavailable. Saving record to local storage...");
            this.saveToLocal(newActivity);
            return false;
        }
    }

    /**
     * Persists activity data in the browser for offline availability.
     * @param {Object} activity - The activity object to store.
     */
    saveToLocal(activity) {
        let localLogs = JSON.parse(localStorage.getItem('fincapp_offline_logs')) || [];
        localLogs.push(activity);
        localStorage.setItem('fincapp_offline_logs', JSON.stringify(localLogs));
    }

    /**
     * Retrieves the history for a specific animal.
     * @param {number} animalId - ID of the animal to query.
     */
    async getHistory(animalId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/${animalId}`);
            return await response.json();
        } catch (error) {
            // Return local logs if the network request fails
            return JSON.parse(localStorage.getItem('fincapp_offline_logs')) || [];
        }
    }
}

// Exporting an instance for centralized use in main.js
const activityLogger = new ActivityLogger();
export default activityLogger;