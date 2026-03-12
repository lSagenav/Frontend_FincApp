# 🐄 FincApp — Smart Livestock Management System

> Final integrative project — Riwi CodeUp 2026  
> Frontend SPA built with vanilla HTML, CSS, and JavaScript (ES6 Modules)

---

## 👥 Team

| Name | Role | Module |
|------|------|--------|
| Hugo | Frontend / Logic | SPA Router, Voice Assistant, AI Integration |
| Paula | Frontend / UI | HTML Structure, CSS, Dashboard Layout |
| Juan Carlos | Backend / Database | Express API, MySQL, Auth |

---

## 📋 Project Description

FincApp is a web application for livestock farm management. It allows farmers and administrators to register and track cattle, schedule vaccinations, log daily farm activities, monitor weight gain, and get AI-powered veterinary advice — all with offline-first support.

---

## ✨ Features

- 🔐 Login & registration with role-based access (Admin / Farmer)
- 🐄 Full livestock inventory with CRUD operations
- 💉 Vaccination schedule with traffic light alert system (Red / Yellow / Green)
- 📋 Daily farm activity log
- ⚖️ Weight control with Average Daily Gain (ADG) calculation
- 🤖 AI veterinary diagnosis powered by OpenAI
- 🎤 Voice assistant — speak commands, hear responses (Web Speech API)
- 🌙 Dark / Light mode toggle
- 📄 PDF report export per section
- 📶 Offline First — works without internet, auto-syncs when back online
- 📱 Fully responsive — works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript ES6 Modules |
| Styles | Tailwind CSS (CDN), Custom CSS Variables |
| Charts | Chart.js |
| PDF | jsPDF + jsPDF AutoTable |
| Icons | Font Awesome 6 |
| Voice | Web Speech API (STT + TTS) |
| AI | OpenAI GPT-4o-mini (via Flask backend) |
| Backend | Python Flask + Node.js Express |
| Database | MySQL |

---

## 📁 Project Structure

```
FincApp_FrontEnd/
├── index.html              # SPA shell — single HTML file
├── app.py                  # Flask backend (Python)
├── .env                    # Environment variables (NOT in Git)
├── .env.example            # Template for environment variables
├── .gitignore
├── requirements.txt        # Python dependencies
├── css/
│   └── style.css           # Global styles + dark mode variables
└── src/
    └── js/
        ├── app.js          # Main entry point
        ├── router.js       # SPA router (lazy loading)
        ├── auth.js         # Login, register, session, roles
        ├── api.js          # API service + Offline First queue
        ├── voice-logic.js  # Voice assistant + OpenAI integration
        ├── settings.js     # Theme management
        ├── calculations.js # ADG / GDP + health traffic light
        ├── ui-utils.js     # Toast notifications + PDF export
        └── views/
            ├── dashboard.js    # KPIs, charts, alerts overview
            ├── inventory.js    # Livestock CRUD
            ├── health.js       # Vaccines + health records
            ├── activities.js   # Farm activity log
            ├── weights.js      # Weight control + ADG
            ├── reports.js      # PDF report generator
            ├── settings.js     # Settings view + logic
            └── admin.js        # Admin panel (role-protected)
```

---

## 🚀 How to Run

### Prerequisites

Make sure you have these installed:

```bash
python --version    # Python 3.x
node --version      # Node.js 18+
```

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/HugoIX/FincApp_FrontEnd-2.0.2..git
cd FincApp_FrontEnd-2.0.2.
```

---

### Step 2 — Set up environment variables

```bash
# Copy the example file
cp .env.example .env
```

Then open `.env` and fill in your values:

```
OPENAI_API_KEY=sk-your-openai-key-here
```

> ⚠️ Never share or commit your `.env` file. It is already in `.gitignore`.

---

### Step 3 — Install Python dependencies

```bash
pip install flask flask-cors python-dotenv requests
```

Or using the requirements file:

```bash
pip install -r requirements.txt
```

---

### Step 4 — Run the Flask backend

```bash
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

---

### Step 5 — Run the frontend server

Open a **second terminal** in the same folder:

```bash
python -m http.server 8080
```

Then open your browser at:
```
http://localhost:8080
```

> ⚠️ Do NOT open `index.html` by double-clicking. ES6 Modules require an HTTP server to work.

---

### Step 6 — Run the Node.js backend (Juan Carlos)

```bash
cd ../Backend_FincApp
npm install
node server.js
```

Runs on `http://localhost:3000`

---

## 🔑 Demo Accounts

Use these to test without registering:

| Email | Password | Role |
|-------|----------|------|
| admin@farm.com | admin123 | Admin |
| worker@farm.com | worker123 | Farmer |

---

## 🌐 Deployment

The app is deployed at:  
🔗 *(Add your Netlify / GitHub Pages link here)*

> For deployment, the Flask backend needs to be hosted separately (e.g., Railway, Render).  
> Update `API_CONFIG.BASE_URL` in `src/js/api.js` with the production URL.

---

## 📦 Python Dependencies (`requirements.txt`)

```
flask
flask-cors
python-dotenv
requests
```

To generate this file yourself:
```bash
pip freeze > requirements.txt
```

---

## 🔒 Security Notes

- The OpenAI API key is stored in `.env` on the server — never in frontend code
- All AI requests go through the Flask backend (`/api/diagnosis`), not directly to OpenAI
- Passwords are hashed on the Node.js backend (bcrypt)
- JWT tokens are used for session management

---

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes (for AI features) |

---

## 🤝 Contributing

1. Create your branch: `git checkout -b feat/your-feature`
2. Commit your changes: `git commit -m "feat: add your feature"`
3. Push to your branch: `git push origin feat/your-feature`
4. Open a Pull Request

---

## 📄 License

Academic project — Riwi CodeUp 2026. All rights reserved by the team.
