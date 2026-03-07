/**
 * voice-logic.js
 * Purpose: Implements voice-to-text transcription and command parsing.
 * Features: Natural language processing for livestock actions.
 */

export class VoiceAssistant {

    /**
     * Text-to-Speech (TTS) feature to respond to the user.
     * @param {string} message - The text to be spoken by the AI.
     */

    speak(message) {
        if (!this.isEnabled) {
            console.log("🔇 Voice is muted by user. Message not spoken.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
    }

    setVoiceStatus(status) {
        this.isEnabled = status;
        console.log(`🔊 Voice Assistant is now: ${status ? 'ON' : 'OFF'}`);
    }

    constructor() {
        // Checking browser compatibility
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Voice recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES'; // Set to Spanish for field use
        this.recognition.continuous = false;

        this.initEventListeners();
    }

    initEventListeners() {
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Input: ", transcript);
            this.parseCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error: ", event.error);
        };
    }

    startListening() {
        this.recognition.start();
        console.log("Listening for livestock commands...");
    }

    /**
     * Parse the transcript to identify actions
     * Example: "Vaca 101 peso 450"
     */
    parseCommand(text) {
        // Logic to extract ID and Weight/Action
        const idMatch = text.match(/\d+/);

        if (!idMatch) {
            console.warn("No ID detected in voice command.");
            return;
        }

        const animalId = idMatch[0];
        
        if (text.includes('peso') || text.includes('weight')) {
            const weightMatch = text.match(/peso\s+(\d+)/) || text.match(/(\d+)\s+kilos/);
            const weightValue = weightMatch ? weightMatch[1] : 'unknown';
            console.log(`Action: Record Weight | ID: ${idMatch[0]} | Value: ${weightMatch ? weightMatch[1] : 'unknown'}`);
            // Here you would call Paula's UI to fill the form automatically
        }
    }
}

const voiceAssistant = new VoiceAssistant();
export default voiceAssistant;