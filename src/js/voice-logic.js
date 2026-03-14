/**
 * voice-logic.js - FincApp Voice Assistant
 * Push-to-talk pattern: mic opens → user speaks → mic closes → process → respond
 * TTS only fires AFTER mic is fully closed to prevent self-hearing.
 */

import { showToast } from './ui-utils.js';
import { navigateTo } from './router.js';

let recognition = null;
let isListening = false;
let ttsEnabled = true;

// ===== INIT =====
export function initVoiceAssistant() {
    ttsEnabled = localStorage.getItem('fincapp_tts') !== 'false';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('[Voice] Speech recognition not supported in this browser.');
        document.getElementById('voice-fab')?.classList.add('opacity-50');
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        window.speechSynthesis.cancel(); // silence TTS immediately
        document.getElementById('voice-fab')?.classList.add('listening');
        document.getElementById('voice-fab-icon')?.classList.replace('fa-microphone', 'fa-circle-stop');
        showToast('🎤 Listening...', 'info');
    };

    recognition.onend = () => {
        isListening = false;
        document.getElementById('voice-fab')?.classList.remove('listening');
        document.getElementById('voice-fab-icon')?.classList.replace('fa-circle-stop', 'fa-microphone');
    };

    recognition.onerror = (event) => {
        isListening = false;
        document.getElementById('voice-fab')?.classList.remove('listening');
        document.getElementById('voice-fab-icon')?.classList.replace('fa-circle-stop', 'fa-microphone');
        if (event.error !== 'no-speech') {
            showToast('Voice error: ' + event.error, 'warning');
        }
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('[Voice] Heard:', transcript);
        showToast(`🎤 "${transcript}"`, 'info');
        // Wait for mic to fully close before processing
        await waitForMicClose();
        await processVoiceCommand(transcript);
    };
}

// Wait until mic is fully closed before speaking
function waitForMicClose() {
    return new Promise(resolve => setTimeout(resolve, 600));
}

// ===== TOGGLE VOICE =====
export function toggleVoice() {
    if (!recognition) {
        showToast('Voice recognition not available in this browser', 'warning');
        return;
    }
    if (isListening) {
        recognition.stop();
    } else {
        window.speechSynthesis.cancel();
        recognition.start();
    }
}

// ===== TEXT TO SPEECH =====
export function speak(message) {
    if (!ttsEnabled) return;
    if (!window.speechSynthesis) return;
    if (isListening) return; // never speak while mic is open

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
}

// ===== COMMAND PROCESSOR =====
async function processVoiceCommand(text) {
    const localResult = parseLocalCommand(text);
    if (localResult.handled) {
        speak(localResult.response);
        return;
    }

    try {
        const aiResponse = await interpretWithOpenAI(text);
        await executeAICommand(aiResponse);
    } catch (err) {
        console.warn('[Voice] OpenAI unavailable:', err);
        speak('Command not understood. Please try again.');
        showToast('Command not understood', 'warning');
    }
}

// ===== LOCAL PATTERN MATCHING =====
function parseLocalCommand(text) {
    if (text === 'inventario' || text === 'ganado' || text === 'ir a inventario') {
        navigateTo('inventory');
        return { handled: true, response: 'Opening livestock inventory.' };
    }
    if (text === 'salud' || text === 'vacunas' || text === 'ir a salud') {
        navigateTo('health');
        return { handled: true, response: 'Opening health module.' };
    }
    if (text === 'actividades' || text === 'ir a actividades') {
        navigateTo('activities');
        return { handled: true, response: 'Opening activities log.' };
    }
    if (text === 'pesos' || text === 'control de peso' || text === 'ir a pesos') {
        navigateTo('weights');
        return { handled: true, response: 'Opening weight control.' };
    }
    if (text === 'dashboard' || text === 'inicio' || text === 'ir al inicio') {
        navigateTo('dashboard');
        return { handled: true, response: 'Going to dashboard.' };
    }
    if (text === 'reportes' || text === 'informes' || text === 'ir a reportes') {
        navigateTo('reports');
        return { handled: true, response: 'Opening reports.' };
    }
    if (text === 'ajustes' || text === 'configuración' || text === 'settings') {
        navigateTo('settings');
        return { handled: true, response: 'Opening settings.' };
    }

    const weightMatch = text.match(/^(?:peso|registrar peso|el peso del?)\s+(?:vaca|animal|toro|res)\s+(\w+).*?(\d+)\s*(?:kilo|kg|kilogramo)/i);
    if (weightMatch) {
        const tag = weightMatch[1];
        const weight = weightMatch[2];
        const tagInput = document.getElementById('weight-tag');
        const weightInput = document.getElementById('weight-value');
        if (tagInput) tagInput.value = tag;
        if (weightInput) weightInput.value = weight;
        return {
            handled: true,
            response: `Recording ${weight} kilograms for animal ${tag}.`
        };
    }

    return { handled: false };
}

// ===== OPENAI INTEGRATION =====
async function interpretWithOpenAI(userText) {
    const response = await fetch('http://localhost:5000/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userText })
    });

    if (!response.ok) throw new Error(`Voice command failed: ${response.status}`);
    return await response.json();
}

async function executeAICommand(command) {
    console.log('[Voice] AI command received:', JSON.stringify(command));

    const message = command.response || command.message || 'Command processed.';
    showToast(`🤖 ${message}`, 'success');
    speak(message);

    switch (command.action) {

        // ===== NAVIGATION =====
        case 'navigate': {
            const view = command.params?.view || command.target;
            if (view) navigateTo(view);
            break;
        }

        // ===== ANIMALS =====
        case 'register_animal':
            navigateTo('inventory');
            setTimeout(() => {
                document.getElementById('btn-new-animal')?.click();
                setTimeout(() => {
                    if (command.params?.tag) {
                        const tagInput = document.getElementById('f-tag');
                        if (tagInput) tagInput.value = command.params.tag;
                    }
                    if (command.params?.breed) {
                        const breedInput = document.getElementById('f-breed');
                        if (breedInput) breedInput.value = command.params.breed;
                    }
                    if (command.params?.birth_date) {
                        const birthInput = document.getElementById('f-birth');
                        if (birthInput) birthInput.value = command.params.birth_date;
                    }
                    if (command.params?.weight) {
                        const weightInput = document.getElementById('f-weight');
                        if (weightInput) weightInput.value = command.params.weight;
                    }
                }, 600);
            }, 800);
            break;

        case 'edit_animal':
            navigateTo('inventory');
            if (command.params?.tag) {
                setTimeout(() => {
                    const searchInput = document.getElementById('search-animals');
                    if (searchInput) {
                        searchInput.value = command.params.tag;
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }, 800);
            }
            break;

        // ===== WEIGHTS =====
        case 'register_weight': {
            navigateTo('weights');
            setTimeout(() => {
                const tagInput = document.getElementById('weight-tag');
                const weightInput = document.getElementById('weight-value');
                if (tagInput && command.params?.tag) tagInput.value = command.params.tag;
                if (weightInput && command.params?.weight) weightInput.value = command.params.weight;
            }, 800);
            break;
        }

        case 'view_weight_history':
            navigateTo('weights');
            break;

        // ===== HEALTH & VACCINES =====
        case 'register_vaccine':
            navigateTo('health');
            setTimeout(() => {
                document.getElementById('btn-add-vaccine')?.click();
                setTimeout(() => {
                    if (command.params?.tag) {
                        const animalSelect = document.getElementById('v-animal');
                        if (animalSelect) animalSelect.value = command.params.tag;
                    }
                    if (command.params?.vaccine_name) {
                        const nameInput = document.getElementById('v-name');
                        if (nameInput) nameInput.value = command.params.vaccine_name;
                    }
                }, 600);
            }, 800);
            break;

        case 'update_vaccine':
            navigateTo('health');
            break;

        case 'get_advice':
        case 'get_farm_tip': {
            try {
                const question = command.params?.description || 'general farm health tip';
                const res = await fetch('http://localhost:5000/api/advice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question })
                });
                const result = await res.json();
                showToast(`💡 ${result.advice}`, 'info');
                speak(result.advice);
            } catch {
                speak('Could not get advice right now. Please try again.');
                showToast('Could not get advice', 'warning');
            }
            break;
        }

        // ===== ACTIVITIES =====
        case 'add_activity':
            navigateTo('activities');
            setTimeout(() => {
                document.getElementById('btn-add-activity')?.click();
                setTimeout(() => {
                    if (command.params?.type) {
                        const typeSelect = document.getElementById('a-type');
                        if (typeSelect) typeSelect.value = command.params.type;
                    }
                    if (command.params?.description) {
                        const descInput = document.getElementById('a-desc');
                        if (descInput) descInput.value = command.params.description;
                    }
                    if (command.params?.tag) {
                        const animalInput = document.getElementById('a-animal');
                        if (animalInput) animalInput.value = command.params.tag;
                    }
                }, 600);
            }, 800);
            break;

        case 'view_activities':
            navigateTo('activities');
            break;

        // ===== REPORTS / PDF =====
        case 'export_inventory_pdf':
            navigateTo('reports');
            setTimeout(() => window.generateReport?.('inventory'), 800);
            break;

        case 'export_health_pdf':
            navigateTo('reports');
            setTimeout(() => window.generateReport?.('health'), 800);
            break;

        case 'export_weights_pdf':
            navigateTo('reports');
            setTimeout(() => window.generateReport?.('weights'), 800);
            break;

        case 'export_activities_pdf':
            navigateTo('reports');
            setTimeout(() => window.generateReport?.('activities'), 800);
            break;

        case 'export_full_pdf':
            navigateTo('reports');
            setTimeout(() => window.generateReport?.('full'), 800);
            break;

        // ===== AI ADVICE =====
        case 'get_advice':
        case 'get_farm_tip': {
            try {
                const res = await fetch('http://localhost:5000/api/diagnosis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tag: 'general', breed: 'general', weight: 300 })
                });
                const result = await res.json();
                showToast(`💡 ${result.diagnosis}`, 'info');
                speak(result.diagnosis);
            } catch {
                speak('Could not get advice right now. Please try again.');
            }
            break;
        }

        // ===== SYSTEM =====
        case 'toggle_theme':
            window.toggleTheme?.();
            break;

        case 'toggle_tts':
            ttsEnabled = !ttsEnabled;
            setTTS(ttsEnabled);
            showToast(`Voice responses ${ttsEnabled ? 'enabled' : 'disabled'}`, 'info');
            break;

        case 'unknown':
        default: {
            const guide = `To register an animal say: register animal, tag number, breed, birth date, and weight in kilos. 
            To record weight say: record weight, animal tag, and weight in kilos.
            To add a vaccine say: vaccine for animal, then the tag number.
            To log activity say: log activity, type, and description.`;
            showToast('💬 Try: "register animal tag 200 breed Holstein weight 450kg"', 'info');
            speak(guide);
            break;
        }
    }
}

// ===== AI DIAGNOSIS (for health module) =====
export async function getAIDiagnosis(animalData) {
    try {
        const response = await fetch('http://localhost:5000/api/diagnosis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(animalData)
        });
        const result = await response.json();
        return result.diagnosis;
    } catch (err) {
        if (animalData.weight < 250) {
            return 'Low weight detected. Increase feed ration and check for parasites.';
        }
        return 'Animal is in healthy weight range. Continue current grazing plan.';
    }
}

export function setTTS(enabled) {
    ttsEnabled = enabled;
    localStorage.setItem('fincapp_tts', enabled.toString());
}

export function getTTSStatus() { return ttsEnabled; }