import { allFields } from "../formConfig";
import Icon from "./Icon";

type Props = {
  prediction: number;
  submittedValues: Record<string, string>;
  unknownKeys: string[];
  warningCount: number;
  stale: boolean;
  onDismiss: () => void;
};

// Talking points derived from the entered values (well-known attrition drivers in the IBM dataset).
// These are NOT an explanation of the model's decision.
function talkingPoints(v: Record<string, string>, unknown: Set<string>): string[] {
  const has = (k: string) => !unknown.has(k);
  const n = (k: string) => Number(v[k]);
  const points: string[] = [];
  if (has("OverTime") && v.OverTime === "Yes") points.push("ทำงานล่วงเวลาเป็นประจำ — ลองคุยเรื่องภาระงานและการกระจายงาน");
  if (has("JobSatisfaction") && n("JobSatisfaction") <= 2) points.push("ความพึงพอใจในงานค่อนข้างต่ำ — ถามถึงสิ่งที่อยากทำหรืออยากเปลี่ยน");
  if (has("EnvironmentSatisfaction") && n("EnvironmentSatisfaction") <= 2) points.push("ไม่ค่อยพอใจสภาพแวดล้อมการทำงาน");
  if (has("WorkLifeBalance") && n("WorkLifeBalance") <= 2) points.push("สมดุลชีวิตและงานไม่ดี — พิจารณาความยืดหยุ่นด้านเวลา");
  if (has("RelationshipSatisfaction") && n("RelationshipSatisfaction") <= 2) points.push("ความสัมพันธ์ในทีมอาจมีปัญหา");
  if (has("YearsSinceLastPromotion") && n("YearsSinceLastPromotion") >= 4) points.push("ไม่ได้เลื่อนตำแหน่งมาหลายปี — คุยเรื่องเส้นทางการเติบโต");
  if (has("StockOptionLevel") && n("StockOptionLevel") === 0) points.push("ยังไม่มีสิทธิหุ้น/ผลตอบแทนระยะยาว");
  if (has("DistanceFromHome") && n("DistanceFromHome") >= 15) points.push("เดินทางไกล — พิจารณาการทำงานแบบยืดหยุ่น");
  if (has("TrainingTimesLastYear") && n("TrainingTimesLastYear") <= 1) points.push("ได้รับการอบรมน้อยในปีที่ผ่านมา");
  return points;
}

export default function ResultCard({ prediction, submittedValues, unknownKeys, warningCount, stale, onDismiss }: Props) {
  const isAtRisk = prediction === 1;
  const unknownSet = new Set(unknownKeys);
  const points = talkingPoints(submittedValues, unknownSet);
  const reliability = unknownKeys.length === 0 && warningCount === 0 ? "ปกติ" : unknownKeys.length > 8 ? "ต่ำ" : "ลดลง";
  const unknownLabels = allFields.filter((f) => unknownSet.has(f.key)).map((f) => f.label);

  return (
    <div
      id="result"
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className={`mb-8 scroll-mt-24 overflow-hidden rounded-2xl border shadow-sm outline-none transition ${
        stale ? "opacity-70" : ""
      } ${
        isAtRisk
          ? "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30"
          : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
      }`}
    >
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white ${isAtRisk ? "bg-rose-600" : "bg-emerald-600"}`}>
              <Icon name={isAtRisk ? "alert" : "check"} className="size-6" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">ผลการวิเคราะห์</div>
              <h3 className={`text-xl font-bold tracking-tight ${isAtRisk ? "text-rose-950 dark:text-rose-100" : "text-emerald-950 dark:text-emerald-100"}`}>
                {isAtRisk ? "มีแนวโน้มที่จะลาออก" : "มีแนวโน้มทำงานต่อตามปกติ"}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              ความน่าเชื่อถือของข้อมูล: {reliability}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="ปิดผลการวิเคราะห์"
              className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:hover:bg-slate-800"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        </div>

        {stale && (
          <p className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            มีการแก้ไขข้อมูลหลังประเมิน — กด "ประเมินความเสี่ยง" อีกครั้งเพื่ออัปเดตผล
          </p>
        )}

        <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:text-slate-300">
          <p>
            {isAtRisk
              ? "โมเดลจัดให้อยู่ในกลุ่มที่มีแนวโน้มลาออก แนะนำให้นัดพูดคุยแบบ 1-on-1 เพื่อรับฟังและหาแนวทางดูแลร่วมกัน"
              : "โมเดลไม่พบสัญญาณการลาออกที่ชัดเจน อย่างไรก็ตามการพูดคุยสม่ำเสมอยังเป็นสิ่งสำคัญ"}
          </p>

          {points.length > 0 && (
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">ประเด็นที่อาจนำไปพูดคุย</div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                * สรุปจากข้อมูลที่กรอก ไม่ใช่เหตุผลที่โมเดลใช้ตัดสิน
              </p>
            </div>
          )}

          {unknownLabels.length > 0 && (
            <p className="text-xs text-amber-800 dark:text-amber-300">
              ใช้ค่ากลางแทน {unknownLabels.length} รายการ: {unknownLabels.join(", ")}
            </p>
          )}
          {warningCount > 0 && (
            <p className="text-xs text-amber-800 dark:text-amber-300">มี {warningCount} ค่าที่อยู่นอกช่วงข้อมูลที่โมเดลเคยเรียนรู้</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 border-t border-slate-200/80 bg-white/50 px-6 py-3 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <Icon name="shield" className="mt-0.5 size-4 shrink-0" />
        ผลนี้เป็นการคาดการณ์ทางสถิติ (ใช่/ไม่ใช่) ไม่มีค่าความมั่นใจประกอบ และโมเดลไม่ได้รับข้อมูลแผนก ตำแหน่งงาน และสถานภาพ —
        ห้ามใช้เป็นเหตุผลในการเลิกจ้าง ลดตำแหน่ง หรือปฏิบัติต่อพนักงานอย่างไม่เป็นธรรม
      </div>
    </div>
  );
}
