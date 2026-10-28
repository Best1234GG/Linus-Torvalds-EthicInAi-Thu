import { Field, FieldIssue, fallbackValue } from "../formConfig";
import Icon from "./Icon";

type Props = {
  field: Field;
  value: string;
  isUnknown: boolean;
  issue?: FieldIssue;
  showIssue: boolean;
  onChange: (value: string) => void;
  onToggleUnknown: () => void;
};

const base =
  "h-12 w-full rounded-xl border px-4 text-sm font-medium outline-none transition focus:ring-4 disabled:cursor-not-allowed";
const normal =
  "border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-950/40";
const invalid =
  "border-rose-400 bg-white text-rose-900 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500 dark:bg-slate-950 dark:text-rose-200 dark:focus:ring-rose-950/40";
const warned =
  "border-amber-300 bg-white text-slate-800 focus:border-amber-500 focus:ring-amber-100 dark:border-amber-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-amber-950/40";
const muted =
  "border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400";

export default function FieldInput({ field, value, isUnknown, issue, showIssue, onChange, onToggleUnknown }: Props) {
  const visibleIssue = issue && (issue.kind === "warning" || showIssue) ? issue : undefined;
  const tone = isUnknown ? muted : visibleIssue?.kind === "error" ? invalid : visibleIssue?.kind === "warning" ? warned : normal;
  const describedBy = visibleIssue ? `${field.key}-issue` : field.hint ? `${field.key}-hint` : undefined;
  const fallbackLabel =
    field.type === "select" ? field.options?.find((o) => o.value === fallbackValue(field))?.label : `${Number(fallbackValue(field)).toLocaleString()} ${field.suffix ?? ""}`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={field.key} className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {field.label} <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={onToggleUnknown}
          aria-pressed={isUnknown}
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            isUnknown
              ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {isUnknown ? "✓ ไม่ทราบ" : "ไม่ทราบ"}
        </button>
      </div>

      <div className="relative">
        {field.type === "select" ? (
          <select
            id={field.key}
            value={value}
            disabled={isUnknown}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={visibleIssue?.kind === "error" || undefined}
            aria-describedby={describedBy}
            className={`${base} appearance-none pr-10 ${tone}`}
          >
            <option value="" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200">เลือกรายการ</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={field.key}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            step={1}
            value={value}
            disabled={isUnknown}
            onChange={(event) => onChange(event.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
            placeholder={"min" in field.train ? `เช่น ${field.train.median.toLocaleString()}` : ""}
            aria-invalid={visibleIssue?.kind === "error" || undefined}
            aria-describedby={describedBy}
            className={`${base} placeholder:text-slate-300 dark:placeholder:text-slate-600 ${field.suffix ? "pr-16" : ""} ${tone}`}
          />
        )}

        {field.type === "select" && (
          <svg className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.2 7.2a.75.75 0 0 1 1.1 0l3.7 3.7 3.7-3.7a.75.75 0 1 1 1.1 1.1l-4.3 4.2a.75.75 0 0 1-1 0L5.2 8.3a.75.75 0 0 1 0-1.1Z" clipRule="evenodd" />
          </svg>
        )}
        {field.suffix && field.type === "number" && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            {field.suffix}
          </span>
        )}
      </div>

      {isUnknown ? (
        <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">ใช้ค่ากลางของข้อมูลเทรนแทน: {fallbackLabel}</p>
      ) : visibleIssue ? (
        <p
          id={`${field.key}-issue`}
          className={`mt-1.5 flex items-start gap-1 text-xs font-medium ${
            visibleIssue.kind === "error" ? "text-rose-600 dark:text-rose-400" : "text-amber-700 dark:text-amber-400"
          }`}
        >
          <Icon name={visibleIssue.kind === "error" ? "alert" : "info"} className="mt-px size-3.5 shrink-0" />
          {visibleIssue.message}
        </p>
      ) : field.hint ? (
        <p id={`${field.key}-hint`} className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}
