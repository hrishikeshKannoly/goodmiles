"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import "../customer-forms-redesign.css";

function VehicleFields() {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [catalogError, setCatalogError] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/vehicles", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Catalogue unavailable"); return response.json(); })
      .then((data: { makes: string[] }) => setMakes(data.makes))
      .catch(() => { if (!controller.signal.aborted) setCatalogError(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!make || make === "other") return;
    const controller = new AbortController();
    fetch(`/api/vehicles?make=${encodeURIComponent(make)}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Catalogue unavailable"); return response.json(); })
      .then((data: { models: string[] }) => { setModels(data.models); setLoadingModels(false); })
      .catch(() => { if (!controller.signal.aborted) { setCatalogError(true); setLoadingModels(false); } });
    return () => controller.abort();
  }, [make]);

  return <>
    <div>
      <label htmlFor="make-choice">Car make</label>
      <select id="make-choice" name={make === "other" ? undefined : "make"} required value={make} onChange={(event) => { const value = event.target.value; setMake(value); setModel(""); setModels([]); setLoadingModels(Boolean(value && value !== "other")); }}>
        <option value="" disabled>Select a make</option>
        {makes.map((name) => <option key={name} value={name}>{name}</option>)}
        <option value="other">Other / enter manually</option>
      </select>
      {make === "other" && <><label htmlFor="make-manual">Enter car make</label><input id="make-manual" name="make" required maxLength={80} /></>}
    </div>
    <div>
      <label htmlFor="model-choice">Car model</label>
      {make === "other" || catalogError ? <input id="model-choice" name="model" required maxLength={80} placeholder="Enter car model" /> : <>
        <select id="model-choice" name={model === "other" ? undefined : "model"} required value={model} disabled={!make || loadingModels} onChange={(event) => setModel(event.target.value)}>
          <option value="" disabled>{loadingModels ? "Loading models…" : "Select a model"}</option>
          {models.map((name) => <option key={name} value={name}>{name}</option>)}
          <option value="other">Other / enter manually</option>
        </select>
        {model === "other" && <><label htmlFor="model-manual">Enter car model</label><input id="model-manual" name="model" required maxLength={80} /></>}
      </>}
    </div>
    {catalogError && <p role="status">The car list is unavailable. Select “Other” to enter your make and model manually.</p>}
  </>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    void supabaseBrowser().auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      if (!user) { router.replace("/login?next=%2Fonboarding"); return; }
      setUserId(user.id);
      setLoading(false);
    });
    return () => { active = false; };
  }, [router]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || busy) return;
    setBusy(true);
    setMessage("");
    const fields = new FormData(event.currentTarget);
    try {
      const { error } = await supabaseBrowser().from("customer_profiles").upsert({
        customer_id: userId,
        customer_name: String(fields.get("name") ?? "").trim(),
        phone: String(fields.get("phone") ?? "").trim(),
        vehicle_number: String(fields.get("vehicle_number") ?? "").trim().toUpperCase(),
        vehicle_category: fields.get("vehicle_category"),
        vehicle_make: String(fields.get("make") ?? "").trim(),
        vehicle_model: String(fields.get("model") ?? "").trim(),
      }, { onConflict: "customer_id" });
      if (error) setMessage("Could not save your details. Please try again.");
      else {
        const { error: updateError } = await supabaseBrowser().auth.updateUser({ data: { onboarding_pending: false } });
        if (updateError) setMessage("Your details were saved, but setup could not be completed. Please try again.");
        else {
          const params = new URLSearchParams(window.location.search);
          const category = params.get("category");
          router.replace(params.get("next") === "booking"
            ? `/booking${["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `?category=${encodeURIComponent(category!)}` : ""}`
            : "/app");
        }
      }
    } catch { setMessage("Could not save your details. Please check your connection and try again."); }
    setBusy(false);
  }
  return <main className="gm-flow"><header className="gm-flow-header"><Link className="logo" href="/">goodmiles<span>.</span></Link></header><div className="gm-flow-layout"><div className="gm-flow-intro"><h1>Let’s get to know you.</h1><p>Add your details to make booking your first visit easier.</p></div><section className="gm-flow-panel" aria-label="Your details">{loading ? <p>Loading your account…</p> : <form onSubmit={save}><fieldset><legend>Your details</legend><div className="gm-flow-fields"><div><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100}/></div><div><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={8} maxLength={20}/></div></div></fieldset><fieldset><legend>Your car</legend><div className="gm-flow-fields"><VehicleFields /><div><label htmlFor="vehicle_number">Registration number</label><input id="vehicle_number" name="vehicle_number" required minLength={4} maxLength={20}/></div><div><label htmlFor="vehicle_category">Vehicle category</label><select id="vehicle_category" name="vehicle_category" defaultValue="" required><option value="" disabled>Select a category</option><option>Hatchback</option><option>Sedan</option><option>SUV</option></select></div></div></fieldset><button className="gm-flow-button" disabled={busy}>{busy ? "Saving…" : "Save and continue"}</button></form>}<p className="gm-flow-status" role="status">{message}</p></section></div></main>;
}
