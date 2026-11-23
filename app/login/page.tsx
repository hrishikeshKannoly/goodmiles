"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import "../customer-forms-redesign.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [method, setMethod] = useState<"password" | "signup" | "link" | "set-password">("password");
  const [canSetPassword, setCanSetPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const signingUp = useRef(false);
  useEffect(() => {
    const client = supabaseBrowser();
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("next");
    const settingPassword = params.get("setPassword") === "1";
    const methodTimer = settingPassword ? window.setTimeout(() => setMethod("set-password"), 0) : undefined;
    const category = params.get("category");
    const onboardingDestination = `/onboarding${params.get("next") === "/booking" || params.get("after") === "booking" ? `?next=booking${["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `&category=${encodeURIComponent(category!)}` : ""}` : ""}`;
    const destination =
      requested === "/onboarding" ? "/onboarding" : requested === "/admin" || requested === "/worker"
        ? requested
        : requested === "/booking"
          ? `/booking${["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `?category=${encodeURIComponent(category!)}` : ""}`
          : "/app";
    void client.auth.getUser().then(({ data: { user } }) => {
      if (active && user) {
        if (settingPassword) setCanSetPassword(true);
        else router.replace(user.user_metadata?.onboarding_pending === true ? onboardingDestination : destination);
      }
    });
    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user && !signingUp.current) {
          if (settingPassword) setCanSetPassword(true);
          else router.replace(session.user.user_metadata?.onboarding_pending === true ? onboardingDestination : destination);
        }
      },
    );
    return () => {
      active = false;
      window.clearTimeout(methodTimer);
      subscription.subscription.unsubscribe();
    };
  }, [router]);
  async function sendLink(setPasswordAfterLink = false) {
    setBusy(true);
    setMessage("");
    try {
      const params = new URLSearchParams(window.location.search);
      const callback = new URL("/login", window.location.origin);
      if (setPasswordAfterLink) callback.searchParams.set("setPassword", "1");
      if (["/booking", "/onboarding", "/admin", "/worker"].includes(params.get("next") ?? ""))
        callback.searchParams.set("next", params.get("next")!);
      if (["Hatchback", "Sedan", "SUV"].includes(params.get("category") ?? ""))
        callback.searchParams.set("category", params.get("category")!);
      const { error } = await supabaseBrowser().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback.toString(), shouldCreateUser: false },
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
  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) { setMessage("Passwords do not match. Please try again."); return; }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabaseBrowser().auth.updateUser({ password });
      if (error) setMessage(error.message);
      else {
        setPassword("");
        setConfirmation("");
        const params = new URLSearchParams(window.location.search);
        const requested = params.get("next");
        const category = params.get("category");
        const destination = requested === "/admin" || requested === "/worker" || requested === "/onboarding" ? requested : requested === "/booking" ? `/booking${["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `?category=${encodeURIComponent(category!)}` : ""}` : "/app";
        router.replace(destination);
      }
    } catch { setMessage("Could not update your password. Please try again."); }
    setBusy(false);
  }
  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabaseBrowser().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setMessage(error.code === "invalid_credentials"
          ? "We couldn't sign you in. Check your email and password, or create an account if you're new."
          : error.code === "email_not_confirmed"
            ? "Your email is not confirmed yet. Open the confirmation email, then try again."
            : error.message);
      } else if (data.session && data.user) {
        const params = new URLSearchParams(window.location.search);
        const requested = params.get("next");
        const category = params.get("category");
        const categoryQuery = ["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `?category=${encodeURIComponent(category!)}` : "";
        if (data.user.user_metadata?.onboarding_pending === true) {
          router.replace(requested === "/booking" ? `/onboarding?next=booking${categoryQuery ? `&category=${encodeURIComponent(category!)}` : ""}` : "/onboarding");
        } else {
          router.replace(requested === "/booking" ? `/booking${categoryQuery}` : requested === "/admin" || requested === "/worker" || requested === "/onboarding" ? requested : "/app");
        }
      } else {
        setMessage("Sign-in did not complete. Please try again.");
      }
    } catch {
      setMessage("Could not reach the sign-in service. Please try again.");
    }
    setBusy(false);
  }
  async function signUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }
    setBusy(true);
    signingUp.current = true;
    setMessage("");
    try {
      const params = new URLSearchParams(window.location.search);
      const callback = new URL("/login", window.location.origin);
      const category = params.get("category");
      callback.searchParams.set("next", "/onboarding");
      if (params.get("next") === "/booking") callback.searchParams.set("after", "booking");
      if (["Hatchback", "Sedan", "SUV"].includes(category ?? "")) callback.searchParams.set("category", category!);
      const { data, error } = await supabaseBrowser().auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: callback.toString(), data: { onboarding_pending: true } } });
      if (error) setMessage(error.message);
      else if (data.session) router.replace(params.get("next") === "/booking" ? `/onboarding?next=booking${["Hatchback", "Sedan", "SUV"].includes(category ?? "") ? `&category=${encodeURIComponent(category!)}` : ""}` : "/onboarding");
      else if (!data.session) {
        setPassword("");
        setConfirmation("");
        setMessage("Your account could not be signed in automatically. If you received a confirmation email, open it on this device. If you already have an account, sign in instead.");
      }
    } catch { setMessage("Could not reach the sign-up service. Please try again."); }
    signingUp.current = false;
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
          <p>Sign in to manage your car care.</p>
        </div>
        <section className="gm-flow-panel" aria-label="Sign in">
          {method === "set-password" && canSetPassword ? <>
          <h2>Set your password</h2>
          <p>Choose a password to use the next time you sign in.</p>
          <form onSubmit={updatePassword}>
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            <button className="gm-flow-button" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
            <p className="gm-flow-status" role="status" aria-live="polite">{message}</p>
          </form>
          </> : method === "set-password" ? <><h2>Open your email link</h2><p>Open the link on the same device and browser to set your password. If the link has expired, request a new one.</p><button className="gm-flow-button gm-flow-button-secondary" type="button" onClick={() => { setMethod("link"); setMessage(""); }}>Request a new link</button></> : <>
          <h2>{method === "signup" ? "Create your account" : method === "password" ? "Sign in with password" : "Sign in with an email link"}</h2>
          {method === "signup" && <p>Enter your email and choose a password to create your account.</p>}
          <form onInvalidCapture={() => setMessage(method === "signup" ? "Check your email and enter matching passwords of at least 8 characters." : "Please enter a valid email and complete the required fields.")} onSubmit={method === "signup" ? signUp : method === "password" ? signInWithPassword : (event) => { event.preventDefault(); void sendLink(); }}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {(method === "password" || method === "signup") && <>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={method === "signup" ? "new-password" : "current-password"}
                minLength={method === "signup" ? 8 : undefined}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>}
            {method === "signup" && <><label htmlFor="signup-confirmation">Confirm password</label><input id="signup-confirmation" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></>}
            <button className="gm-flow-button" type="submit" disabled={busy}>
              {busy ? "Please wait…" : method === "signup" ? "Create account" : method === "password" ? "Sign in" : "Send sign-in link"}
            </button>
            <p className="gm-flow-status" role="status" aria-live="polite">{message}</p>
            {method === "link" && <button className="gm-flow-button gm-flow-button-secondary" type="button" disabled={busy || !email} onClick={(event) => { if (!event.currentTarget.form?.reportValidity()) return; void sendLink(true); }}>Send link to set a password</button>}
          </form>
          {method !== "signup" && <button className="gm-flow-button gm-flow-button-secondary" type="button" disabled={busy} onClick={() => { setMethod(method === "password" ? "link" : "password"); setMessage(""); }}>
            {method === "password" ? "Use an email link instead" : "Use a password instead"}
          </button>}
          <button className="gm-flow-button gm-flow-button-secondary" type="button" disabled={busy} onClick={() => { setMethod(method === "signup" ? "password" : "signup"); setPassword(""); setConfirmation(""); setMessage(""); }}>
            {method === "signup" ? "Already have an account? Sign in" : "New to goodmiles? Create an account"}
          </button>
          {method === "password" && <p>Forgot your password? Use an email link to sign in or set a new password.</p>}
          </>}
        </section>
      </div>
    </main>
  );
}
