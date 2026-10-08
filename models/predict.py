import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler


model = load_model('model.h5')
scaler = StandardScaler()

def predict(ip_data):
    df = pd.DataFrame([ip_data])
    
    drop_cols = ["Attrition", "EmployeeCount", "Over18", "StandardHours", "EmployeeNumber"]
    df = df.drop(columns=drop_cols)
    
    cat_cols = df.select_dtypes(include="object").columns.tolist()
    df = pd.get_dummies(df, columns=cat_cols, drop_first=True).astype("float32")
    num_cols = [c for c in df.columns if c not in cat_cols]
    df[num_cols] = scaler.transform(df[num_cols])
    
    df = df.values.reshape(-1, 1, df.shape[1])
    prediction = model.predict(df).ravel()
    
    
    
    return (prediction >= 0.5).astype(int)