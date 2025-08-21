"use client";
import { useEffect, useMemo, useState } from "react";

type Units = "metric" | "imperial";

const toKg = (lbs: number) => lbs * 0.45359237;
const metersFromMetric = (cm: number) => cm / 100;
const metersFromImperial = (ft: number, inch: number) => (ft * 12 + inch) * 0.0254;

function bmiCategory(bmi: number) {
  if (!isFinite(bmi) || bmi <= 0) return "";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export default function BMIPage() {
  const [units, setUnits] = useState<Units>("metric");

  // metric
  const [kg, setKg] = useState<number | "">("");
  const [cm, setCm] = useState<number | "">("");

  // imperial
  const [lbs, setLbs] = useState<number | "">("");
  const [ft, setFt] = useState<number | "">("");
  const [inch, setInch] = useState<number | "">("");

  // remember last inputs (optional nicety)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bmi:last") || "{}");
      if (saved.units) setUnits(saved.units);
      if (saved.kg !== undefined) setKg(saved.kg);
      if (saved.cm !== undefined) setCm(saved.cm);
      if (saved.lbs !== undefined) setLbs(saved.lbs);
      if (saved.ft !== undefined) setFt(saved.ft);
      if (saved.inch !== undefined) setInch(saved.inch);
    } catch {}
  }, []);
  useEffect(() => {
    const payload = { units, kg, cm, lbs, ft, inch };
    localStorage.setItem("bmi:last", JSON.stringify(payload));
  }, [units, kg, cm, lbs, ft, inch]);

  const bmi = useMemo(() => {
    let wKg = 0;
    let m = 0;
    if (units === "metric") {
      wKg = typeof kg === "number" ? kg : 0;
      m = typeof cm === "number" ? metersFromMetric(cm) : 0;
    } else {
      wKg = typeof lbs === "number" ? toKg(lbs) : 0;
      const f = typeof ft === "number" ? ft : 0;
      const i = typeof inch === "number" ? inch : 0;
      m = metersFromImperial(f, i);
    }
    if (wKg <= 0 || m <= 0) return 0;
    return wKg / (m * m);
  }, [units, kg, cm, lbs, ft, inch]);

  const category = bmiCategory(bmi);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">BMI Calculator</h1>
          <p className="mt-2 text-slate-600">
            Calculate your Body Mass Index using metric or imperial units.
          </p>
        </header>

        {/* Unit toggle */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <button
            type="button"
            className={`rounded-md border px-3 py-1 text-sm ${
              units === "metric" ? "border-slate-900 font-semibold" : "border-slate-300 text-slate-500"
            }`}
            onClick={() => setUnits("metric")}
          >
            Metric
          </button>
          <button
            type="button"
            className={`rounded-md border px-3 py-1 text-sm ${
              units === "imperial" ? "border-slate-900 font-semibold" : "border-slate-300 text-slate-500"
            }`}
            onClick={() => setUnits("imperial")}
          >
            Imperial
          </button>
        </div>

        {/* Inputs */}
        <section className="grid gap-6 rounded-2xl border border-slate-200 p-5 shadow-sm">
          {units === "metric" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={kg}
                  onChange={(e) => setKg(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 80"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={cm}
                  onChange={(e) => setCm(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 179"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium">Weight (lb)</label>
                <input
                  type="number"
                  min={66}
                  max={661}
                  value={lbs}
                  onChange={(e) => setLbs(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 176"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Height (ft)</label>
                <input
                  type="number"
                  min={3}
                  max={8}
                  value={ft}
                  onChange={(e) => setFt(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 5"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Height (in)</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={inch}
                  onChange={(e) => setInch(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 11"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Your BMI</div>
            <div className="mt-1 text-3xl font-bold">
              {bmi > 0 ? bmi.toFixed(1) : "--"}
            </div>
            <div className="mt-1 text-slate-600">{category}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
