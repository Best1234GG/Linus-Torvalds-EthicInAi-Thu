import joblib
from pathlib import Path
import keras
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.h5"
SCALER_PATH = BASE_DIR / "scaler.pkl"
COLUMNS_PATH = BASE_DIR / "model_columns.pkl"

model = keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
model_columns = joblib.load(COLUMNS_PATH)

def predict_model(ip_data):
    df = pd.DataFrame([ip_data])

    drop_cols = ["Attrition", "EmployeeCount", "Over18", "StandardHours", "EmployeeNumber"]
    df = df.drop(columns=drop_cols, errors="ignore")

    num_features = list(scaler.feature_names_in_)
    df[num_features] = scaler.transform(df[num_features])

    cat_cols = df.select_dtypes(include="object").columns.tolist()
    if cat_cols:
        df = pd.get_dummies(df, columns=cat_cols, drop_first=True)

    df = df.reindex(columns=model_columns, fill_value=0)

    input_data = df.values.astype(np.float32).reshape(1, 1, len(model_columns))

    prediction = model.predict(input_data).ravel()
    return int(prediction[0] >= 0.5)