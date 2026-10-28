---
name: safe-ui-change
description: Use for ANY change to the frontend UI/UX (styling, layout, loading/error/empty states, validation, splitting components) in this repo. Enforces the locked /predict contract and verifies nothing in the frontend -> FastAPI -> model flow broke.
---

# Safe UI change

Goal: make the UI better for non-technical Thai-speaking managers/HR without changing what is sent to or received from `POST /predict`.

## 1. Before editing

1. Read the target section of `src/frontend/src/App.tsx` (and `services/predictService.ts` if relevant). Never edit from memory.
2. Run the baseline: `python scripts/check_contract.py` must print `OK`. If it already fails, stop and tell the user.
3. Classify the change:
   - **Safe zone** (go ahead): JSX markup, Tailwind classes, `index.css`, labels/hints/text, new presentational components in `src/components/`, icons, animations.
   - **Caution zone** (describe the plan to the user first, then edit): `handleSubmit`, `updateValue`, `resetForm`, state declarations, `sections` array (`key` / `value` / `type`), anything in `predictService.ts`.
   - **Forbidden unless the user explicitly asks**: `src/backend/**`, model artifacts, `vite.config.ts` proxy/port, `.env*`, renaming/removing payload keys, changing select option `value`s, changing `parseInt(...) || 0` conversion or the fetch URL.

## 2. While editing

- Small, surgical `Edit`s. No full-file rewrites of `App.tsx`.
- Keep `sendPrediction(values)` as the only network call; keep `setLoading` / `setApiError` / `setPredictionResult` flow intact (try / catch / finally).
- `prediction` is `0 | 1`. Do not invent a confidence/probability in the UI — the API does not return one.
- Extracting a component: pass state and callbacks as props; state stays in `App.tsx`. Default exports.
- Every new UI string in Thai. Support dark mode (`dark:` variants) and keyboard focus for anything new.
- Long waits are normal (Render cold start). Loading UI should say so and the submit button must stay disabled while `loading`.
- Validation may block submit and show messages, but must not alter values that get sent.

## 3. Verify (all required)

```
python scripts/check_contract.py
cd src/frontend && pnpm build
```
Both must pass. If `pnpm build` fails, fix it before reporting.

Optional live check (the user's backend must be running or Render reachable):
```
curl -s -X POST https://linus-torvalds-ethicinai-thu.onrender.com/predict -H "Content-Type: application/json" -d '{"Age":41,"DailyRate":1102,"DistanceFromHome":1,"Education":2,"EnvironmentSatisfaction":2,"HourlyRate":94,"JobInvolvement":3,"JobLevel":2,"JobSatisfaction":4,"MonthlyIncome":5993,"MonthlyRate":19479,"NumCompaniesWorked":8,"OverTime":"Yes","PerformanceRating":3,"RelationshipSatisfaction":1,"StockOptionLevel":0,"TrainingTimesLastYear":0,"WorkLifeBalance":1,"YearsAtCompany":6,"YearsSinceLastPromotion":0,"YearsWithCurrManager":5,"PercentSalaryHike":11,"TotalWorkingYears":8,"YearsInCurrentRole":4}'
```
Expect `{"prediction":0}` or `{"prediction":1}`.

## 4. Report to the user (in Thai)

- What changed visually (bullets).
- Files touched.
- Explicit confirmation: contract check OK, build OK, `sendPrediction` / payload / response handling unchanged — or exactly what changed and why.
