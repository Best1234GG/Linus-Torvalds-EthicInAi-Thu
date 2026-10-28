// Form definition for the 24 /predict inputs.
// `key` and option `value`s are what the model receives — they must match
// Pred_IP in src/backend/app.py (checked by scripts/check_contract.py).
// `train` is the min/max/median seen in data/Data/data.csv (IBM HR dataset);
// the median is used when the user marks a field as "ไม่ทราบ".

export type Option = { value: string; label: string };

export type Field = {
  key: string;
  label: string;
  hint?: string;
  type: "number" | "select";
  min?: number;
  max?: number;
  suffix?: string;
  options?: Option[];
  train: { min: number; max: number; median: number } | { mode: string };
};

export type Section = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: "user" | "briefcase" | "heart" | "history";
  fields: Field[];
};

// Builds options whose values start at `start` (most IBM scales start at 1, StockOptionLevel at 0).
const scaleOptions = (labels: string[], start = 1): Option[] =>
  labels.map((label, index) => ({ value: String(index + start), label: `${index + start} — ${label}` }));

const satisfaction = ["ต่ำ", "ปานกลาง", "สูง", "สูงมาก"];

export const sections: Section[] = [
  {
    id: "personal",
    eyebrow: "01",
    title: "ข้อมูลพื้นฐาน",
    description: "ข้อมูลทั่วไปและประวัติการทำงานเบื้องต้น",
    icon: "user",
    fields: [
      { key: "Age", label: "อายุ", type: "number", min: 18, max: 70, suffix: "ปี", train: { min: 18, max: 60, median: 36 } },
      {
        key: "Education",
        label: "ระดับการศึกษา",
        type: "select",
        options: scaleOptions(["ต่ำกว่าอนุปริญญา", "อนุปริญญา / ปวส.", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก"]),
        train: { min: 1, max: 5, median: 3 },
      },
      {
        key: "DistanceFromHome",
        label: "ระยะทางจากบ้าน",
        hint: "ระยะทางจากบ้านถึงที่ทำงาน",
        type: "number",
        min: 0,
        max: 200,
        suffix: "กม.",
        train: { min: 1, max: 29, median: 7 },
      },
      {
        key: "NumCompaniesWorked",
        label: "จำนวนบริษัทที่เคยทำงาน",
        hint: "ไม่รวมบริษัทปัจจุบัน",
        type: "number",
        min: 0,
        max: 30,
        suffix: "แห่ง",
        train: { min: 0, max: 9, median: 2 },
      },
    ],
  },
  {
    id: "job",
    eyebrow: "02",
    title: "บทบาทและค่าตอบแทน",
    description: "ตัวเลขค่าตอบแทนใช้หน่วย USD ตามชุดข้อมูลที่ใช้เทรนโมเดล",
    icon: "briefcase",
    fields: [
      {
        key: "JobLevel",
        label: "ระดับตำแหน่ง",
        type: "select",
        options: scaleOptions(["ระดับเริ่มต้น", "ระดับปฏิบัติการ", "ระดับอาวุโส", "ระดับผู้จัดการ", "ระดับผู้บริหาร"]),
        train: { min: 1, max: 5, median: 2 },
      },
      {
        key: "JobInvolvement",
        label: "การมีส่วนร่วมในงาน",
        type: "select",
        options: scaleOptions(["น้อย", "ปานกลาง", "มาก", "มากที่สุด"]),
        train: { min: 1, max: 4, median: 3 },
      },
      { key: "MonthlyIncome", label: "รายได้ต่อเดือน", type: "number", min: 0, max: 100000, suffix: "USD", train: { min: 1009, max: 19999, median: 4919 } },
      { key: "MonthlyRate", label: "อัตราค่าจ้างรายเดือน", hint: "อัตราตามสัญญา", type: "number", min: 0, max: 100000, suffix: "USD", train: { min: 2094, max: 26999, median: 14235 } },
      { key: "DailyRate", label: "อัตรารายวัน", type: "number", min: 0, max: 10000, suffix: "USD", train: { min: 102, max: 1499, median: 802 } },
      { key: "HourlyRate", label: "อัตรารายชั่วโมง", type: "number", min: 0, max: 1000, suffix: "USD", train: { min: 30, max: 100, median: 66 } },
      { key: "PercentSalaryHike", label: "เปอร์เซ็นต์ขึ้นเงินเดือนล่าสุด", type: "number", min: 0, max: 100, suffix: "%", train: { min: 11, max: 25, median: 14 } },
      {
        key: "OverTime",
        label: "ทำงานล่วงเวลา",
        type: "select",
        options: [
          { value: "Yes", label: "ใช่ — มีการทำงานล่วงเวลา" },
          { value: "No", label: "ไม่ใช่ — ไม่มีการทำงานล่วงเวลา" },
        ],
        train: { mode: "No" },
      },
    ],
  },
  {
    id: "satisfaction",
    eyebrow: "03",
    title: "ความพึงพอใจและสมดุล",
    description: "มุมมองของพนักงานต่อสภาพแวดล้อมและการทำงาน",
    icon: "heart",
    fields: [
      { key: "EnvironmentSatisfaction", label: "ความพึงพอใจต่อสภาพแวดล้อม", type: "select", options: scaleOptions(satisfaction), train: { min: 1, max: 4, median: 3 } },
      { key: "JobSatisfaction", label: "ความพึงพอใจในงาน", type: "select", options: scaleOptions(satisfaction), train: { min: 1, max: 4, median: 3 } },
      { key: "RelationshipSatisfaction", label: "ความพึงพอใจด้านความสัมพันธ์", type: "select", options: scaleOptions(satisfaction), train: { min: 1, max: 4, median: 3 } },
      { key: "WorkLifeBalance", label: "สมดุลชีวิตและการทำงาน", type: "select", options: scaleOptions(["ไม่ดี", "พอใช้", "ดี", "ดีมาก"]), train: { min: 1, max: 4, median: 3 } },
      {
        key: "PerformanceRating",
        label: "คะแนนประเมินผลงาน",
        hint: "ข้อมูลเทรนมีเฉพาะระดับ 3–4",
        type: "select",
        options: scaleOptions(["ต่ำ", "ดี", "ดีเยี่ยม", "โดดเด่น"]),
        train: { min: 3, max: 4, median: 3 },
      },
      {
        key: "StockOptionLevel",
        label: "ระดับสิทธิหุ้น",
        type: "select",
        options: scaleOptions(["ไม่มี", "ระดับ 1", "ระดับ 2", "ระดับ 3"], 0),
        train: { min: 0, max: 3, median: 1 },
      },
      { key: "TrainingTimesLastYear", label: "การอบรมในปีที่ผ่านมา", type: "number", min: 0, max: 52, suffix: "ครั้ง", train: { min: 0, max: 6, median: 3 } },
    ],
  },
  {
    id: "experience",
    eyebrow: "04",
    title: "ประสบการณ์การทำงาน",
    description: "อายุงาน เส้นทางการเติบโต และความต่อเนื่องในบทบาท",
    icon: "history",
    fields: [
      { key: "TotalWorkingYears", label: "ประสบการณ์ทำงานทั้งหมด", type: "number", min: 0, max: 60, suffix: "ปี", train: { min: 0, max: 40, median: 10 } },
      { key: "YearsAtCompany", label: "อายุงานในบริษัท", type: "number", min: 0, max: 60, suffix: "ปี", train: { min: 0, max: 40, median: 5 } },
      { key: "YearsInCurrentRole", label: "ระยะเวลาในตำแหน่งปัจจุบัน", type: "number", min: 0, max: 60, suffix: "ปี", train: { min: 0, max: 18, median: 3 } },
      { key: "YearsSinceLastPromotion", label: "ระยะเวลาจากการเลื่อนตำแหน่งล่าสุด", type: "number", min: 0, max: 60, suffix: "ปี", train: { min: 0, max: 15, median: 1 } },
      { key: "YearsWithCurrManager", label: "ระยะเวลาที่ทำงานกับผู้จัดการปัจจุบัน", type: "number", min: 0, max: 60, suffix: "ปี", train: { min: 0, max: 17, median: 3 } },
    ],
  },
];

export const allFields = sections.flatMap((section) => section.fields);

export const fallbackValue = (field: Field) => ("mode" in field.train ? field.train.mode : String(field.train.median));

// Row 1 of data.csv — handy for demos.
export const sampleValues: Record<string, string> = {
  Age: "41", Education: "2", DistanceFromHome: "1", NumCompaniesWorked: "8",
  JobLevel: "2", JobInvolvement: "3", MonthlyIncome: "5993", MonthlyRate: "19479",
  DailyRate: "1102", HourlyRate: "94", PercentSalaryHike: "11", OverTime: "Yes",
  EnvironmentSatisfaction: "2", JobSatisfaction: "4", RelationshipSatisfaction: "1", WorkLifeBalance: "1",
  PerformanceRating: "3", StockOptionLevel: "0", TrainingTimesLastYear: "0",
  TotalWorkingYears: "8", YearsAtCompany: "6", YearsInCurrentRole: "4", YearsSinceLastPromotion: "0", YearsWithCurrManager: "5",
};

export type FieldIssue = { kind: "error" | "warning"; message: string };

// Hard errors block submit; warnings only inform (value is still sent as entered).
export function validate(values: Record<string, string>, unknown: Set<string>): Record<string, FieldIssue> {
  const issues: Record<string, FieldIssue> = {};
  const num = (k: string) => Number(values[k]);

  for (const field of allFields) {
    const raw = values[field.key];
    if (raw === undefined || raw === "") {
      issues[field.key] = { kind: "error", message: "กรุณาระบุข้อมูล หรือกด \"ไม่ทราบ\"" };
      continue;
    }
    if (field.type !== "number" || unknown.has(field.key)) continue;
    const n = Number(raw);
    if (!Number.isFinite(n)) issues[field.key] = { kind: "error", message: "กรุณากรอกเป็นตัวเลข" };
    else if (!Number.isInteger(n)) issues[field.key] = { kind: "error", message: "กรุณากรอกเป็นจำนวนเต็ม" };
    else if (field.min !== undefined && n < field.min) issues[field.key] = { kind: "error", message: `ต้องไม่น้อยกว่า ${field.min}` };
    else if (field.max !== undefined && n > field.max) issues[field.key] = { kind: "error", message: `ต้องไม่เกิน ${field.max.toLocaleString()}` };
    else if ("min" in field.train && (n < field.train.min || n > field.train.max))
      issues[field.key] = {
        kind: "warning",
        message: `นอกช่วงที่โมเดลเคยเรียนรู้ (${field.train.min.toLocaleString()}–${field.train.max.toLocaleString()}) ผลอาจคลาดเคลื่อน`,
      };
  }

  // Cross-field sanity checks — only between values the user actually entered.
  const known = (k: string) => values[k] !== undefined && values[k] !== "" && !unknown.has(k) && !issues[k];
  const notMore = (a: string, b: string, message: string) => {
    if (known(a) && known(b) && num(a) > num(b)) issues[a] = { kind: "error", message };
  };
  notMore("YearsAtCompany", "TotalWorkingYears", "อายุงานในบริษัทต้องไม่เกินประสบการณ์ทั้งหมด");
  notMore("YearsInCurrentRole", "YearsAtCompany", "ต้องไม่เกินอายุงานในบริษัท");
  notMore("YearsSinceLastPromotion", "YearsAtCompany", "ต้องไม่เกินอายุงานในบริษัท");
  notMore("YearsWithCurrManager", "YearsAtCompany", "ต้องไม่เกินอายุงานในบริษัท");
  if (known("TotalWorkingYears") && known("Age") && num("TotalWorkingYears") > num("Age") - 14)
    issues.TotalWorkingYears = { kind: "error", message: "ประสบการณ์ทำงานมากเกินไปเมื่อเทียบกับอายุ" };

  return issues;
}
