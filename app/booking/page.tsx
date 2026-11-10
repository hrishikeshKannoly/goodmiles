"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

type Apartment = { id: string; name: string };
type SavedDetails = { customer_name: string; phone: string; apartment_id: string; parking_location: string; vehicle_number: string; vehicle_category: string };
export default function BookingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [today, setToday] = useState("");
  const [saved, setSaved] = useState<SavedDetails | null>(null);
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Kolkata", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date()));
    const client = supabaseBrowser();
    async function load() {
      const { data: { user } } = await client.auth.getUser(); setUser(user);
      if (user) {
        const { data, error } = await client.from("apartments").select("id,name").eq("is_active", true).order("name");
        if (error) setMessage("Apartment availability is not ready yet."); else setApartments(data ?? []);
        const { data: previous } = await client.from("booking_requests").select("customer_name,phone,apartment_id,parking_location,vehicle_number,vehicle_category").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        setSaved(previous ?? null);
      }
      setLoading(false);
    }
    void load();
    const { data: subscription } = client.auth.onAuthStateChange(() => { void load(); });
    return () => subscription.subscription.unsubscribe();
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user || busy) return; setBusy(true); setMessage("");
    const form = event.currentTarget; const fields = new FormData(form);
    const { error } = await supabaseBrowser().from("booking_requests").insert({ customer_id: user.id, apartment_id: fields.get("apartment"), customer_name: fields.get("name"), phone: fields.get("phone"), vehicle_number: String(fields.get("vehicle_number") ?? "").trim().toUpperCase(), vehicle_category: fields.get("vehicle_category"), parking_location: fields.get("parking"), preferred_date: fields.get("date") });
    if (error) setMessage("Could not save your request. Please check your details and try again.");
    else { setSaved({customer_name: String(fields.get("name") ?? ""), phone: String(fields.get("phone") ?? ""), apartment_id: String(fields.get("apartment") ?? ""), parking_location: String(fields.get("parking") ?? ""), vehicle_number: String(fields.get("vehicle_number") ?? "").trim().toUpperCase(), vehicle_category: String(fields.get("vehicle_category") ?? "")}); setMessage("Request received. Your details are saved for your next visit. Your visit is not confirmed until goodmiles contacts you."); }
    setBusy(false);
  }
  return <main className="auth-page"><a className="logo" href="/">goodmiles<span>.</span></a><section className="auth-card"><p className="eyebrow light">BOOKING REQUEST</p><h1>Care starts here.</h1>{loading ? <p>Loading your account…</p> : !user ? <><p>Sign in to get started.</p><a className="button primary" href="/login">Sign in</a></> : <><p>Signed in as {saved?.customer_name || user.email}</p>{apartments.length === 0 ? <p>No apartment communities are available yet.</p> : <form key={saved?.vehicle_number ?? "new"} onSubmit={submit}><label htmlFor="name">Full name</label><input id="name" name="name" defaultValue={saved?.customer_name ?? ""} required minLength={2} maxLength={100} autoComplete="name"/><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" defaultValue={saved?.phone ?? ""} required minLength={8} maxLength={20} autoComplete="tel"/><label htmlFor="apartment">Apartment community</label><select id="apartment" name="apartment" required defaultValue={apartments.some(a => a.id === saved?.apartment_id) ? saved?.apartment_id : ""}><option value="" disabled>Select your apartment</option>{apartments.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><label htmlFor="parking">Tower and parking bay</label><input id="parking" name="parking" defaultValue={saved?.parking_location ?? ""} required maxLength={120}/><label htmlFor="vehicle_number">Vehicle registration number</label><input id="vehicle_number" name="vehicle_number" defaultValue={saved?.vehicle_number ?? ""} required minLength={4} maxLength={20}/><label htmlFor="vehicle_category">Vehicle category</label><select id="vehicle_category" name="vehicle_category" required defaultValue={saved?.vehicle_category ?? ""}><option value="" disabled>Select a category</option><option>Hatchback</option><option>Sedan</option><option>SUV</option></select><label htmlFor="date">Preferred date</label><input id="date" name="date" type="date" min={today} required/><p>This is a request, not a confirmed appointment. No payment is collected.</p><button className="button primary" disabled={busy}>{busy ? "Sending…" : "Request a visit"}</button></form>}<p role="status">{message}</p></>}<p><a href="/app">← Back to app</a></p></section></main>;
}

