from flask import Flask, request, jsonify
from flask_cors import CORS

import os
from dotenv import load_dotenv
import requests 
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    FRONTEND_URL,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5501",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
])

inventory_db = []

@app.route('/api/livestock', methods=['POST'])
def add_animal():
    data = request.json
    inventory_db.append(data)
    print(f"New animal registered: {data}")
    
    return jsonify({
        "status": "success",
        "message": "Animal registered in Python Backend",
        "received": data
    }), 201

@app.route('/api/livestock', methods=['GET'])
def get_inventory():
    return jsonify(inventory_db)

@app.route('/api/voice-command', methods=['POST'])
def voice_command():
    data = request.json
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return jsonify({"action": "unknown", "message": "API key not configured"}), 500
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",
                "max_tokens": 150,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are a voice assistant for FincApp, a livestock farm management app.
                        The user speaks in Spanish. Map their command to one of these actions and respond ONLY with valid JSON, no markdown, no extra text.

                        AVAILABLE ACTIONS:
                        navigate, register_animal, edit_animal, register_weight, view_weight_history,
                        register_vaccine, update_vaccine, get_diagnosis, add_activity, view_activities,
                        export_inventory_pdf, export_health_pdf, export_weights_pdf, export_activities_pdf,
                        export_full_pdf, get_advice, get_farm_tip, toggle_theme, toggle_tts, unknown

                        RESPONSE FORMAT:
                        {"action":"ACTION_NAME","params":{"view":"","tag":"","weight":"","breed":"","birth_date":"YYYY-MM-DD","vaccine_name":"","application_date":"YYYY-MM-DD","next_date":"YYYY-MM-DD","notes":"","type":"","description":""},"response":"short confirmation in English"}

                        EXAMPLES:

                        Navigation:
                        "ir al dashboard" → {"action":"navigate","params":{"view":"dashboard"},"response":"Going to dashboard."}
                        "ir a inventario" → {"action":"navigate","params":{"view":"inventory"},"response":"Opening inventory."}
                        "ir a salud" → {"action":"navigate","params":{"view":"health"},"response":"Opening health module."}
                        "ir a actividades" → {"action":"navigate","params":{"view":"activities"},"response":"Opening activities."}
                        "ir a pesos" → {"action":"navigate","params":{"view":"weights"},"response":"Opening weight control."}
                        "ir a reportes" → {"action":"navigate","params":{"view":"reports"},"response":"Opening reports."}
                        "ir a ajustes" → {"action":"navigate","params":{"view":"settings"},"response":"Opening settings."}

                        Animals:
                        "registrar animal etiqueta 200 raza holstein nacimiento 15 de octubre de 2025 peso 120 kg" → {"action":"register_animal","params":{"tag":"200","breed":"holstein","birth_date":"2025-10-15","weight":"120"},"response":"Opening animal registration form."}
                        "agregar vaca etiqueta 305 raza brahman peso 350 kilos" → {"action":"register_animal","params":{"tag":"305","breed":"brahman","birth_date":"","weight":"350"},"response":"Opening animal registration form."}
                        "editar animal 200" → {"action":"edit_animal","params":{"tag":"200"},"response":"Searching animal 200."}
                        "editar animal 200" → {"action":"edit_animal","params":{"tag":"200"},"response":"Searching animal 200."}


                        Weights:
                        "registrar peso animal 200 480 kilos" → {"action":"register_weight","params":{"tag":"200","weight":"480"},"response":"Recording 480kg for animal 200."}
                        "el animal 305 pesa 350 kg" → {"action":"register_weight","params":{"tag":"305","weight":"350"},"response":"Recording 350kg for animal 305."}
                        "ver historial de pesos" → {"action":"view_weight_history","params":{},"response":"Opening weight history."}

                        Vaccines:
                        "registrar vacuna para animal 200 fiebre aftosa aplicada hoy próxima en un año" → {"action":"register_vaccine","params":{"tag":"200","vaccine_name":"fiebre aftosa","application_date":"2026-03-13","next_date":"2027-03-13"},"response":"Opening vaccine registration."}
                        "vacuna brucelosis animal 305 próxima dosis en 6 meses" → {"action":"register_vaccine","params":{"tag":"305","vaccine_name":"brucelosis","application_date":"2026-03-13","next_date":"2026-09-13"},"response":"Opening vaccine registration."}
                        "actualizar vacuna animal 200" → {"action":"update_vaccine","params":{"tag":"200"},"response":"Opening vaccine update."}

                        Health:
                        "diagnóstico del animal 200" → {"action":"get_diagnosis","params":{"tag":"200"},"response":"Getting diagnosis for animal 200."}
                        "cómo está el animal 305" → {"action":"get_diagnosis","params":{"tag":"305"},"response":"Getting health status for animal 305."}

                        Activities:
                        "registrar actividad alimentación del ganado en la mañana" → {"action":"add_activity","params":{"type":"Feed","description":"morning feeding","tag":""},"response":"Logging feeding activity."}
                        "actividad baño del animal 200" → {"action":"add_activity","params":{"type":"Bath","description":"animal bath","tag":"200"},"response":"Logging bath activity."}
                        "registrar reparación del corral" → {"action":"add_activity","params":{"type":"Repair","description":"corral repair","tag":""},"response":"Logging repair activity."}
                        "registrar movimiento del ganado" → {"action":"add_activity","params":{"type":"Movement","description":"cattle movement","tag":""},"response":"Logging movement activity."}
                        "registrar desparasitación animal 200" → {"action":"add_activity","params":{"type":"Deworming","description":"deworming treatment","tag":"200"},"response":"Logging deworming activity."}
                        "ver actividades" → {"action":"view_activities","params":{},"response":"Opening activity log."}

                        Reports:
                        "exportar inventario en pdf" → {"action":"export_inventory_pdf","params":{},"response":"Exporting inventory report."}
                        "exportar reporte de salud" → {"action":"export_health_pdf","params":{},"response":"Exporting health report."}
                        "exportar reporte de pesos" → {"action":"export_weights_pdf","params":{},"response":"Exporting weight report."}
                        "exportar reporte de actividades" → {"action":"export_activities_pdf","params":{},"response":"Exporting activities report."}
                        "exportar reporte completo" → {"action":"export_full_pdf","params":{},"response":"Exporting full farm report."}

                        Advice:
                        "consejo veterinario" → {"action":"get_advice","params":{},"response":"Getting veterinary advice."}
                        "tip para la finca" → {"action":"get_farm_tip","params":{},"response":"Getting farm management tip."}

                        System:
                        "cambiar tema" → {"action":"toggle_theme","params":{},"response":"Toggling theme."}
                        "activar voz" → {"action":"toggle_tts","params":{},"response":"Toggling voice responses."}

                        If command is unclear, respond with:
                        {"action":"unknown","params":{},"response":"Command not understood. Try saying: register animal tag 200 breed Holstein weight 450kg, or: go to inventory, or: export full report."}"""
                    },
                    {
                        "role": "user",
                        "content": data.get('command', '')
                    }
                ]
            }
        )
        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()
        import json
        return jsonify(json.loads(content))
    
    except Exception as e:
        print(f"Voice command error: {e}")
        return jsonify({"action": "unknown", "message": "Could not process command"}), 500
    
@app.route('/api/advice', methods=['POST'])
def get_advice():
    data = request.json
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return jsonify({"advice": "API key not configured on server."}), 500
    
    try:
        question = data.get('question', '')
        animal_tag = data.get('tag', '')
        animal_breed = data.get('breed', '')
        animal_weight = data.get('weight', '')

        # Build context-aware prompt
        context = ""
        if animal_tag:
            context += f"Animal tag: {animal_tag}. "
        if animal_breed:
            context += f"Breed: {animal_breed}. "
        if animal_weight:
            context += f"Weight: {animal_weight}kg. "
        if question:
            context += f"Problem described: {question}"

        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",
                "max_tokens": 200,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are an expert veterinarian specializing in Colombian livestock farming (cattle, bovines).
                        Your role is to give specific, actionable advice based on the exact problem described.
                        - Always address the specific symptoms or situation mentioned
                        - Give concrete recommendations (medications, treatments, actions)
                        - Mention when to call a real vet urgently
                        - Keep response under 4 sentences
                        - Respond in English"""
                    },
                    {
                        "role": "user",
                        "content": context if context else "Give me a practical farm health tip for Colombian cattle."
                    }
                ]
            }
        )
        result = response.json()
        advice = result["choices"][0]["message"]["content"]
        return jsonify({"advice": advice})
    
    except Exception as e:
        print(f"Advice error: {e}")
        return jsonify({"advice": "Could not get advice. Please try again."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)