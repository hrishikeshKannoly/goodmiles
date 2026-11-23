"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import "./customer-redesign.css";
import "./plans-redesign.css";
import { CustomPlan } from "./custom-plan";

type Visit = {
  id: string;
  customer_name: string;
  vehicle_number: string;
  vehicle_category: string;
  preferred_date: string;
  status: string;
  created_at: string;
};
type Tab = "home" | "visits" | "plans" | "account";
const labels: Record<string, string> = {
  requested: "Awaiting confirmation",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
function formatDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
type IconName = "home" | "visits" | "plans" | "account" | "car" | "arrow";
function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="app-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === "home" && (
        <>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />
        </>
      )}
      {name === "visits" && (
        <>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h3M8 17h6" />
        </>
      )}
      {name === "plans" && (
        <>
          <path d="M12 3.5 4 7.8v8.4l8 4.3 8-4.3V7.8L12 3.5Z" />
          <path d="m4.4 8 7.6 4.2L19.6 8M12 12.2v8" />
        </>
      )}
      {name === "account" && (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 20v-1.3a6.5 6.5 0 0 1 13 0V20" />
        </>
      )}
      {name === "car" && (
        <>
          <path d="m5 14 1.2-4.3a3 3 0 0 1 2.9-2.2h5.8a3 3 0 0 1 2.9 2.2L19 14" />
          <path d="M4 14h16v4H4zM6.5 18v1.5M17.5 18v1.5M7 14h.1M17 14h.1" />
        </>
      )}
      {name === "arrow" && (
        <>
          <path d="M5 12h14M14 7l5 5-5 5" />
        </>
      )}
    </svg>
  );
}
const plans = [
  { name: "Hatchback", price: "2,499" },
  { name: "Sedan", price: "2,799" },
  { name: "SUV", price: "3,199" },
];
export default function CustomerHome() {
  const [state, setState] = useState<
    "loading" | "signedout" | "ready" | "error"
  >("loading");
  const [today, setToday] = useState("");
  const [email, setEmail] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [profile, setProfile] = useState<{ customer_name: string; vehicle_category: string; vehicle_number: string } | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  useEffect(() => {
    let live = true;
    const c = supabaseBrowser();
    async function load() {
      const {
        data: { user },
        error,
      } = await c.auth.getUser();
      if (!live) return;
      if (error || !user) {
        setState("signedout");
        return;
      }
      setEmail(user.email ?? "");
      const { data: profileData } = await c.from("customer_profiles")
        .select("customer_name,vehicle_category,vehicle_number")
        .eq("customer_id", user.id).maybeSingle();
      if (!live) return;
      setProfile(profileData);
      const { data, error: err } = await c
        .from("booking_requests")
        .select(
          "id,customer_name,vehicle_number,vehicle_category,preferred_date,status,created_at",
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (!live) return;
      if (err) {
        setState("error");
        return;
      }
      setToday(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
      );
      setVisits(data ?? []);
      setState("ready");
    }
    void load();
    const { data: sub } = c.auth.onAuthStateChange(() => {
      window.setTimeout(() => void load(), 0);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  async function signOut() {
    const { error } = await supabaseBrowser().auth.signOut();
    if (!error) {
      setVisits([]);
      setProfile(null);
      setEmail("");
      setState("signedout");
    }
  }
  const latest = visits[0];
  const firstName = (latest?.customer_name || profile?.customer_name)?.trim().split(/\s+/)[0];
  const vehicle = latest || profile;
  const next = visits
    .filter(
      (v) =>
        ["requested", "confirmed", "in_progress"].includes(v.status) &&
        v.preferred_date >= today,
    )
    .sort((a, b) => a.preferred_date.localeCompare(b.preferred_date))[0];
  const nav: { id: Tab; icon: IconName; label: string }[] = [
    { id: "home", icon: "home", label: "Home" },
    { id: "visits", icon: "visits", label: "Visits" },
    { id: "plans", icon: "plans", label: "Plans" },
    { id: "account", icon: "account", label: "Account" },
  ];
  return (
    <main className="customer-app">
      <div
        className={`customer-shell${state === "ready" ? " has-navigation" : ""}`}
      >
        <header className="customer-header">
          <Link href="/" className="logo">
            goodmiles<span>.</span>
          </Link>
          <span className="customer-header-label">Your car care</span>
          {state === "ready" && (
            <a className="header-booking" href="/booking">
              Request a visit{" "}
              <span className="action-arrow">
                <Icon name="arrow" />
              </span>
            </a>
          )}
        </header>
        {state === "loading" && (
          <section className="customer-content">
            <p>Loading your account…</p>
          </section>
        )}
        {state === "error" && (
          <section className="customer-content">
            <h1>Unable to load your account.</h1>
            <p>Please check your connection and try again.</p>
            <button onClick={() => window.location.reload()}>Try again</button>
          </section>
        )}
        {state === "signedout" && (
          <section className="customer-content customer-welcome">
            <h1>
              Care for your car.
              <br />
              Time for everything else.
            </h1>
            <p>Sign in to manage your car care.</p>
            <a className="customer-button" href="/login">
              Sign in to continue{" "}
              <span className="action-arrow">
                <Icon name="arrow" />
              </span>
            </a>
            <Link href="/">Explore goodmiles</Link>
          </section>
        )}
        {state === "ready" && (
          <>
            <section key={tab} className="customer-content dashboard-content">
              {tab === "home" && (
                <>
                  <div className="dash-heading">
                    <div>
                      <h1>
                        {firstName
                          ? `Hello, ${firstName}.`
                          : "Welcome to goodmiles."}
                      </h1>
                      <p className="customer-muted">
                        A little more care for your car. A little more time for
                        you.
                      </p>
                    </div>
                    <a className="dash-main-action" href="/booking">
                      Request a visit{" "}
                      <span className="action-arrow">
                        <Icon name="arrow" />
                      </span>
                    </a>
                  </div>
                  <div className="dash-grid">
                    <article className="dash-card dash-next">
                      <div className="dash-card-top">
                        <span className="customer-eyebrow">Next visit</span>
                        <span className="dash-icon">
                          <Icon name="visits" />
                        </span>
                      </div>
                      {next ? (
                        <>
                          <span className="dash-pill">
                            {labels[next.status] ?? next.status}
                          </span>
                          <h2>{formatDate(next.preferred_date)}</h2>
                          <p>
                            {next.vehicle_category} · {next.vehicle_number}
                          </p>
                          <small>
                            {next.status === "requested"
                              ? "Preferred date · awaiting confirmation"
                              : "Preferred date · contact goodmiles for the service window"}
                          </small>
                        </>
                      ) : (
                        <>
                          <span className="dash-pill">All clear</span>
                          <h2>No upcoming visit.</h2>
                          <p>Your next care session will appear here.</p>
                        </>
                      )}
                      <button
                        className="dash-text-link"
                        onClick={() => setTab("visits")}
                      >
                        View your visits{" "}
                        <span className="action-arrow">
                          <Icon name="arrow" />
                        </span>
                      </button>
                    </article>
                    <article className="dash-card dash-plan">
                      <div className="dash-card-top">
                        <span className="customer-eyebrow">Your plan</span>
                        <span className="dash-icon">
                          <Icon name="plans" />
                        </span>
                      </div>
                      <span className="dash-pill muted-pill">Coming soon</span>
                      <h2>Care that keeps up.</h2>
                      <p>Explore the plans we’re preparing for your car.</p>
                      <button
                        className="dash-text-link"
                        onClick={() => setTab("plans")}
                      >
                        Explore plans{" "}
                        <span className="action-arrow">
                          <Icon name="arrow" />
                        </span>
                      </button>
                    </article>
                    <article className="dash-card dash-vehicle">
                      <div className="dash-card-top">
                        <span className="customer-eyebrow">Your vehicle</span>
                        <span className="dash-icon">
                          <Icon name="car" />
                        </span>
                      </div>
                      {vehicle ? (
                        <>
                          <h2>{vehicle.vehicle_category}</h2>
                          <p>{vehicle.vehicle_number}</p>
                          <small>{latest ? "From your latest visit request" : "From your saved details"}</small>
                        </>
                      ) : (
                        <>
                          <h2>Let’s meet your car.</h2>
                          <p>Add your vehicle when you request a visit.</p>
                        </>
                      )}
                      <a className="dash-text-link" href="/booking">
                        Request a visit{" "}
                        <span className="action-arrow">
                          <Icon name="arrow" />
                        </span>
                      </a>
                    </article>
                  </div>
                  <div className="dash-section-heading">
                    <h2>What would you like to do?</h2>
                  </div>
                  <div className="dash-shortcuts">
                    <button onClick={() => setTab("visits")}>
                      <span>
                        <Icon name="visits" />
                      </span>
                      <strong>Visit history</strong>
                      <small>Requests & updates</small>
                      <b>
                        <Icon name="arrow" />
                      </b>
                    </button>
                    <button onClick={() => setTab("plans")}>
                      <span>
                        <Icon name="plans" />
                      </span>
                      <strong>Explore plans</strong>
                      <small>Memberships coming soon</small>
                      <b>
                        <Icon name="arrow" />
                      </b>
                    </button>
                    <button onClick={() => setTab("account")}>
                      <span>
                        <Icon name="account" />
                      </span>
                      <strong>Account & support</strong>
                      <small>Details, payments & help</small>
                      <b>
                        <Icon name="arrow" />
                      </b>
                    </button>
                  </div>
                </>
              )}
              {tab === "visits" && (
                <>
                  <h1>Your visits.</h1>
                  <p className="customer-muted">
                    See the status of your visit requests.
                  </p>
                  <a className="customer-button dash-action" href="/booking">
                    Request a visit{" "}
                    <span className="action-arrow">
                      <Icon name="arrow" />
                    </span>
                  </a>
                  <div className="dash-section-heading">
                    <h2>Visit history</h2>
                    <span>
                      {visits.length} {visits.length === 1 ? "visit" : "visits"}
                    </span>
                  </div>
                  {visits.length ? (
                    visits.map((v) => (
                      <div className="visit-card" key={v.id}>
                        <span className="visit-status">
                          {labels[v.status] ?? v.status}
                        </span>
                        <strong>{formatDate(v.preferred_date)}</strong>
                        <p>
                          {v.vehicle_category} · {v.vehicle_number}
                        </p>
                        <small>
                          Preferred date
                          {v.status === "requested"
                            ? " · awaiting confirmation"
                            : ""}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="visit-card">
                      <strong>No visits yet</strong>
                      <p>Your requests will appear here.</p>
                    </div>
                  )}
                  <div className="dash-placeholder">
                    <strong>More visit controls</strong>
                    <p>
                      Rescheduling, cancellation requests and detailed service
                      records are coming soon.
                    </p>
                    <span>Coming soon</span>
                  </div>
                </>
              )}
              {tab === "plans" && (
                <>
                  <h1>Care on your terms.</h1>
                  <p className="customer-muted">
                    Explore the memberships we’re preparing. Plan selection and
                    subscriptions are coming soon.
                  </p>
                  <div className="dash-plans plans-choice-grid">
                    {plans.map((p) => (
                      <article className="dash-card" key={p.name}>
                        <h2>{p.name}</h2>
                        <p className="dash-price">
                          ₹{p.price} <small>/ 28 days</small>
                        </p>
                        <p>
                          Proposed: 8 visits, including exterior and light
                          interior care.
                        </p>
                        <span className="dash-pill muted-pill">
                          Coming soon
                        </span>
                      </article>
                    ))}
                    <article className="dash-card plans-custom-choice">
                      <h2>Custom plan</h2>
                      <p>Choose the number of exterior and interior washes that works for you.</p>
                      <a href="#custom-plan" className="plans-custom-link">Build your plan <span aria-hidden="true">→</span></a>
                    </article>
                  </div>
                  <p className="customer-footnote">
                    Prices and plan details are provisional. No subscription or
                    payment is collected here.
                  </p>
                  <CustomPlan />
                  <a className="customer-button dash-action" href="/booking">
                    Request an individual visit{" "}
                    <span className="action-arrow">
                      <Icon name="arrow" />
                    </span>
                  </a>
                </>
              )}
              {tab === "account" && (
                <>
                  <h1>All about you.</h1>
                  <p className="customer-muted">
                    Your details and everything you need for your car care.
                  </p>
                  <div className="dash-account-grid">
                    <article className="dash-card">
                      <h2>{latest?.customer_name || profile?.customer_name || "goodmiles customer"}</h2>
                      <p>{email}</p>
                      <Link className="dash-site-link" href="/login?setPassword=1">Set or change password</Link>
                      <button
                        className="customer-signout"
                        onClick={() => void signOut()}
                      >
                        Sign out
                      </button>
                    </article>
                    <article className="dash-card">
                      <h2>Your vehicle & parking</h2>
                      <p>
                        Details from your last request are filled in when you
                        book again.
                      </p>
                      <a className="dash-text-link" href="/booking">
                        Request a visit{" "}
                        <span className="action-arrow">
                          <Icon name="arrow" />
                        </span>
                      </a>
                    </article>
                  </div>
                  <div className="dash-section-heading">
                    <h2>More for you</h2>
                  </div>
                  <div className="dash-placeholder-list">
                    {[
                      {
                        name: "Vehicles & parking",
                        desc: "Manage vehicles, apartment and access details.",
                      },
                      {
                        name: "Payments & receipts",
                        desc: "Manage payment methods and view billing history.",
                      },
                      {
                        name: "Help & support",
                        desc: "Get help and follow up on issues.",
                      },
                      {
                        name: "Profile & preferences",
                        desc: "Update contact details and communication preferences.",
                      },
                    ].map((item) => (
                      <div className="dash-placeholder" key={item.name}>
                        <strong>{item.name}</strong>
                        <p>{item.desc}</p>
                        <span>Coming soon</span>
                      </div>
                    ))}
                  </div>
                  <Link className="dash-site-link" href="/">
                    Visit the goodmiles website ↗
                  </Link>
                </>
              )}
            </section>
            <nav className="customer-bottom" aria-label="Customer navigation">
              {nav.map((item) => (
                <button
                  key={item.id}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => setTab(item.id)}
                >
                  <span>
                    <Icon name={item.icon} />
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </>
        )}
      </div>
    </main>
  );
}
