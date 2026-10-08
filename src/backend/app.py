from fastapi import FastAPI
from pydantic import BaseModel
from models.predictss import predict_model

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
    PercentSalaryHike: int
    TotalWorkingYears: int
    YearsInCurrentRole: int

    
@app.get("/")
def home():
    return {"message": "Welcome to the API"}
   
    
@app.post("/predict")
def predict(ip: Pred_IP):
    ip_dict = ip.dict()
    pred = predict_model(ip_dict)
    return { "prediction": pred }