# 🎓 Nyx — Smart Classroom Assistant

> An AI-powered study companion that helps students learn better, faster.

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Flask](https://img.shields.io/badge/Flask-2.x-lightgrey)
![LLaMA](https://img.shields.io/badge/LLaMA-3.3--70B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🧠 What is Nyx?

Nyx is a smart classroom assistant built for students who need 
help understanding concepts, preparing for exams, or catching 
up on missed lectures — all through a simple chat interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💡 Doubt Solving | Explains any academic concept clearly |
| 📝 Quiz Mode | Generates quizzes one question at a time |
| 📄 Summarizer | Summarizes notes you paste |
| 📅 Study Planner | Creates study plans based on your exam date |
| 🎯 Missed Lecture | Covers topics you missed in class |

---

## 🛠️ Tech Stack

- **Backend** — Python, Flask, Flask-CORS
- **AI Model** — LLaMA 3.3-70B via Groq API
- **Frontend** — HTML, CSS, Vanilla JavaScript
- **Intent Routing** — Custom regex-based classifier

---
## 🚀 How to Run
1. Get free Groq API key from https://console.groq.com
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Set API key: `set GROQ_API_KEY=your_key_here`
4. Run: `cd smart-classroom/backend` then `python app.py`
5. Open: `http://localhost:5000`

---

## 📁 Project Structure

smart-classroom-assistant/
├── backend/
│   ├── agent.py          # Core AI agent with Groq API
│   ├── app.py            # Flask server & API routes
│   ├── classifier.py     # Intent classification
│   └── handlers/         # Feature-specific handlers
├── frontend/
│   ├── index.html        # Main UI
│   ├── style.css         # Styling
│   └── app.js            # Frontend logic
└── README.md

---

## 🔑 Environment Variables

Create a `.env` file:
GROQ_API_KEY=your_groq_api_key_here

---

## 🙋 Author

**P.P. Sai Dattatreya**  
B.Tech CSE (Data Science) — IARE Hyderabad  
[LinkedIn](#) | [GitHub](#)
