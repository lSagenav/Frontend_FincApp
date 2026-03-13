/**
 * activityLogger.js
 * Purpose: Manages the daily activity log for the farm.
 * Includes local storage backup for "Offline First" functionality as requested.
 */

import { API_CONFIG } from "./config.js";

    export class ActivityLogger {
    constructor() {
        this.activities = [];
        // Use centralized config instead of hardcoded string
        this.apiEndpoint = `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.ACTIVITIES || 'activities'}`; 
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
            if (!response.ok) throw new Error("Fetch error");
            return await response.json();
        } catch (error) {
            // FIX: Filter local logs to return only the specific animal's history
            const allLogs = JSON.parse(localStorage.getItem('fincapp_offline_logs')) || [];
            return allLogs.filter(log => log.animal_id === animalId);
        }
    }
}

/**
 * Synchronizes all pending local records with the server.
 * This is the heart of the "Offline First" strategy.
 */
async function syncAllPendingRecords() {
    const localLogs = JSON.parse(localStorage.getItem('fincapp_offline_logs')) || [];
    
    if (localLogs.length === 0) {
        console.log("✅ No pending records to sync.");
        return { success: true, count: 0 };
    }

    console.log(`🔄 Attempting to sync ${localLogs.length} records...`);
    let syncedCount = 0;
    let failedRecords = [];

    for (const record of localLogs) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });

            if (response.ok) {
                syncedCount++;
            } else {
                failedRecords.push(record);
            }
        } catch (error) {
            failedRecords.push(record);
        }
    }

    // Update LocalStorage only with what could NOT be uploaded.
    localStorage.setItem('fincapp_offline_logs', JSON.stringify(failedRecords));

    return {
        success: failedRecords.length === 0,
        synced: syncedCount,
        pending: failedRecords.length
    };
}

// Exporting an instance for centralized use in main.js
const activityLogger = new ActivityLogger();
export default activityLogger;