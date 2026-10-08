from fastapi import FastAPI
from pydantic import BaseModel
from models import predict as pd

app = FastAPI()

class Pred_IP(BaseModel):
    Age: int
    DailyRate: int
    DistanceFromHome: int
    Education: int
    EnvironmentSatisfaction: int
    HourlyRate: int
    JobInvolvement: int
    JobLevel: int
    JobSatisfaction: int
    MonthlyIncome: int
    MonthlyRate: int
    NumCompaniesWorked: int
    OverTime: str
    PerformanceRating: int
    RelationshipSatisfaction: int
    StockOptionLevel: int
    TrainingTimesLastYear: int
    WorkLifeBalance: int
    YearsAtCompany: int
    YearsSinceLastPromotion: int
    YearsWithCurrManager: int
    
    
    
@app.post("/predict")
def predict(ip: Pred_IP):
    ip_dict = ip.dict()
    pred = pd.predict(ip_dict)
    return { "prediction": pred }