"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/booking` } });
      setMessage(error ? error.message : "Check your email for your sign-in link. Open it on this device.");
    } catch { setMessage("Could not reach the sign-in service. Please try again."); }
    setBusy(false);
  }
  return <main className="auth-page"><a className="logo" href="/">goodmiles<span>.</span></a><section className="auth-card"><p className="eyebrow light">YOUR GOODMILES ACCOUNT</p><h1>Welcome in.</h1><p>Enter your email and we’ll send you a sign-in link.</p><form onSubmit={signIn}><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/><button className="button primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send sign-in link"}</button></form><p role="status">{message}</p><a href="/">← Back to home</a></section></main>;
}
