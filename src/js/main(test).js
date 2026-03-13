// /**
//  * main.js - The Orchestrator
//  * This function integrates all your modules: API, ActivityLogger, AI, and Voice.
//  */

// import { apiService } from './api.js';
// import activityLogger from './activityLogger.js';
// import { aiService } from './ai-service.js';
// import voiceAssistant from './voice-logic.js';

// async function processLivestockUpdate(animalId, currentWeight) {
//     console.log(`Starting update process for Animal ID: ${animalId}`);

//     try {
//         // 1. UPDATE WEIGHT IN DATABASE
//         const updateData = { weight: currentWeight, date: new Date().toISOString() };
//         await apiService.post(`livestock/${animalId}/weight`, updateData);
//         console.log("Weight updated in DB.");

//         // 2. LOG ACTIVITY (With Offline-First support)
//         await activityLogger.registerEvent(
//             animalId, 
//             'Weight Check', 
//             `Registered weight: ${currentWeight}kg`
//         );

//         // 3. GET AI DIAGNOSIS (The "Intelligence" part)
//         // We send the ID and weight so the AI can analyze trends
//         const diagnosis = await aiService.getDiagnosis({ id: animalId, weight: currentWeight });
        
//         // 4. VOICE RESPONSE (The "Wow" factor)
//         // The assistant speaks the AI's diagnosis out loud
//         voiceAssistant.speak(`Registro completado. El diagnóstico de la inteligencia artificial es: ${diagnosis}`);

//         return { success: true, diagnosis };

//     } catch (error) {
//         console.error("Error in integration flow:", error);
//         voiceAssistant.speak("Hubo un error al procesar los datos, pero los guardé localmente.");
//         return { success: false, error: error.message };
//     }
// }


/**
 * main.js - Test Version
 */
import { apiService } from './api.js';
import activityLogger from './activityLogger.js';
import { aiService } from './ai-service.js';
import voiceAssistant from './voice-logic.js';

// 1. FUNCIÓN MAESTRA (La que creamos antes)
async function processLivestockUpdate(animalId, currentWeight) {
    console.log(`%c 🚀 Testing update for ID: ${animalId}`, 'color: #2ecc71; font-weight: bold');

    try {
        // Simulación de guardado (Solo para el test)
        console.log("📡 Step 1: Simulating API update...");
        
        // Registro de actividad (Usa tu LocalStorage corregido)
        console.log("📝 Step 2: Logging activity...");
        await activityLogger.registerEvent(animalId, 'Test', `Weight: ${currentWeight}kg`);

        // Consulta a la IA (Simulada si aún no tienes el API Key de Riwi)
        console.log("🤖 Step 3: Consulting AI...");
        const diagnosis = "El animal presenta un peso óptimo para su edad. Se recomienda mantener la dieta actual.";

        // Voz de salida
        console.log("🔊 Step 4: Voice Output...");
        voiceAssistant.speak(`Prueba exitosa. El diagnóstico para la vaca ${animalId} es: ${diagnosis}`);

        return true;
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

// 2. AUTO-EJECUCIÓN DE PRUEBA
// Esto correrá apenas abras el index.html en el navegador
window.addEventListener('DOMContentLoaded', () => {
    console.log("%c --- FINCAPP SYSTEM INITIALIZED ---", 'background: #222; color: #bada55; padding: 5px');
    
    // El asistente te da la bienvenida
    voiceAssistant.speak("Sistema FincApp activo. Iniciando prueba de integración.");

    // Disparamos una prueba automática después de 2 segundos
    setTimeout(() => {
        processLivestockUpdate(101, 450);
    }, 2000);
});