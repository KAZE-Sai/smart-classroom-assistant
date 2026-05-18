import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

agent = None

def get_agent():
    global agent
    if agent is None:
        from agent import SmartAgent
        agent = SmartAgent()
    return agent

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    user_message = data["message"].strip()
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    if not os.environ.get("GROQ_API_KEY"):
        return jsonify({
            "reply": "⚠️ No API key found. Please restart the server with your Groq API key:\n\nset GROQ_API_KEY=your_key_here\n\nGet a free key at: https://console.groq.com"
        })

    try:
        reply = get_agent().respond(user_message, history)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

@app.route("/api/health", methods=["GET"])
def health():
    has_key = bool(os.environ.get("GROQ_API_KEY"))
    return jsonify({"status": "ok", "groq_ready": has_key})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
