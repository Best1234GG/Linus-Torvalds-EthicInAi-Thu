from fastapi import FastAPI
from pydantic import BaseModel
from models.predictss import predict_model
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://de83-118-173-212-29.ngrok-free.app"],  # ใส่ URL ของ Frontend ที่คุณใช้
    allow_methods=["*"],  # อนุญาตทุก method
    allow_headers=["*"],  # อนุญาตทุก header
    allow_credentials=True,
)
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