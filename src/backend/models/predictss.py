import joblib
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_PATH = BASE_DIR / "model.joblib"

# Built by main.ipynb: sklearn Pipeline (feature engineering + scaling + one-hot + classifier),
# the decision threshold chosen on cross-validation, and the exact input fields it was trained on.
artifact = joblib.load(ARTIFACT_PATH)
pipeline = artifact["pipeline"]
threshold = artifact["threshold"]
features = artifact["features"]


def predict_proba(ip_data):
    # Indexing by name fails loudly on a missing field instead of silently filling it.
    df = pd.DataFrame([{name: ip_data[name] for name in features}])
    return float(pipeline.predict_proba(df)[0, 1])


def predict_model(ip_data):
    return int(predict_proba(ip_data) >= threshold)
