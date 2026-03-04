💡 AI Financial Clarity Companion
Team: FuncLexa
🚀 Problem Statement

Most individuals earning modest incomes make major financial decisions without structured financial insight. Existing financial tools are often built for financially literate users and fail to provide simple, actionable clarity for everyday earners.

There is a need for an AI-powered companion that helps users understand their financial stability before making spending decisions.

💡 Proposed Solution

We are building an AI Financial Clarity Companion that enables users to evaluate their financial position using predictive modeling.

The system analyzes income, expenses, savings, and planned spending to provide:

Projected financial position

Financial stability assessment

Actionable recommendations

Instead of just tracking money, our platform delivers clarity and confidence in decision-making.

🎯 Key Features

Financial clarity input form

AI-powered future savings prediction

Stability classification (Stable / Moderate / High Risk)

Actionable insight generation

Interactive dashboard

Persistent storage of financial evaluations

🤖 AI Component

We implement a regression-based financial forecasting engine:

Linear Regression → Predict future financial position

Synthetic dataset generation for training

Model trained using Python (scikit-learn)

Node.js backend invokes Python prediction script using child_process

Real-time integration with backend API

This ensures fast, explainable, and hackathon-ready AI integration.

🏗 System Architecture

Frontend (React + Tailwind CSS)
↓
Backend (Node.js + Express)
↓
Python Prediction Script (Linear Regression Model)
↓
MongoDB Database

🔄 Application Flow

User Input
→ Backend API
→ Python ML Prediction
→ MongoDB Storage
→ Dashboard with Stability Insight

🛠 Tech Stack

Frontend: React, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
AI: Python, scikit-learn
Version Control: Git & GitHub

🔮 Future Scope

Personalized financial habit analysis

Intelligent savings optimization

Adaptive risk scoring models

Advanced predictive analytics for long-term financial planning
