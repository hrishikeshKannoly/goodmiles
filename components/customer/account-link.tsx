"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AccountLink() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const client = supabaseBrowser(); let active = true;
    async function refresh() {
      const { data: { user } } = await client.auth.getUser();
      if (!active) return;
      if (!user) { setLabel(null); return; }
      const { data } = await client.from("booking_requests").select("customer_name").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (active) setLabel(data?.customer_name?.trim() || user.email || "Your account");
    }
    void refresh();
    const { data } = client.auth.onAuthStateChange(() => { window.setTimeout(() => void refresh(), 0); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return <a className="account-link" href={label ? "/booking" : "/login"}>{label ? `Hi, ${label}` : "Sign in"}</a>;
}
