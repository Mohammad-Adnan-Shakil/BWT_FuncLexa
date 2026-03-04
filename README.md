💰 CentSight — AI Financial Decision Simulator

🚀 CentSight is an AI-powered financial decision support platform that helps users simulate future financial scenarios before making spending decisions.

Instead of guessing “Can I afford this?”, CentSight predicts your future savings trajectory using Machine Learning and gives actionable financial insights.

---

🧠 Problem Statement

People often make financial decisions without understanding the long-term impact of their spending habits.

Questions like:

- Should I buy this expensive gadget?
- Will this affect my savings in the future?
- Am I financially healthy?

are rarely backed by data.

CentSight solves this by providing AI-driven financial simulations.

---

✨ Key Features

🔐 User Authentication

- Secure signup and login
- Password hashing using bcrypt
- JWT based authentication

📊 Financial Scenario Simulation

- Users input:
  - Income
  - Expenses
  - Current Savings
  - Planned Expense
  - Time Horizon

🧠 Machine Learning Predictions

- Linear Regression model predicts future savings
- Python ML model integrated with Node.js backend

📈 Financial Insights Engine

- Predicted savings
- Growth analysis
- Financial health classification
- Risk score generation

💾 Simulation History

- All simulations are stored in MongoDB

---

🏗️ System Architecture

User → Frontend → Node.js API → Python ML Model → Prediction → Database → Insights

Tech flow:

React → Express API → Python ML Script → MongoDB Storage

---

⚙️ Tech Stack

Frontend

⚛️ React
🎨 Tailwind CSS

Backend

🟢 Node.js
🚂 Express.js
🔑 JWT Authentication
🔒 bcrypt Password Hashing

Machine Learning

🐍 Python
📊 Scikit-learn
📦 Joblib

Database

🍃 MongoDB

---

🧠 Machine Learning Model

The prediction model uses Linear Regression trained on financial data with the following inputs:

- income
- expenses
- current_savings
- planned_expense
- time_horizon

The model predicts:

future_savings

This prediction powers the financial simulation.

---

📊 Financial Health Logic

CentSight evaluates financial stability using:

Risk Score

Factors include:

- High expense ratio
- Low current savings
- Low predicted savings

Health Categories

🟢 Stable
🟡 Moderate
🔴 Risky

Each simulation returns a personalized insight message.

---

🔐 API Endpoints

Authentication

Signup

POST "/api/auth/signup"

Login

POST "/api/auth/login"

Returns:

JWT Token

---

Financial Simulation

POST "/api/simulate"

Protected route (requires JWT)

Example request:

{
  "income": 80000,
  "expenses": 30000,
  "current_savings": 50000,
  "planned_expense": 20000,
  "time_horizon": 12
}

Response:

{
  "predicted_savings": 170762.33,
  "growth": 120762.33,
  "financial_health": "Stable",
  "risk_score": 40,
  "insight": "Your savings trajectory looks healthy."
}

---

📂 Project Structure

BWT_FuncLexa
│
├── backend
│   ├── middleware
│   │   └── auth.js
│   ├── models
│   │   ├── user.js
│   │   └── simulation.js
│   ├── routes
│   │   ├── auth.js
│   │   └── simulate.js
│   ├── server.js
│   └── package.json
│
├── ml
│   ├── train_model.py
│   ├── predict.py
│   └── model.pkl
│
└── README.md

---

🚀 How to Run the Project

1️⃣ Clone Repository

git clone https://github.com/Mohammad-Adnan-Shakil/BWT_FuncLexa.git

---

2️⃣ Install Backend Dependencies

cd backend
npm install

---

3️⃣ Install Python Dependencies

pip install numpy pandas scikit-learn joblib

---

4️⃣ Run Backend Server

node server.js

Server will run on:

http://localhost:5000

---

🎯 Future Improvements

🔮 AI financial recommendation engine
📊 Spending pattern analysis
📱 Mobile responsive dashboard
📈 Investment forecasting
🤖 Advanced ML models for financial planning

---

🏆 Hackathon Project

Built for Build With TRAE Hackathon under the theme:

Future Finance Innovation Platforms

CentSight demonstrates how AI can assist everyday financial decision making.

---

👨‍💻 Author

Adnan Shakil

Computer Science Engineering Student
Full Stack + AI Developer

---

⭐ If you like the project, feel free to star the repository!
