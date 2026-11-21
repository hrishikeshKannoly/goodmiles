"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import "../customer-forms-redesign.css";

type Apartment = { id: string; name: string };
type SavedDetails = {
  customer_name: string;
  phone: string;
  apartment_id: string;
  parking_location: string;
  vehicle_number: string;
  vehicle_category: string;
};
export default function BookingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");
  const [today, setToday] = useState("");
  const [saved, setSaved] = useState<SavedDetails | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chosen = params.get("category");
    window.setTimeout(() => {
      setToday(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
      );
      if (["Hatchback", "Sedan", "SUV"].includes(chosen ?? ""))
        setCategory(chosen!);
    }, 0);
    const legacyCallback =
      params.has("code") ||
      new URLSearchParams(window.location.hash.slice(1)).has("access_token");
    const client = supabaseBrowser();
    async function load() {
      const {
        data: { user },
      } = await client.auth.getUser();
      setUser(user);
      if (user && legacyCallback) {
        window.location.replace("/app");
        return;
      }
      if (user) {
        const { data, error } = await client
          .from("apartments")
          .select("id,name")
          .eq("is_active", true)
          .order("name");
        if (error) setMessage("Apartment availability is not ready yet.");
        else setApartments(data ?? []);
        const { data: previous } = await client
          .from("booking_requests")
          .select(
            "customer_name,phone,apartment_id,parking_location,vehicle_number,vehicle_category",
          )
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (previous) setSaved(previous);
        else {
          const { data: profile } = await client.from("customer_profiles").select("customer_name,phone,vehicle_number,vehicle_category").eq("customer_id", user.id).maybeSingle();
          setSaved(profile ? { ...profile, apartment_id: "", parking_location: "" } : null);
        }
      }
      setLoading(false);
    }
    void load();
    const { data: subscription } = client.auth.onAuthStateChange(() => {
      window.setTimeout(() => void load(), 0);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const fields = new FormData(form);
    const { error } = await supabaseBrowser()
      .from("booking_requests")
      .insert({
        customer_id: user.id,
        apartment_id: fields.get("apartment"),
        customer_name: fields.get("name"),
        phone: fields.get("phone"),
        vehicle_number: String(fields.get("vehicle_number") ?? "")
          .trim()
          .toUpperCase(),
        vehicle_category: fields.get("vehicle_category"),
        parking_location: fields.get("parking"),
        preferred_date: fields.get("date"),
      });
    if (error)
      setMessage(
        "Could not save your request. Please check your details and try again.",
      );
    else {
      setSubmitted(true);
      setSaved({
        customer_name: String(fields.get("name") ?? ""),
        phone: String(fields.get("phone") ?? ""),
        apartment_id: String(fields.get("apartment") ?? ""),
        parking_location: String(fields.get("parking") ?? ""),
        vehicle_number: String(fields.get("vehicle_number") ?? "")
          .trim()
          .toUpperCase(),
        vehicle_category: String(fields.get("vehicle_category") ?? ""),
      });
      setMessage(
        "Request received. Your details are saved for your next visit. Your visit is not confirmed until goodmiles contacts you.",
      );
    }
    setBusy(false);
  }
  return (
    <main className="gm-flow gm-flow-booking">
      <header className="gm-flow-header">
        <Link className="logo" href="/">
          goodmiles<span>.</span>
        </Link>
        <Link href="/app">Back to app</Link>
      </header>
      <div className="gm-flow-layout">
        <div className="gm-flow-intro">
          <h1>Care starts here.</h1>
          <p>
            This is a request, not a confirmed appointment. No payment is
            collected.
          </p>
        </div>
        <section className="gm-flow-panel" aria-label="Booking request">
          {loading ? (
            <p>Loading your account…</p>
          ) : !user ? (
            <>
              <h2>Sign in to get started.</h2>
              <a
                className="gm-flow-button"
                href={`/login?next=%2Fbooking${category ? `&category=${encodeURIComponent(category)}` : ""}`}
              >
                Sign in
              </a>
            </>
          ) : (
            <>
              <p className="gm-flow-account">
                Signed in as {saved?.customer_name || user.email}
              </p>
              {submitted ? (
                <>
                  <h2>Request received.</h2>
                  <p role="status">
                    Your visit is not confirmed until goodmiles contacts you.
                  </p>
                  <a className="gm-flow-button" href="/app">
                    Go to your account
                  </a>
                </>
              ) : message &&
                apartments.length === 0 ? null : apartments.length === 0 ? (
                <p>No apartment communities are available yet.</p>
              ) : (
                <form key={saved?.vehicle_number ?? "new"} onSubmit={submit}>
                  <fieldset>
                    <legend>Your details</legend>
                    <div className="gm-flow-fields">
                      <div>
                        <label htmlFor="name">Full name</label>
                        <input
                          id="name"
                          name="name"
                          defaultValue={saved?.customer_name ?? ""}
                          required
                          minLength={2}
                          maxLength={100}
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone">Phone number</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={saved?.phone ?? ""}
                          required
                          minLength={8}
                          maxLength={20}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>Where you park</legend>
                    <div className="gm-flow-fields">
                      <div>
                        <label htmlFor="apartment">Apartment community</label>
                        <select
                          id="apartment"
                          name="apartment"
                          required
                          defaultValue={
                            apartments.some((a) => a.id === saved?.apartment_id)
                              ? saved?.apartment_id
                              : ""
                          }
                        >
                          <option value="" disabled>
                            Select your apartment
                          </option>
                          {apartments.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="parking">Tower and parking bay</label>
                        <input
                          id="parking"
                          name="parking"
                          defaultValue={saved?.parking_location ?? ""}
                          required
                          maxLength={120}
                        />
                      </div>
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>Your vehicle</legend>
                    <div className="gm-flow-fields">
                      <div>
                        <label htmlFor="vehicle_number">
                          Vehicle registration number
                        </label>
                        <input
                          id="vehicle_number"
                          name="vehicle_number"
                          defaultValue={saved?.vehicle_number ?? ""}
                          required
                          minLength={4}
                          maxLength={20}
                        />
                      </div>
                      <div>
                        <label htmlFor="vehicle_category">
                          Vehicle category
                        </label>
                        <select
                          id="vehicle_category"
                          name="vehicle_category"
                          required
                          defaultValue={
                            category || saved?.vehicle_category || ""
                          }
                        >
                          <option value="" disabled>
                            Select a category
                          </option>
                          <option>Hatchback</option>
                          <option>Sedan</option>
                          <option>SUV</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>Preferred date</legend>
                    <div className="gm-flow-fields">
                      <div>
                        <label htmlFor="date">Preferred date</label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          min={today}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>
                  <button className="gm-flow-button" disabled={busy}>
                    {busy ? "Sending…" : "Request a visit"}
                  </button>
                </form>
              )}
              {!submitted && (
                <p className="gm-flow-status" role="status">
                  {message}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
