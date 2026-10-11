import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { sendPrediction } from "./services/predictService";

type FormValues = Record<string, string>;

type Field = {
  key: string;
  label: string;
  hint?: string;
  type: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  options?: { value: string; label: string }[];
};

type Section = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: "user" | "briefcase" | "heart" | "history";
  fields: Field[];
};

const scaleOptions = (labels: string[]) =>
  labels.map((label, index) => ({ value: String(index + 1), label: `${index + 1} — ${label}` }));

const sections: Section[] = [
  {
    id: "personal",
    eyebrow: "01",
    title: "ข้อมูลพื้นฐาน",
    description: "ข้อมูลทั่วไปและประวัติการทำงานเบื้องต้น",
    icon: "user",
    fields: [
      { key: "Age", label: "อายุ", hint: "อายุของพนักงาน", type: "number", min: 18, max: 70, suffix: "ปี" },
      {
        key: "Education",
        label: "ระดับการศึกษา",
        type: "select",
        options: scaleOptions(["ต่ำกว่าปริญญาตรี", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก", "อื่น ๆ"]),
      },
      {
        key: "DistanceFromHome",
        label: "ระยะทางจากบ้าน",
        hint: "ระยะทางจากบ้านถึงที่ทำงาน",
        type: "number",
        min: 0,
        max: 100,
        suffix: "กม.",
      },
      {
        key: "NumCompaniesWorked",
        label: "จำนวนบริษัทที่เคยทำงาน",
        type: "number",
        min: 0,
        max: 20,
        suffix: "แห่ง",
      },
    ],
  },
  {
    id: "job",
    eyebrow: "02",
    title: "บทบาทและค่าตอบแทน",
    description: "รายละเอียดตำแหน่ง รายได้ และรูปแบบการทำงาน",
    icon: "briefcase",
    fields: [
      { key: "JobLevel", label: "ระดับตำแหน่ง", type: "select", options: scaleOptions(["ระดับ 1", "ระดับ 2", "ระดับ 3", "ระดับ 4", "ระดับ 5"]) },
      { key: "JobInvolvement", label: "การมีส่วนร่วมในงาน", type: "select", options: scaleOptions(["น้อย", "ปานกลาง", "มาก", "มากที่สุด"]) },
      { key: "DailyRate", label: "อัตรารายวัน", type: "number", min: 0, max: 100000, suffix: "บาท" },
      { key: "HourlyRate", label: "อัตรารายชั่วโมง", type: "number", min: 0, max: 10000, suffix: "บาท" },
      { key: "MonthlyIncome", label: "รายได้ต่อเดือน", type: "number", min: 0, max: 1000000, suffix: "บาท" },
      { key: "MonthlyRate", label: "อัตราค่าตอบแทนรายเดือน", type: "number", min: 0, max: 1000000, suffix: "บาท" },
      { key: "PercentSalaryHike", label: "เปอร์เซ็นต์ขึ้นเงินเดือน", type: "number", min: 0, max: 100, suffix: "%" },
      {
        key: "OverTime",
        label: "ทำงานล่วงเวลา",
        type: "select",
        options: [
          { value: "Yes", label: "ใช่ — มีการทำงานล่วงเวลา" },
          { value: "No", label: "ไม่ใช่ — ไม่มีการทำงานล่วงเวลา" },
        ],
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
      { key: "EnvironmentSatisfaction", label: "ความพึงพอใจต่อสภาพแวดล้อม", type: "select", options: scaleOptions(["ต่ำ", "ปานกลาง", "สูง", "สูงมาก"]) },
      { key: "JobSatisfaction", label: "ความพึงพอใจในงาน", type: "select", options: scaleOptions(["ต่ำ", "ปานกลาง", "สูง", "สูงมาก"]) },
      { key: "RelationshipSatisfaction", label: "ความพึงพอใจด้านความสัมพันธ์", type: "select", options: scaleOptions(["ต่ำ", "ปานกลาง", "สูง", "สูงมาก"]) },
      { key: "WorkLifeBalance", label: "สมดุลชีวิตและการทำงาน", type: "select", options: scaleOptions(["ไม่ดี", "พอใช้", "ดี", "ดีมาก"]) },
      { key: "PerformanceRating", label: "คะแนนประเมินผลงาน", type: "select", options: scaleOptions(["ต้องปรับปรุง", "ตามเกณฑ์", "ดีเยี่ยม", "โดดเด่น"]) },
      { key: "StockOptionLevel", label: "ระดับสิทธิหุ้น", type: "select", options: scaleOptions(["ไม่มี", "ระดับ 1", "ระดับ 2", "ระดับ 3"]) },
      { key: "TrainingTimesLastYear", label: "การอบรมในปีที่ผ่านมา", type: "number", min: 0, max: 52, suffix: "ครั้ง" },
    ],
  },
  {
    id: "experience",
    eyebrow: "04",
    title: "ประสบการณ์การทำงาน",
    description: "อายุงาน เส้นทางการเติบโต และความต่อเนื่องในบทบาท",
    icon: "history",
    fields: [
      { key: "TotalWorkingYears", label: "ประสบการณ์ทำงานทั้งหมด", type: "number", min: 0, max: 60, suffix: "ปี" },
      { key: "YearsAtCompany", label: "อายุงานในบริษัท", type: "number", min: 0, max: 60, suffix: "ปี" },
      { key: "YearsInCurrentRole", label: "ระยะเวลาในตำแหน่งปัจจุบัน", type: "number", min: 0, max: 60, suffix: "ปี" },
      { key: "YearsSinceLastPromotion", label: "ระยะเวลาจากการเลื่อนตำแหน่งล่าสุด", type: "number", min: 0, max: 60, suffix: "ปี" },
      { key: "YearsWithCurrManager", label: "ระยะเวลาที่ทำงานกับผู้จัดการปัจจุบัน", type: "number", min: 0, max: 60, suffix: "ปี" },
    ],
  },
];

const allFields = sections.flatMap((section) => section.fields);

function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    spark: <><path d="m12 3-1.1 3.2a7 7 0 0 1-4.5 4.5L3 12l3.4 1.2a7 7 0 0 1 4.4 4.5L12 21l1.2-3.3a7 7 0 0 1 4.4-4.5L21 12l-3.4-1.3a7 7 0 0 1-4.4-4.5L12 3Z" /></>,
    user: <><circle cx="12" cy="8" r="3.25" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2" /></>,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    shield: <><path d="M12 22s8-3.7 8-10V5l-8-3-8 3v7c0 6.3 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    reset: <><path d="M4 4v6h6" /><path d="M5.5 15a7 7 0 1 0 .5-7L4 10" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.6 2.6 17A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function App() {
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // ตรวจสอบและจัดการ Dark / Light Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const completedCount = useMemo(
    () => allFields.filter((field) => values[field.key] !== undefined && values[field.key] !== "").length,
    [values],
  );
  const progress = Math.round((completedCount / allFields.length) * 100);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: false }));
    setSubmitted(false);
  };

  const resetForm = () => {
    setValues({});
    setErrors({});
    setSubmitted(false);
    setPredictionResult(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const missing = Object.fromEntries(
      allFields.filter((field) => !values[field.key]).map((field) => [field.key, true]),
    );
    setErrors(missing);

    if (Object.keys(missing).length > 0) {
      const firstMissing = allFields.find((field) => missing[field.key]);
      document.getElementById(firstMissing?.key ?? "")?.focus();
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const res = await sendPrediction(values);
      setPredictionResult(res.prediction);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setApiError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur transition-colors dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none">
              <Icon name="spark" className="size-5" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-950 dark:text-white">People Insight</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Employee risk assessment</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500"></span>
              ระบบพร้อมใช้งาน
            </div>

            {/* ปุ่มกดสลับ Dark / Light Mode */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-900/40"
            >
              <Icon name={isDark ? "sun" : "moon"} className="size-5 text-amber-500 dark:text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Banner Section */}
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(37,99,235,0.28),transparent_34%),radial-gradient(circle_at_10%_110%,rgba(14,165,233,0.18),transparent_34%)]"></div>
          <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                <Icon name="shield" className="size-4" />
                HR DECISION SUPPORT
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                ประเมินแนวโน้มการลาออก
                <span className="mt-1 block text-blue-400">ด้วยข้อมูลที่ชัดเจน</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                กรอกข้อมูลพนักงานให้ครบทั้ง 24 รายการ เพื่อเตรียมข้อมูลสำหรับวิเคราะห์ความเสี่ยง
                และช่วยให้ทีมบุคคลวางแผนดูแลพนักงานได้อย่างเหมาะสม
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* กล่องแสดงผลลัพธ์การประเมิน */}
          {submitted && predictionResult !== null && (() => {
            const isAtRisk = Number(predictionResult) === 1;
            return (
              <div
                className={`mb-8 overflow-hidden rounded-2xl border p-6 shadow-sm transition-all ${
                  isAtRisk
                    ? "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30"
                    : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                }`}
                role="status"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-sm ${
                        isAtRisk ? "bg-rose-600 shadow-rose-200 dark:shadow-none" : "bg-emerald-600 shadow-emerald-200 dark:shadow-none"
                      }`}
                    >
                      <Icon name={isAtRisk ? "alert" : "check"} className="size-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        ผลการวิเคราะห์พนักงาน
                      </div>
                      <h3
                        className={`text-xl font-bold tracking-tight ${
                          isAtRisk ? "text-rose-950 dark:text-rose-100" : "text-emerald-950 dark:text-emerald-100"
                        }`}
                      >
                        {isAtRisk ? "มีความเสี่ยงสูงที่จะลาออก" : "มีแนวโน้มปฏิบัติงานต่อตามปกติ"}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 self-start rounded-full px-4 py-1.5 text-xs font-bold sm:self-auto ${
                      isAtRisk
                        ? "border border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
                        : "border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    }`}
                  >
                    <span className={`size-2 rounded-full ${isAtRisk ? "bg-rose-600 animate-pulse" : "bg-emerald-600"}`} />
                    สถานะ: {isAtRisk ? "High Attrition Risk (1)" : "Low Attrition Risk (0)"}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200/80 pt-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {isAtRisk ? (
                    <p>
                      โมเดลตรวจพบปัจจัยบ่งชี้ความเสี่ยง เช่น ภาระงานล่วงเวลา อัตราผลตอบแทน หรือความพึงพอใจในงาน 
                      <strong className="text-rose-900 dark:text-rose-200"> แนะนำให้ทีม HR หรือหัวหน้างานนัดสนทนาแบบ 1-on-1 </strong> 
                      เพื่อรับฟังความคิดเห็นและวางแนวทางรักษาบุคลากรล่วงหน้า
                    </p>
                  ) : (
                    <p>
                      พนักงานรายนี้มีความผูกพันต่อองค์กรและดัชนีความพึงพอใจอยู่ในเกณฑ์ที่มีเสถียรภาพ 
                      ยังไม่พบสัญญาณความเสี่ยงต่อการลาออกในระยะเวลาอันใกล้
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ข้อความแจ้งเตือนข้อผิดพลาด */}
          {apiError && (
            <div className="mb-7 flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              <Icon name="alert" className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <div className="font-bold text-rose-950 dark:text-rose-100">เกิดข้อผิดพลาดในการประมวลผล</div>
                <p className="mt-1 text-sm">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="space-y-6">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-slate-800">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <Icon name={section.icon} className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400">
                          หมวด {section.eyebrow}
                        </div>
                        <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                          {section.title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-x-5 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
                      {section.fields.map((field) => (
                        <label key={field.key} className="block">
                          <span className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {field.label} <span className="text-rose-500">*</span>
                            </span>
                            {field.hint && (
                              <span className="hidden text-xs text-slate-400 xl:block dark:text-slate-500">
                                {field.hint}
                              </span>
                            )}
                          </span>

                          <span className="relative block">
                            {field.type === "select" ? (
                              <select
                                id={field.key}
                                value={values[field.key] ?? ""}
                                onChange={(event) => updateValue(field.key, event.target.value)}
                                aria-invalid={errors[field.key] || undefined}
                                className={`h-12 w-full appearance-none rounded-xl border px-4 pr-10 text-sm font-medium outline-none transition focus:ring-4 ${
                                  errors[field.key]
                                    ? "border-rose-400 bg-white text-rose-900 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500 dark:bg-slate-950 dark:text-rose-200 dark:focus:ring-rose-950/40"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-950/40"
                                }`}
                              >
                                <option value="" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                  เลือกรายการ
                                </option>
                                {field.options?.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                    className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={field.key}
                                type="number"
                                inputMode="decimal"
                                min={field.min}
                                max={field.max}
                                step={field.step ?? 1}
                                value={values[field.key] ?? ""}
                                onChange={(event) => updateValue(field.key, event.target.value)}
                                placeholder="0"
                                aria-invalid={errors[field.key] || undefined}
                                className={`h-12 w-full rounded-xl border px-4 text-sm font-medium outline-none transition placeholder:text-slate-300 focus:ring-4 dark:placeholder:text-slate-600 ${
                                  field.suffix ? "pr-16" : ""
                                } ${
                                  errors[field.key]
                                    ? "border-rose-400 bg-white text-rose-900 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500 dark:bg-slate-950 dark:text-rose-200 dark:focus:ring-rose-950/40"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-950/40"
                                }`}
                              />
                            )}

                            {field.type === "select" && (
                              <svg
                                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.2 7.2a.75.75 0 0 1 1.1 0l3.7 3.7 3.7-3.7a.75.75 0 1 1 1.1 1.1l-4.3 4.2a.75.75 0 0 1-1 0L5.2 8.3a.75.75 0 0 1 0-1.1Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}

                            {field.suffix && field.type === "number" && (
                              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                                {field.suffix}
                              </span>
                            )}
                          </span>

                          {errors[field.key] && (
                            <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                              <Icon name="alert" className="size-3.5" />
                              กรุณาระบุข้อมูล
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Sidebar */}
              <aside className="space-y-5 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-950 dark:text-white">ความครบถ้วนของข้อมูล</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">อัปเดตอัตโนมัติขณะกรอก</div>
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{progress}%</div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="mt-3 flex justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">กรอกแล้ว {completedCount} รายการ</span>
                    <span className="text-slate-400 dark:text-slate-500">ทั้งหมด 24</span>
                  </div>

                  <div className="my-5 border-t border-slate-100 dark:border-slate-800"></div>

                  <nav className="space-y-1" aria-label="หมวดข้อมูล">
                    {sections.map((section) => {
                      const count = section.fields.filter((field) => values[field.key]).length;
                      const complete = count === section.fields.length;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <span
                            className={`grid size-7 place-items-center rounded-lg ${
                              complete
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {complete ? <Icon name="check" className="size-4" /> : <Icon name={section.icon} className="size-3.5" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 group-hover:text-slate-950 dark:text-slate-300 dark:group-hover:text-white">
                            {section.title}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {count}/{section.fields.length}
                          </span>
                        </a>
                      );
                    })}
                  </nav>
                </div>

                <div className="rounded-2xl border border-transparent bg-slate-950 p-5 text-white shadow-lg shadow-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300/30 disabled:opacity-50"
                  >
                    {loading ? "กำลังประมวลผล..." : "ประเมินความเสี่ยง"}
                    <Icon name="arrow" className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <Icon name="reset" className="size-3.5" />
                    ล้างข้อมูลทั้งหมด
                  </button>
                  <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
                    <Icon name="lock" className="mt-0.5 size-3.5 shrink-0" />
                    ข้อมูลใช้เพื่อการประเมินเท่านั้น และควรจัดเก็บตามนโยบายความเป็นส่วนตัวขององค์กร
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 dark:text-slate-500">
          <span>People Insight · เครื่องมือสนับสนุนการตัดสินใจด้านบุคลากร</span>
          <span>ผลการประเมินควรใช้ประกอบการพิจารณาร่วมกับข้อมูลด้านอื่น</span>
        </div>
      </footer>
    </div>
  );
}

export default App;