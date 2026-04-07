# 💰 CentSight — AI Financial Decision Simulator

> Predict your financial future before making spending decisions — powered by Machine Learning.

🌐 **Live Demo:** [Add your Render URL here]  
📂 **Repo:** [github.com/Mohammad-Adnan-Shakil/centsight](https://github.com/Mohammad-Adnan-Shakil/BWT_FuncLexa)

---

![CentSight Demo](./screenshot.png)
<!-- Replace with an actual screenshot or GIF of the app -->

---

## 🧠 What is CentSight?

People make financial decisions every day without understanding the long-term impact. Questions like:

- *Should I buy this gadget?*
- *Will this expense affect my savings in 6 months?*
- *Am I financially stable?*

CentSight answers these using a **Linear Regression ML model** that predicts your future savings trajectory and classifies your financial health — before you spend.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Secure signup/login with JWT + bcrypt |
| 📊 Simulation Engine | Input income, expenses, savings, planned spend → get ML prediction |
| 🤖 ML Predictions | Python (Scikit-learn) model integrated with Node.js backend |
| 📈 Financial Health | Risk score + health classification (Stable / Moderate / Risky) |
| 💾 Simulation History | All past simulations stored in MongoDB |

---

## 🏗️ Architecture

```
React Frontend → Express API → Python ML Model → MongoDB
```

```
User submits financial data
        ↓
Node.js validates & routes request
        ↓
Python ML script runs prediction (Scikit-learn)
        ↓
Node.js stores result in MongoDB
        ↓
Frontend displays prediction + financial health insight
```

---

## ⚙️ Tech Stack

**Frontend:** React, Tailwind CSS  
**Backend:** Node.js, Express.js, JWT, bcrypt  
**ML:** Python, Scikit-learn, Joblib  
**Database:** MongoDB  

---

## 🔐 API Reference

### Auth

```
POST /api/auth/signup
POST /api/auth/login        → returns JWT token
```

### Simulation (protected — requires JWT)

```
POST /api/simulate
```

**Request:**
```json
{
  "income": 80000,
  "expenses": 30000,
  "current_savings": 50000,
  "planned_expense": 20000,
  "time_horizon": 12
}
```

**Response:**
```json
{
  "predicted_savings": 170762.33,
  "growth": 120762.33,
  "financial_health": "Stable",
  "risk_score": 40,
  "insight": "Your savings trajectory looks healthy."
}
```

---

## 🚀 Run Locally

```bash
# 1. Clone
git clone https://github.com/Mohammad-Adnan-Shakil/BWT_FuncLexa.git
cd BWT_FuncLexa

# 2. Backend
cd backend
npm install
node server.js        # runs on http://localhost:5000

# 3. ML dependencies
pip install numpy pandas scikit-learn joblib

# 4. Frontend
cd ../centsight-client
npm install
npm start             # runs on http://localhost:3000
```

---

## 📂 Project Structure

```
BWT_FuncLexa/
├── backend/
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── user.js
│   │   └── simulation.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── simulate.js
│   └── server.js
├── ml/
│   ├── train_model.py
│   ├── predict.py
│   └── model.pkl
├── centsight-client/    # React frontend
└── README.md
```

---

## 🎯 Planned Improvements

- [ ] AI-driven recommendation engine
- [ ] Spending pattern analysis
- [ ] Investment forecasting
- [ ] Advanced ML models (Random Forest, XGBoost)
- [ ] Mobile responsive dashboard

---

## 🏆 Built For

**Build With TRAE Hackathon** — Theme: *Future Finance Innovation Platforms*

---

## 👨‍💻 Author

**Mohammad Adnan Shakil**  
CS Engineering Student @ Presidency University, Bengaluru  
[LinkedIn](https://linkedin.com/in/Mohammad-Adnan-Shakil) · [GitHub](https://github.com/Mohammad-Adnan-Shakil)
