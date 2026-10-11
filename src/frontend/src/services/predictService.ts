export interface PredIPPayload {
  Age: number;
  DailyRate: number;
  DistanceFromHome: number;
  Education: number;
  EnvironmentSatisfaction: number;
  HourlyRate: number;
  JobInvolvement: number;
  JobLevel: number;
  JobSatisfaction: number;
  MonthlyIncome: number;
  MonthlyRate: number;
  NumCompaniesWorked: number;
  OverTime: string;
  PerformanceRating: number;
  RelationshipSatisfaction: number;
  StockOptionLevel: number;
  TrainingTimesLastYear: number;
  WorkLifeBalance: number;
  YearsAtCompany: number;
  YearsSinceLastPromotion: number;
  YearsWithCurrManager: number;
  PercentSalaryHike: number;
  TotalWorkingYears: number;
  YearsInCurrentRole: number;
}

export interface PredictResponse {
  prediction: any;
}

export async function sendPrediction(formValues: Record<string, string>): Promise<PredictResponse> {
  // แปลงค่า string จาก React form ให้ตรงกับ Pydantic Schema ของ FastAPI
  const payload: PredIPPayload = {
    Age: parseInt(formValues.Age, 10) || 0,
    DailyRate: parseInt(formValues.DailyRate, 10) || 0,
    DistanceFromHome: parseInt(formValues.DistanceFromHome, 10) || 0,
    Education: parseInt(formValues.Education, 10) || 0,
    EnvironmentSatisfaction: parseInt(formValues.EnvironmentSatisfaction, 10) || 0,
    HourlyRate: parseInt(formValues.HourlyRate, 10) || 0,
    JobInvolvement: parseInt(formValues.JobInvolvement, 10) || 0,
    JobLevel: parseInt(formValues.JobLevel, 10) || 0,
    JobSatisfaction: parseInt(formValues.JobSatisfaction, 10) || 0,
    MonthlyIncome: parseInt(formValues.MonthlyIncome, 10) || 0,
    MonthlyRate: parseInt(formValues.MonthlyRate, 10) || 0,
    NumCompaniesWorked: parseInt(formValues.NumCompaniesWorked, 10) || 0,
    OverTime: formValues.OverTime || "No", // OverTime เป็น string เดียวในโมเดล
    PerformanceRating: parseInt(formValues.PerformanceRating, 10) || 0,
    RelationshipSatisfaction: parseInt(formValues.RelationshipSatisfaction, 10) || 0,
    StockOptionLevel: parseInt(formValues.StockOptionLevel, 10) || 0,
    TrainingTimesLastYear: parseInt(formValues.TrainingTimesLastYear, 10) || 0,
    WorkLifeBalance: parseInt(formValues.WorkLifeBalance, 10) || 0,
    YearsAtCompany: parseInt(formValues.YearsAtCompany, 10) || 0,
    YearsSinceLastPromotion: parseInt(formValues.YearsSinceLastPromotion, 10) || 0,
    YearsWithCurrManager: parseInt(formValues.YearsWithCurrManager, 10) || 0,
    PercentSalaryHike: parseInt(formValues.PercentSalaryHike, 10) || 0,
    TotalWorkingYears: parseInt(formValues.TotalWorkingYears, 10) || 0,
    YearsInCurrentRole: parseInt(formValues.YearsInCurrentRole, 10) || 0,
  };

  const response = await fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // อ่านรายละเอียดข้อผิดพลาดที่ FastAPI ส่งกลับมาเพื่อดูว่าฟิลด์ใดมีปัญหา
    const errBody = await response.json().catch(() => null);
    if (errBody && errBody.detail) {
      const detailMessages = Array.isArray(errBody.detail)
        ? errBody.detail.map((d: any) => `${d.loc.slice(1).join(".")}: ${d.msg}`).join(", ")
        : JSON.stringify(errBody.detail);
      throw new Error(`ข้อมูลไม่ถูกต้อง: ${detailMessages}`);
    }
    throw new Error(`การส่งข้อมูลล้มเหลว (Status: ${response.status})`);
  }

  return response.json();
}