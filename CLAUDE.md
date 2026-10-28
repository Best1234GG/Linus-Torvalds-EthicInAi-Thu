# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

ตอบผู้ใช้เป็นภาษาไทย โค้ด/ชื่อตัวแปร/commit เป็นภาษาอังกฤษ

## 1. System Architecture & Data Flow (CRITICAL - DO NOT BREAK)

ระบบจริงมี 2 ชั้น (ไม่มี backend คั่นกลาง) — frontend ยิงตรงไปที่ FastAPI:

```
[React Frontend (src/frontend)] --POST /predict--> [FastAPI (src/backend/app.py)] --> predict_model() --> Keras model
```

- `src/frontend/src/formConfig.ts` — นิยาม 24 ฟิลด์ (`sections`), ช่วงค่าข้อมูลเทรน + ค่ากลางสำหรับปุ่ม "ไม่ทราบ", `validate()`
- `src/frontend/src/App.tsx` — state (`values`, `unknown`, `loading`, `apiError`, `predictionResult`), `handleSubmit` (timeout 90 วิ, กัน race), health check; UI ย่อยอยู่ใน `src/components/`
- `src/frontend/src/services/predictService.ts` — `checkApiHealth()` (GET /predict → 405 = ออนไลน์) และ `sendPrediction()` แปลงค่าฟอร์มเป็น `PredIPPayload` แล้ว `fetch(`${VITE_API_URL}/predict`)` จุดเดียวที่คุยกับ API
- `src/backend/app.py` — FastAPI, pydantic `Pred_IP`, CORS เปิดหมด
- `src/backend/models/predictss.py` — โหลด `model.h5`, `scaler.pkl`, `model_columns.pkl` ตอน import → scale → one-hot (`drop_first=True`) → reindex ตาม `model_columns` (คอลัมน์ที่ไม่มีเติม 0) → reshape `(1, 1, n)` → threshold 0.5
- `src/backend/models/main.ipynb` — notebook เทรน สร้าง 3 ไฟล์ artifact ข้างบน (ต้องตรงกันเสมอ)
- Production API: `https://linus-torvalds-ethicinai-thu.onrender.com` (Render free tier — cold start อาจนาน ~30-60 วินาที)

## 2. Locked API Contract (ห้ามเปลี่ยน)

`POST /predict`, `Content-Type: application/json`

Request — 24 keys, ชื่อต้องตรงกันทั้ง `Pred_IP` (app.py), `PredIPPayload` (predictService.ts) และ `sections[].fields[].key` (formConfig.ts):

| Type | Keys |
|---|---|
| int | Age, DailyRate, DistanceFromHome, Education, EnvironmentSatisfaction, HourlyRate, JobInvolvement, JobLevel, JobSatisfaction, MonthlyIncome, MonthlyRate, NumCompaniesWorked, PerformanceRating, RelationshipSatisfaction, StockOptionLevel, TrainingTimesLastYear, WorkLifeBalance, YearsAtCompany, YearsSinceLastPromotion, YearsWithCurrManager, PercentSalaryHike, TotalWorkingYears, YearsInCurrentRole |
| str | OverTime (`"Yes"` / `"No"`) |

Response: `{ "prediction": 0 | 1 }` (1 = เสี่ยงลาออก) — ไม่มี `status` / `confidence`
Error 422: `{ "detail": [{ "loc": [...], "msg": "..." }] }` — `predictService.ts` แปลงเป็นข้อความไทยแล้ว

ตรวจ contract ได้ด้วย: `python scripts/check_contract.py` (ต้องผ่านทุกครั้งหลังแก้ไฟล์ใน flow)

## 3. Strict Guardrails

- **DO NOT MODIFY API CONTRACT:** ห้ามเปลี่ยน/ลบ key ข้างบน จะเพิ่มต้องได้รับคำสั่งและแก้ทั้ง 3 ไฟล์พร้อมกัน
- **DO NOT ALTER MODEL LOGIC:** ห้ามแก้ `predictss.py`, ไฟล์ `.h5`/`.pkl`, `main.ipynb` เว้นแต่ได้รับคำสั่งตรง
- **DO NOT CHANGE PORTS/ENV/PROXY/CORS:** port 8000 (backend), `$PORT`/8443 (frontend, strictPort), proxy `/predict` ใน `vite.config.ts`, `VITE_API_URL`, CORS ใน `app.py`
- **คงไว้เสมอใน `sendPrediction`:** การแปลง `parseInt(...) || 0`, URL `${API_BASE_URL}/predict`, header, การ throw error
- **ค่า `value` ของ select ห้ามเปลี่ยน** (ต้องตรงกับสเกลในข้อมูลเทรน — StockOptionLevel เริ่มที่ 0, อื่นๆ เริ่มที่ 1; เงินเป็น USD) (เช่น `"1"`–`"4"`, `"Yes"`/`"No"`) — มันคือค่าที่โมเดลเห็น เปลี่ยนได้แค่ `label`
- **NO MASS REFACTORING:** แก้เฉพาะจุด ไม่ย้ายโครงสร้างโฟลเดอร์ ไม่ rewrite ไฟล์ทั้งไฟล์

## 4. Role: Senior Frontend & UX/UI Engineer

ผู้ใช้ปลายทาง: หัวหน้างาน/HR ที่ไม่ใช่สายเทคนิค ใช้ภาษาไทย ทำได้และควรทำ:
- Visual polish: layout, spacing, typography (Noto Sans Thai), สี, dark mode (`.dark` class + `@custom-variant dark` ใน `index.css`)
- Loading state ระหว่างรอ API (คำนึงถึง cold start ของ Render), error UI ที่เป็นมิตร, empty state
- Validation ฝั่ง UI (min/max, ช่วงค่า) ที่ไม่เปลี่ยน payload
- แยก component ไป `src/components/` ได้ โดย state และ `handleSubmit` ยังอยู่ที่ `App.tsx`
- Accessibility: label, `aria-invalid`, focus ring, keyboard

## 5. Standard Operating Procedure

ทุกครั้งที่จะแก้โค้ด ใช้ skill `/safe-ui-change` หรือทำตามนี้:
1. **Analyze Impact** — ไฟล์ที่จะแก้อยู่ใน flow ข้อ 1 หรือไม่
2. **Plan Before Code** — สรุปแผนสั้นๆ ให้ผู้ใช้ก่อน ถ้าแตะ `App.tsx` ส่วน state/submit หรือ `predictService.ts`
3. **Preserve State & Handlers** — ห้ามลบ state, `fetch`, event handler เดิม ย้ายตำแหน่ง/ครอบ styling ได้
4. **Verify** — `python scripts/check_contract.py` + `cd src/frontend && pnpm build` ต้องผ่าน แล้วสรุปว่า UI ส่วนไหนเปลี่ยน และยืนยันว่า payload/response ไม่เปลี่ยน

## 6. Commands

```
# Backend (repo root มี .venv; requirements.txt เป็น UTF-16)
pip install -r requirements.txt
cd src/backend && uvicorn app:app --reload --port 8000
# หรือจาก root: python main.py (เพิ่ม src/backend เข้า sys.path ให้แล้ว)

# Frontend (VITE_API_URL สำหรับ build อยู่ที่ src/frontend/.env.production — Vite อ่าน env จาก src/frontend ไม่ใช่ root)
cd src/frontend && pnpm install
pnpm dev      # dev server, proxy /predict -> Render
pnpm build    # ใช้เป็น type/build check (ไม่มี test/lint)
pnpm format   # oxfmt
```

Frontend conventions (จาก `src/frontend/AGENTS.md`): default export component, Tailwind v4 ไม่มี config file, ระวัง apostrophe ใน single-quoted string
