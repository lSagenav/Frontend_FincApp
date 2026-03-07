/**
 * config.js
 * Purpose: Centralized naming conventions to sync with Paula's HTML and Juan's DB.
 */

export const DOM_ELEMENTS = {
    // These IDs must match what Paula puts in her HTML
    LIVESTOCK_FORM: 'livestock-form',
    TAG_INPUT: 'tag-number',
    WEIGHT_INPUT: 'current-weight',
    SUBMIT_BUTTON: 'btn-save-record',
    VOICE_TOGGLE: 'voice-status-toggle', 
    
    // Status indicators for the dashboard
    HEALTH_STATUS_BOX: 'health-indicator',
    GDP_DISPLAY: 'gdp-value'
};

export const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    ENDPOINTS: {
        LIVESTOCK: 'livestock',
        WEIGHTS: 'weights',
        VACCINES: 'vaccines'
    }
};
