import warnings
warnings.filterwarnings("ignore")
import joblib
import numpy as np
import sys

import os
import joblib

base_dir = os.path.dirname(__file__)
model_path = os.path.join(base_dir, "model.pkl")

model = joblib.load(model_path)
income = float(sys.argv[1])
expenses = float(sys.argv[2])
current_savings = float(sys.argv[3])
planned_expense = float(sys.argv[4])
time_horizon = float(sys.argv[5])

import pandas as pd

input_data = pd.DataFrame([{
    "income": income,
    "expenses": expenses,
    "current_savings": current_savings,
    "planned_expense": planned_expense,
    "time_horizon": time_horizon
}])
prediction = model.predict(input_data)

print(round(prediction[0], 2))