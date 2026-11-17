"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Temporary examples only; replace with approved rates before taking orders.
const sampleRates = {
  small_hatchback: { label: "Small hatchback", exterior: 200, interior: 150 },
  large_hatch_compact_sedan: { label: "Large hatchback / compact sedan", exterior: 225, interior: 175 },
  sedan: { label: "Sedan", exterior: 250, interior: 200 },
  compact_suv: { label: "Compact SUV / crossover", exterior: 275, interior: 225 },
  large_suv_mpv: { label: "Large SUV / MPV", exterior: 300, interior: 250 },
} as const;
type Category = keyof typeof sampleRates;

export function CustomPlan() {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryMessage, setCategoryMessage] = useState("Choose a car to see its category.");
  const [exterior, setExterior] = useState(0);
  const [interior, setInterior] = useState(0);
  const rates = category ? sampleRates[category] : null;
  const total = rates ? exterior * rates.exterior + interior * rates.interior : null;
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/vehicles?make=${encodeURIComponent(make)}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Catalogue unavailable"); return response.json(); })
      .then((data: { makes: string[]; models: string[] }) => { setMakes(data.makes); setModels(data.models); })
      .catch(() => {});
    return () => controller.abort();
  }, [make]);
  useEffect(() => {
    if (!make.trim() || !model.trim()) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const { data, error } = await supabaseBrowser().from("vehicle_models").select("category_id").eq("make", make.trim().toUpperCase()).eq("model", model.trim().toUpperCase()).maybeSingle();
        if (!active) return;
        const id = data?.category_id;
        if (!error && typeof id === "string" && Object.hasOwn(sampleRates, id)) {
          setCategory(id as Category);
          setCategoryMessage(`Category: ${sampleRates[id as Category].label}`);
        } else {
          setCategory(null);
          setCategoryMessage(error ? "Category information is unavailable. Price will be confirmed by goodmiles." : "This car needs category review. Price will be confirmed by goodmiles.");
        }
      } catch {
        if (active) { setCategory(null); setCategoryMessage("Category information is unavailable. Price will be confirmed by goodmiles."); }
      }
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [make, model]);
  return (
    <section className="custom-plan" aria-labelledby="custom-plan-title">
      <h2 id="custom-plan-title">Build a custom plan</h2>
      <p>Choose your vehicle and how many washes you need. Rates shown are examples for testing and will change.</p>
      <div className="custom-plan-fields">
        <label>Car make<input type="text" maxLength={80} placeholder="e.g. Tata" list="vehicle-makes" value={make} onChange={(event) => { setMake(event.target.value); setModel(""); setCategory(null); setCategoryMessage("Choose a car to see its category."); setModels([]); }} /><datalist id="vehicle-makes">{makes.map((name) => <option key={name} value={name} />)}</datalist></label>
        <label>Car model<input type="text" maxLength={80} placeholder="e.g. Nexon" list="vehicle-models" value={model} onChange={(event) => { setModel(event.target.value); setCategory(null); setCategoryMessage("Checking category…"); }} /><datalist id="vehicle-models">{models.map((name) => <option key={name} value={name} />)}</datalist></label>
        <label>Exterior washes<input type="number" min="0" max="100" step="1" value={exterior} onChange={(event) => setExterior(Math.floor(Math.min(100, Math.max(0, Number(event.target.value) || 0))))} /></label>
        <label>Interior washes<input type="number" min="0" max="100" step="1" value={interior} onChange={(event) => setInterior(Math.floor(Math.min(100, Math.max(0, Number(event.target.value) || 0))))} /></label>
      </div>
      <p role="status">{categoryMessage}</p>
      <p>Start typing to see suggestions. If your car isn’t listed, enter its make and model yourself.</p>
      <div className="custom-plan-total" aria-live="polite"><span>Sample estimate · not a final price</span>{rates && total !== null ? <><strong>₹{total.toLocaleString("en-IN")}</strong><small>Exterior ₹{rates.exterior} × {exterior} + interior ₹{rates.interior} × {interior}</small></> : <strong>Price to be confirmed</strong>}</div>
      <p>This is a preview only. It does not save a vehicle, create a plan or collect payment.</p>
    </section>
  );
}
