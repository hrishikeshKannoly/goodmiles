"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import "../customer-forms-redesign.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const client = supabaseBrowser();
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("next");
    const category = params.get("category");
    const destination =
      requested === "/admin" || requested === "/worker"
        ? requested
        : requested === "/booking"
          ? `/booking${["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `?category=${encodeURIComponent(category!)}` : ""}`
          : "/app";
    void client.auth.getUser().then(({ data: { user } }) => {
      if (active && user) router.replace(destination);
    });
    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) router.replace(destination);
      },
    );
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const params = new URLSearchParams(window.location.search);
      const callback = new URL("/login", window.location.origin);
      if (["/booking", "/admin", "/worker"].includes(params.get("next") ?? ""))
        callback.searchParams.set("next", params.get("next")!);
      if (["Hatchback", "Sedan", "SUV"].includes(params.get("category") ?? ""))
        callback.searchParams.set("category", params.get("category")!);
      const { error } = await supabaseBrowser().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback.toString() },
      });
      setMessage(
        error
          ? error.message
          : "Check your email for your sign-in link. Open it on this device.",
      );
    } catch {
      setMessage("Could not reach the sign-in service. Please try again.");
    }
    setBusy(false);
  }
  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    } catch {
      setMessage("Could not reach the sign-in service. Please try again.");
    }
    setBusy(false);
  }
  return (
    <main className="gm-flow gm-flow-login">
      <header className="gm-flow-header">
        <Link className="logo" href="/">
          goodmiles<span>.</span>
        </Link>
        <Link href="/">Back to home</Link>
      </header>
      <div className="gm-flow-layout">
        <div className="gm-flow-intro">
          <h1>Welcome in.</h1>
          <p>Enter your email and we’ll send you a sign-in link.</p>
        </div>
        <section className="gm-flow-panel" aria-label="Sign in">
          <h2>Sign in with email</h2>
          <form onSubmit={signIn}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="gm-flow-button" type="submit" disabled={busy}>
              {busy ? "Please wait…" : "Send sign-in link"}
            </button>
          </form>
          {process.env.NODE_ENV === "development" && (
            <form className="gm-flow-test" onSubmit={signInWithPassword}>
              <p>Local testing: sign in with a test account password.</p>
              <label htmlFor="test-password">Test account password</label>
              <input
                id="test-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="gm-flow-button gm-flow-button-secondary"
                type="submit"
                disabled={busy || !email}
              >
                {busy ? "Please wait…" : "Sign in with password"}
              </button>
            </form>
          )}
          <p className="gm-flow-status" role="status">
            {message}
          </p>
        </section>
      </div>
    </main>
  );
}
