"""Feature definitions shared by training (main.ipynb) and inference (predictss.py).

The model is trained on exactly the fields that POST /predict receives (Pred_IP in app.py),
so inference never has to invent values for columns the API does not send.
"""
import numpy as np
import pandas as pd

NUMERIC_FEATURES = [
    "Age",
    "DailyRate",
    "DistanceFromHome",
    "Education",
    "EnvironmentSatisfaction",
    "HourlyRate",
    "JobInvolvement",
    "JobLevel",
    "JobSatisfaction",
    "MonthlyIncome",
    "MonthlyRate",
    "NumCompaniesWorked",
    "PerformanceRating",
    "RelationshipSatisfaction",
    "StockOptionLevel",
    "TrainingTimesLastYear",
    "WorkLifeBalance",
    "YearsAtCompany",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
    "PercentSalaryHike",
    "TotalWorkingYears",
    "YearsInCurrentRole",
]
CATEGORICAL_FEATURES = ["OverTime"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

# Right-skewed counts and money: log1p keeps a few large values from dominating the scaler.
LOG_FEATURES = [
    "MonthlyIncome",
    "TotalWorkingYears",
    "YearsAtCompany",
    "YearsInCurrentRole",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
    "DistanceFromHome",
    "NumCompaniesWorked",
]
ENGINEERED_FEATURES = [
    "TenureRatio",
    "PromotionGapRatio",
    "IncomePerLevel",
    "CompaniesPerYear",
    "SatisfactionTotal",
]


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Derive ratio features from the raw API fields, then log-transform skewed columns."""
    out = df.copy()
    out["TenureRatio"] = df["YearsAtCompany"] / (df["TotalWorkingYears"] + 1)
    out["PromotionGapRatio"] = df["YearsSinceLastPromotion"] / (df["YearsAtCompany"] + 1)
    out["IncomePerLevel"] = df["MonthlyIncome"] / df["JobLevel"].clip(lower=1)
    out["CompaniesPerYear"] = df["NumCompaniesWorked"] / (df["TotalWorkingYears"] + 1)
    out["SatisfactionTotal"] = df[
        ["EnvironmentSatisfaction", "JobSatisfaction", "RelationshipSatisfaction", "WorkLifeBalance", "JobInvolvement"]
    ].sum(axis=1)
    out[LOG_FEATURES] = np.log1p(df[LOG_FEATURES].clip(lower=0))
    return out
