from flask import Flask, request, jsonify
from flask_cors import CORS

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