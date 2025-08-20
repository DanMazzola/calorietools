// app/page.tsx
"use client";
import { useMemo, useState } from "react";

type Sex = "male" | "female";
type ActivityKey = "sedentary" | "light" | "moderate" | "very" | "extra";

const activityMap: Record<ActivityKey, { label: string; mult: number }> = {
  sedentary: { label: "Sedentary (little or no exercise)", mult: 1.2 },
  light: { label: "Light (1–3 days/week)", mult: 1.375 },
  moderate: { label: "Moderate (3–5 days/week)", mult: 1.55 },
  very: { label: "Very (6–7 days/week)", mult: 1.725 },
  extra: { label: "Extra (hard exercise & physical job)", mult: 1.9 },
};

function cmFromFeetInches(ft: number, inch: number) {
  const totalInches = ft * 12 + inch;
  return Math.round(totalInches * 2.54);
}
function kgFromLbs(lbs: number) {
  return Math.round((lbs * 0.45359237 + Number.EPSILON) * 100) / 100;
}
function lbsFromKg(kg: number) {
  return Math.round((kg / 0.45359237 + Number.EPSILON) * 100) / 100;
}
function mifflinStJeor(sex: Sex, kg: number, cm: number, age: number) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}
function round(n: number) {
  return Math.max(0, Math.round(n));
}

export default function Page() {
  // ---- Form state
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number | "">("");
  const [useMetricWeight, setUseMetricWeight] = useState(true);
  const [kg, setKg] = useState<number | "">("");
  const [lbs, setLbs] = useState<number | "">("");

  const [useMetricHeight, setUseMetricHeight] = useState(true);
  const [cm, setCm] = useState<number | "">("");
  const [ft, setFt] = useState<number | "">("");
  const [inch, setInch] = useState<number | "">("");

  const [activity, setActivity] = useState<ActivityKey>("moderate");
  const [goal, setGoal] = useState<"maintain" | "lose" | "gain">("maintain");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ---- Derived units
  const heightCm = useMemo(() => {
    if (useMetricHeight) return typeof cm === "number" ? cm : 0;
    const f = typeof ft === "number" ? ft : 0;
    const i = typeof inch === "number" ? inch : 0;
    return cmFromFeetInches(f, i);
  }, [useMetricHeight, cm, ft, inch]);

  const weightKg = useMemo(() => {
    if (useMetricWeight) return typeof kg === "number" ? kg : 0;
    const l = typeof lbs === "number" ? lbs : 0;
    return kgFromLbs(l);
  }, [useMetricWeight, kg, lbs]);

  // ---- Calculations
  const result = useMemo(() => {
    if (!submitted) return null;
    const errs: string[] = [];
    if (!(typeof age === "number" && age >= 13 && age <= 90)) errs.push("Age must be 13–90.");
    if (!(heightCm > 90 && heightCm < 250)) errs.push("Height must be realistic (90–250 cm).");
    if (!(weightKg > 30 && weightKg < 300)) errs.push("Weight must be realistic (30–300 kg).");
    setErrors(errs);
    if (errs.length) return null;

    const bmr = mifflinStJeor(sex, weightKg, heightCm, age as number);
    const tdee = Math.round(bmr * activityMap[activity].mult);

    const maintain = tdee;
    const lose = round(tdee - 500);   // ≈0.45 kg/week
    const gain = round(tdee + 300);   // slow lean gain

    // Macros for selected goal
    const goalCal = goal === "maintain" ? maintain : goal === "lose" ? lose : gain;
    const proteinG = Math.round(2.0 * weightKg);
    const fatG = Math.round(0.8 * weightKg);
    const proteinCal = proteinG * 4;
    const fatCal = fatG * 9;
    const carbCal = Math.max(0, goalCal - proteinCal - fatCal);
    const carbsG = Math.round(carbCal / 4);

    return { bmr, tdee, maintain, lose, gain, goalCal, proteinG, fatG, carbsG };
  }, [submitted, sex, weightKg, heightCm, age, activity, goal]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  // ---- UI
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Calorie Calculator</h1>
          <p className="mt-2 text-slate-600">
            Find your daily calories for maintenance, weight loss, or muscle gain using the
            Mifflin‑St Jeor equation and your activity level.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl border border-slate-200 p-5 shadow-sm">
          {/* Sex & Age */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Age (years)</label>
              <input
                type="number"
                min={13}
                max={90}
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="e.g., 28"
                required
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Weight</label>
              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => setUseMetricWeight(true)}
                  className={`mr-2 ${useMetricWeight ? "font-semibold" : "text-slate-500"}`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setUseMetricWeight(false)}
                  className={`${!useMetricWeight ? "font-semibold" : "text-slate-500"}`}
                >
                  lb
                </button>
              </div>
            </div>

            {useMetricWeight ? (
              <input
                type="number"
                min={30}
                max={300}
                value={kg}
                onChange={(e) => setKg(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="e.g., 80"
                required
              />
            ) : (
              <input
                type="number"
                min={66}
                max={661}
                value={lbs}
                onChange={(e) => setLbs(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="e.g., 176"
                required
              />
            )}
          </div>

          {/* Height */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Height</label>
              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => setUseMetricHeight(true)}
                  className={`mr-2 ${useMetricHeight ? "font-semibold" : "text-slate-500"}`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setUseMetricHeight(false)}
                  className={`${!useMetricHeight ? "font-semibold" : "text-slate-500"}`}
                >
                  ft/in
                </button>
              </div>
            </div>

            {useMetricHeight ? (
              <input
                type="number"
                min={90}
                max={250}
                value={cm}
                onChange={(e) => setCm(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="e.g., 180"
                required
              />
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={3}
                  max={8}
                  value={ft}
                  onChange={(e) => setFt(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="ft"
                  required
                />
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={inch}
                  onChange={(e) => setInch(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="in"
                  required
                />
              </div>
            )}
          </div>

          {/* Activity */}
          <div>
            <label className="block text-sm font-medium">Activity level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityKey)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              {Object.entries(activityMap).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as typeof goal)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="maintain">Maintain</option>
              <option value="lose">Lose weight</option>
              <option value="gain">Gain muscle</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false)
                setErrors([])
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              Calculate
            </button>
          </div>

          {/* Errors */}
          {submitted && errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <ul className="list-disc pl-5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Results */}
          {submitted && result && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Results</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">BMR</div>
                  <div className="text-2xl font-semibold">{result.bmr.toLocaleString()} kcal/day</div>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">TDEE</div>
                  <div className="text-2xl font-semibold">{result.tdee.toLocaleString()} kcal/day</div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Maintain</div>
                  <div className="text-lg font-semibold">{result.maintain.toLocaleString()} kcal</div>
                </div>
                <div className="rounded-md border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Lose</div>
                  <div className="text-lg font-semibold">{result.lose.toLocaleString()} kcal</div>
                </div>
                <div className="rounded-md border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Gain</div>
                  <div className="text-lg font-semibold">{result.gain.toLocaleString()} kcal</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-700">Macros for selected goal</h3>
                <p className="mt-1 text-slate-600">
                  Goal calories: <span className="font-semibold">{result.goalCal.toLocaleString()} kcal</span>
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-3 text-center">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Protein</div>
                    <div className="text-lg font-semibold">{result.proteinG} g</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 text-center">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Fat</div>
                    <div className="text-lg font-semibold">{result.fatG} g</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 text-center">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Carbs</div>
                    <div className="text-lg font-semibold">{result.carbsG} g</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
               
