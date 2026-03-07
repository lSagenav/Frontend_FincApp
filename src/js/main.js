/**
 * main.js - Final Production Version
 * Orchestrates UI events, AI diagnosis, Voice Assistant, and PDF generation.
 */

import { DOM_ELEMENTS } from './config.js';
import { apiService } from './api.js';
import activityLogger from './activityLogger.js';
import { aiService } from './ai-service.js';
import voiceAssistant from './voice-logic.js';
import { pdfService } from './pdf-logic.js';

// --- 1. CORE LOGIC: PROCESS UPDATE ---
async function handleLivestockUpdate(animalId, weight) {
    const submitBtn = document.getElementById(DOM_ELEMENTS.SUBMIT_BUTTON);

    try {
        // Block the button to prevent double-clicking.
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Processing...";
        }

        await apiService.post('livestock/weight', { id: animalId, weight });
        await activityLogger.registerEvent(animalId, 'Weight Check', `${weight}kg`);

        const diagnosis = await aiService.getDiagnosis({ id: animalId, weight });
        voiceAssistant.speak(`Consejo de la IA: ${diagnosis}`);

        alert("✅ Record saved successfully!");

    } catch (error) {
        console.error("Critical Flow Error:", error);
        voiceAssistant.speak("Error detectado. Guardando en memoria local.");
    } finally {
        // Always restore the button at the end.
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Save Record";
        }
    }

    const diagnosis = await aiService.getDiagnosis({ id: animalId, weight });

    // Determine alert level for the Traffic Light
    let status = 'safe';
    if (diagnosis.includes("bajo") || diagnosis.includes("atención")) status = 'warning';
    if (diagnosis.includes("peligro") || diagnosis.includes("crítico")) status = 'critical';

    // 1. Show the Toast
    showToast(`Diagnosis completed for Animal #${animalId}`, status);

    // 2. Full and open the Modal
    const modal = document.getElementById('health-modal');
    const banner = document.getElementById('modal-alert-banner');
    
    document.getElementById('modal-animal-id').innerText = `Animal Tag: ${animalId}`;
    document.getElementById('modal-ai-text').innerText = diagnosis;
    document.getElementById('modal-status').innerText = status.toUpperCase();
    
    // Change banner colour dynamically
    banner.className = `p-2 mb-4 rounded text-center font-bold text-white status-bg-${status}`;
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
}

// --- 2. EVENT LISTENERS (Wait for DOM) ---
window.addEventListener('DOMContentLoaded', () => {
    console.log("FincApp Ready & Operational");

    // A. Registration Form 
    const form = document.getElementById(DOM_ELEMENTS.LIVESTOCK_FORM);
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById(DOM_ELEMENTS.TAG_INPUT).value;
            const weight = document.getElementById(DOM_ELEMENTS.WEIGHT_INPUT).value;

            await handleLivestockUpdate(id, weight);
        });
    }

    // --- LOGIC: DARK MODE TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle'); // The ID that Juan Carlos will use
    const body = document.body;

    // Check whether a preference was already saved
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
            updateChartTheme();
        });
    }

    // B. Voice Button (To activate the microphone)
    const voiceBtn = document.getElementById('btn-voice-start'); // Suggested ID for Paula
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => voiceAssistant.startListening());
    }

    // C. Synchronisation Button (Week 4)
    const syncBtn = document.getElementById('btn-sync-cloud');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const result = await activityLogger.syncAllPendingRecords();

            if (result.synced > 0) {
                voiceAssistant.speak(`Sincronización completada. Se subieron ${result.synced} registros.`);
                alert(`✅ Done! Synced: ${result.synced} | Pending: ${result.pending}`);
            } else {
                alert("❌ No connection or no data to sync.");
            }
        });
    }

    const voiceToggle = document.getElementById(DOM_ELEMENTS.VOICE_TOGGLE);
    if (voiceToggle) {
        voiceToggle.addEventListener('change', (e) => {
            voiceAssistant.setVoiceStatus(e.target.checked);
        });
    }
});

