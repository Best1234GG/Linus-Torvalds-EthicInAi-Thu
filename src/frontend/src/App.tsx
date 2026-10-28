import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkApiHealth, sendPrediction } from "./services/predictService";
import { allFields, fallbackValue, sampleValues, sections, validate } from "./formConfig";
import FieldInput from "./components/FieldInput";
import Icon from "./components/Icon";
import ResultCard from "./components/ResultCard";

type FormValues = Record<string, string>;
type ApiStatus = "checking" | "waking" | "online" | "offline";

// Render free tier can take ~30-60s to cold start; give up after this.
const REQUEST_TIMEOUT_MS = 90_000;

function App() {
  const [values, setValues] = useState<FormValues>({});
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [showErrors, setShowErrors] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [submittedValues, setSubmittedValues] = useState<FormValues>({});
  const [submittedUnknown, setSubmittedUnknown] = useState<string[]>([]);
  const [submittedWarnings, setSubmittedWarnings] = useState(0);
  const [stale, setStale] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const requestId = useRef(0);

  // ตรวจสอบและจัดการ Dark / Light Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  // Wake the API on page load so the first prediction is fast.
  const pingApi = useCallback(async () => {
    setApiStatus("checking");
    const slow = setTimeout(() => setApiStatus((s) => (s === "checking" ? "waking" : s)), 4000);
    const ok = await checkApiHealth();
    clearTimeout(slow);
    setApiStatus(ok ? "online" : "offline");
  }, []);

  useEffect(() => {
    pingApi();
  }, [pingApi]);

  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const issues = useMemo(() => validate(values, unknown), [values, unknown]);
  const errorCount = Object.values(issues).filter((i) => i.kind === "error").length;
  const warningCount = Object.values(issues).filter((i) => i.kind === "warning").length;

  const completedCount = allFields.filter((field) => values[field.key] !== undefined && values[field.key] !== "").length;
  const progress = Math.round((completedCount / allFields.length) * 100);

  const markEdited = () => {
    if (predictionResult !== null) setStale(true);
  };

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    markEdited();
  };

  const toggleUnknown = (key: string) => {
    const field = allFields.find((f) => f.key === key)!;
    const next = new Set(unknown);
    if (next.has(key)) {
      next.delete(key);
      setValues((current) => ({ ...current, [key]: "" }));
    } else {
      next.add(key);
      setValues((current) => ({ ...current, [key]: fallbackValue(field) }));
    }
    setUnknown(next);
    markEdited();
  };

  const fillSample = () => {
    setValues({ ...sampleValues });
    setUnknown(new Set());
    setShowErrors(false);
    markEdited();
  };

  const resetForm = () => {
    if (completedCount > 0 && !window.confirm("ล้างข้อมูลที่กรอกทั้งหมด?")) return;
    requestId.current++;
    setValues({});
    setUnknown(new Set());
    setShowErrors(false);
    setPredictionResult(null);
    setStale(false);
    setApiError(null);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    const firstError = allFields.find((field) => issues[field.key]?.kind === "error");
    if (firstError) {
      document.getElementById(firstError.key)?.focus();
      return;
    }
    if (!consent) {
      document.getElementById("consent")?.focus();
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setApiError(null);

    try {
      const res = await Promise.race([
        sendPrediction(values),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("เซิร์ฟเวอร์ตอบกลับช้าเกินไป กรุณาลองใหม่อีกครั้ง")), REQUEST_TIMEOUT_MS),
        ),
      ]);
      if (id !== requestId.current) return;
      setPredictionResult(res.prediction);
      setSubmittedValues({ ...values });
      setSubmittedUnknown([...unknown]);
      setSubmittedWarnings(warningCount);
      setStale(false);
      setApiStatus("online");
      requestAnimationFrame(() => {
        const el = document.getElementById("result");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        el?.focus({ preventScroll: true });
      });
    } catch (err: any) {
      if (id !== requestId.current) return;
      const message = err?.message === "Failed to fetch" ? "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่" : err?.message;
      setApiError(message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const status = {
    checking: { text: "กำลังตรวจสอบระบบ", dot: "bg-slate-400 animate-pulse", box: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" },
    waking: { text: "กำลังปลุกเซิร์ฟเวอร์…", dot: "bg-amber-500 animate-pulse", box: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300" },
    online: { text: "ระบบพร้อมใช้งาน", dot: "bg-emerald-500", box: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400" },
    offline: { text: "เชื่อมต่อไม่ได้ — ลองใหม่", dot: "bg-rose-500", box: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300" },
  }[apiStatus];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <a href="#form" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white">
        ข้ามไปยังแบบฟอร์ม
      </a>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur transition-colors dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
              <Icon name="spark" className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold tracking-tight text-slate-950 dark:text-white">People Insight</div>
              <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">Employee retention support</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={pingApi}
              disabled={apiStatus === "checking" || apiStatus === "waking"}
              title="ตรวจสอบสถานะเซิร์ฟเวอร์อีกครั้ง"
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-300 ${status.box}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`}></span>
              <span className="hidden sm:inline">{status.text}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-900/40"
            >
              <Icon name={isDark ? "sun" : "moon"} className="size-5 text-amber-500 dark:text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Banner */}
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(37,99,235,0.28),transparent_34%),radial-gradient(circle_at_10%_110%,rgba(14,165,233,0.18),transparent_34%)]"></div>
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14 lg:px-10">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                <Icon name="shield" className="size-4" />
                HR DECISION SUPPORT
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                ประเมินแนวโน้มการลาออก
                <span className="mt-1 block text-blue-400">เพื่อดูแลพนักงานได้ทันเวลา</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                กรอกข้อมูล 24 รายการ ถ้าไม่ทราบข้อไหนให้กด <strong className="text-white">"ไม่ทราบ"</strong> ระบบจะใช้ค่ากลางแทน
                ผลลัพธ์ใช้เพื่อวางแผนรักษาบุคลากร ไม่ใช่เพื่อตัดสินลงโทษ
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#form" className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300/30">
                  เริ่มกรอกข้อมูล <Icon name="arrow" className="size-4" />
                </a>
                <button type="button" onClick={fillSample} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 focus:outline-none focus:ring-4 focus:ring-white/10">
                  <Icon name="clipboard" className="size-4" /> ลองด้วยข้อมูลตัวอย่าง
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          {apiStatus === "offline" && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="info" className="mt-0.5 size-5 shrink-0" />
                ยังเชื่อมต่อเซิร์ฟเวอร์ประเมินผลไม่ได้ คุณยังกรอกข้อมูลต่อได้ ข้อมูลจะไม่หาย
              </div>
              <button type="button" onClick={pingApi} className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500">
                ลองเชื่อมต่ออีกครั้ง
              </button>
            </div>
          )}

          {/* Empty / loading / result */}
          {loading ? (
            <div className="mb-8 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900/50 dark:bg-slate-900" role="status" aria-live="polite">
              <div className="flex items-center gap-4">
                <div className="size-10 shrink-0 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-blue-950 dark:border-t-blue-400"></div>
                <div>
                  <div className="font-bold text-slate-950 dark:text-white">กำลังวิเคราะห์ข้อมูล… {elapsed} วินาที</div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {elapsed < 8 ? "โมเดลกำลังประมวลผล" : "เซิร์ฟเวอร์อาจกำลังเริ่มทำงานหลังว่างนาน (อาจใช้เวลาถึง 1 นาที) กรุณารอสักครู่"}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2" aria-hidden="true">
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </div>
          ) : predictionResult !== null ? (
            <ResultCard
              prediction={Number(predictionResult)}
              submittedValues={submittedValues}
              unknownKeys={submittedUnknown}
              warningCount={submittedWarnings}
              stale={stale}
              onDismiss={() => setPredictionResult(null)}
            />
          ) : (
            !apiError && (
              <div className="mb-8 flex items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                <Icon name="info" className="mt-0.5 size-5 shrink-0 text-blue-500" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">ยังไม่มีผลการประเมิน</div>
                  กรอกข้อมูลให้ครบ (หรือกด "ไม่ทราบ") แล้วกด "ประเมินความเสี่ยง" ผลจะแสดงที่นี่
                </div>
              </div>
            )
          )}

          {apiError && !loading && (
            <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 sm:flex-row sm:items-start sm:justify-between dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
              <div className="flex items-start gap-4">
                <Icon name="alert" className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="font-bold text-rose-950 dark:text-rose-100">ประเมินไม่สำเร็จ</div>
                  <p className="mt-1 text-sm">{apiError}</p>
                  <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">ข้อมูลที่กรอกยังอยู่ครบ สามารถกดลองใหม่ได้ทันที</p>
                </div>
              </div>
              <button type="submit" form="predict-form" className="shrink-0 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300">
                ลองใหม่
              </button>
            </div>
          )}

          <form id="predict-form" onSubmit={handleSubmit} noValidate>
            <div id="form" className="grid scroll-mt-24 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="space-y-6">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-slate-800">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <Icon name={section.icon} className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400">หมวด {section.eyebrow}</div>
                        <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950 dark:text-white">{section.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{section.description}</p>
                      </div>
                    </div>

                    <div className="grid gap-x-5 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
                      {section.fields.map((field) => (
                        <FieldInput
                          key={field.key}
                          field={field}
                          value={values[field.key] ?? ""}
                          isUnknown={unknown.has(field.key)}
                          issue={issues[field.key]}
                          showIssue={showErrors || (values[field.key] ?? "") !== ""}
                          onChange={(v) => updateValue(field.key, v)}
                          onToggleUnknown={() => toggleUnknown(field.key)}
                        />
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

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500" style={{ width: `${progress}%` }}></div>
                  </div>

                  <div className="mt-3 flex justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">
                      กรอกแล้ว {completedCount}/{allFields.length}
                      {unknown.size > 0 && <span className="text-amber-600 dark:text-amber-400"> · ไม่ทราบ {unknown.size}</span>}
                    </span>
                    {showErrors && errorCount > 0 && <span className="text-rose-600 dark:text-rose-400">ต้องแก้ {errorCount}</span>}
                  </div>

                  <div className="my-5 border-t border-slate-100 dark:border-slate-800"></div>

                  <nav className="space-y-1" aria-label="หมวดข้อมูล">
                    {sections.map((section) => {
                      const count = section.fields.filter((field) => values[field.key]).length;
                      const hasError = showErrors && section.fields.some((f) => issues[f.key]?.kind === "error");
                      const complete = count === section.fields.length && !hasError;
                      return (
                        <a key={section.id} href={`#${section.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <span
                            className={`grid size-7 place-items-center rounded-lg ${
                              hasError
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                : complete
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            <Icon name={hasError ? "alert" : complete ? "check" : section.icon} className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 group-hover:text-slate-950 dark:text-slate-300 dark:group-hover:text-white">{section.title}</span>
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{count}/{section.fields.length}</span>
                        </a>
                      );
                    })}
                  </nav>
                </div>

                <div className="rounded-2xl border border-transparent bg-slate-950 p-5 text-white shadow-lg shadow-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                  <label className="mb-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-300">
                    <input
                      id="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-blue-500"
                    />
                    <span>
                      ฉันยืนยันว่าพนักงานรับทราบการใช้ข้อมูลนี้ และจะใช้ผลเพื่อดูแล/รักษาพนักงาน ไม่ใช่เพื่อเลิกจ้างหรือลงโทษ
                    </span>
                  </label>
                  {showErrors && !consent && errorCount === 0 && (
                    <p className="-mt-2 mb-3 text-xs font-medium text-rose-300">กรุณายืนยันก่อนประเมิน</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300/30 disabled:cursor-wait disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        กำลังประมวลผล…
                      </>
                    ) : (
                      <>
                        {stale ? "ประเมินใหม่" : "ประเมินความเสี่ยง"}
                        <Icon name="arrow" className="size-4" />
                      </>
                    )}
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
                    ระบบไม่บันทึกข้อมูลที่กรอก ข้อมูลถูกส่งไปประมวลผลเท่านั้น
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 dark:text-slate-500">
          <span>People Insight · เครื่องมือสนับสนุนการตัดสินใจด้านบุคลากร</span>
          <span>ผลการประเมินควรใช้ประกอบการพิจารณาร่วมกับข้อมูลด้านอื่น</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
