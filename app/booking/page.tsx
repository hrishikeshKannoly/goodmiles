"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

type Apartment = { id: string; name: string };
export default function BookingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Kolkata", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date()));
    const client = supabaseBrowser();
    async function load() {
      const { data: { user } } = await client.auth.getUser(); setUser(user);
      if (user) {
        const { data, error } = await client.from("apartments").select("id,name").eq("is_active", true).order("name");
        if (error) setMessage("Apartment availability is not ready yet."); else setApartments(data ?? []);
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
    else { form.reset(); setMessage("Request received. Your visit is not confirmed until goodmiles contacts you."); }
    setBusy(false);
  }
  return <main className="auth-page"><a className="logo" href="/">goodmiles<span>.</span></a><section className="auth-card"><p className="eyebrow light">BOOKING REQUEST</p><h1>Care starts here.</h1>{loading ? <p>Loading your account…</p> : !user ? <><p>Sign in to get started.</p><a className="button primary" href="/login">Sign in</a></> : <><p>Signed in as {user.email}</p>{apartments.length === 0 ? <p>No apartment communities are available yet.</p> : <form onSubmit={submit}><label htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name"/><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" required minLength={8} maxLength={20} autoComplete="tel"/><label htmlFor="apartment">Apartment community</label><select id="apartment" name="apartment" required defaultValue=""><option value="" disabled>Select your apartment</option>{apartments.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><label htmlFor="parking">Tower and parking bay</label><input id="parking" name="parking" required maxLength={120}/><label htmlFor="vehicle_number">Vehicle registration number</label><input id="vehicle_number" name="vehicle_number" required minLength={4} maxLength={20}/><label htmlFor="vehicle_category">Vehicle category</label><select id="vehicle_category" name="vehicle_category" required defaultValue=""><option value="" disabled>Select a category</option><option>Hatchback</option><option>Sedan</option><option>SUV</option></select><label htmlFor="date">Preferred date</label><input id="date" name="date" type="date" min={today} required/><p>This is a request, not a confirmed appointment. No payment is collected.</p><button className="button primary" disabled={busy}>{busy ? "Sending…" : "Request a visit"}</button></form>}<p role="status">{message}</p></>}<p><a href="/">← Back to home</a></p></section></main>;
}

