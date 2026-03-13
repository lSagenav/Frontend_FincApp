from flask import Flask, request, jsonify
from flask_cors import CORS

import os
from dotenv import load_dotenv
import requests  # para llamar a OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app) 

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

if __name__ == '__main__':
    app.run(port=5000, debug=True)

@app.route('/api/diagnosis', methods=['POST'])
def get_diagnosis():
    data = request.json
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return jsonify({"diagnosis": "API key not configured on server."}), 500
    
    try:
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
                        "content": "Eres un veterinario experto en ganadería colombiana. Da consejos cortos y prácticos en español."
                    },
                    {
                        "role": "user", 
                        "content": f"Animal tag: {data.get('tag')}, raza: {data.get('breed')}, peso: {data.get('weight')}kg. Dame un diagnóstico breve en máximo 3 frases."
                    }
                ]
            }
        )
        result = response.json()
        diagnosis = result["choices"][0]["message"]["content"]
        return jsonify({"diagnosis": diagnosis})
    
    except Exception as e:
        return jsonify({"diagnosis": "Could not get AI diagnosis. Check server logs."}), 500