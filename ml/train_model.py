import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# set random seed
np.random.seed(42)

# number of samples
num_samples = 1000

# generate synthetic data
income = np.random.randint(15000, 100000, num_samples)
expenses = np.random.randint(5000, 80000, num_samples)
current_savings = np.random.randint(0, 200000, num_samples)
planned_expense = np.random.randint(0, 50000, num_samples)
time_horizon = np.random.choice([6, 12], num_samples)

# calculate future savings
monthly_savings = income - expenses

future_savings = (
    current_savings +
    (monthly_savings * time_horizon) -
    planned_expense +
    np.random.normal(0, 5000, num_samples)
)

# create dataframe
data = pd.DataFrame({
    "income": income,
    "expenses": expenses,
    "current_savings": current_savings,
    "planned_expense": planned_expense,
    "time_horizon": time_horizon,
    "future_savings": future_savings
})

# define features and target
X = data[["income","expenses","current_savings","planned_expense","time_horizon"]]
y = data["future_savings"]

# train model
model = LinearRegression()
model.fit(X, y)

# save model
joblib.dump(model, "model.pkl")

print("Model trained successfully!")