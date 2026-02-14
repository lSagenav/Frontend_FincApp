/**
 * voice-logic.js
 * Purpose: Implements voice-to-text transcription and command parsing.
 * Features: Natural language processing for livestock actions.
 */

export class VoiceAssistant {
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
        this.recognition.interimResults = false;

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
        if (text.includes('peso') || text.includes('weight')) {
            const weightMatch = text.match(/peso\s+(\d+)/) || text.match(/(\d+)\s+kilos/);
            console.log(`Action: Record Weight | ID: ${idMatch[0]} | Value: ${weightMatch ? weightMatch[1] : 'unknown'}`);
            // Here you would call Paula's UI to fill the form automatically
        }
    }
}

const voiceAssistant = new VoiceAssistant();
export default voiceAssistant;