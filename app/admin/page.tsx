"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Booking = { id: string; customer_name: string; phone: string; vehicle_number: string; vehicle_category: string; parking_location: string; preferred_date: string; status: string; created_at: string; assigned_worker_id: string | null };
export default function AdminPage() {
  const [state, setState] = useState<"loading" | "login" | "denied" | "ready" | "error">("loading");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [incidents,setIncidents] = useState<{id:string;category:string;notes:string;status:string;created_at:string;booking_id:string}[]>([]);
  const [workers, setWorkers] = useState<{user_id:string;display_name:string}[]>([]);
  const [busy, setBusy] = useState("");
  async function load() {
    const client = supabaseBrowser();
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) { setState("login"); return; }
    const { data: member, error: membershipError } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (membershipError) { setState("error"); return; }
    if (!member) { setState("denied"); return; }
    const { data, error } = await client.from("booking_requests").select("id,customer_name,phone,vehicle_number,vehicle_category,parking_location,preferred_date,status,created_at,assigned_worker_id").order("created_at", { ascending: false });
    if (error) { setState("error"); return; }
    const { data: workerData } = await client.from("workers").select("user_id,display_name").eq("active", true); setWorkers(workerData ?? []);
    const {data:incidentData,error:incidentError}=await client.from("service_incidents").select("id,category,notes,status,created_at,booking_id").order("created_at",{ascending:false}); if(incidentError){setState("error");return;} setIncidents(incidentData ?? []);
    setBookings(data ?? []); setState("ready");
  }
  useEffect(() => { void load(); }, []);
  async function updateStatus(id: string, status: string) {
    setBusy(id); setMessage("");
    const { data, error } = await supabaseBrowser().from("booking_requests").update({ status }).eq("id", id).select("id");
    if (error || !data?.length) setMessage("Could not update the request. Please try again.");
    else { setMessage("Request updated."); await load(); }
    setBusy("");
  }
  async function assign(id:string, workerId:string) { setBusy(id); setMessage(""); const {data,error}=await supabaseBrowser().from("booking_requests").update({assigned_worker_id:workerId || null}).eq("id",id).select("id"); if(error || !data?.length) setMessage("Could not assign worker."); else {setMessage("Assignment saved."); await load();} setBusy(""); }
  async function resolveIncident(id:string){setBusy(id);setMessage("");const {data,error}=await supabaseBrowser().from("service_incidents").update({status:"resolved"}).eq("id",id).select("id");if(error || !data?.length)setMessage("Could not update incident.");else{setMessage("Incident resolved.");await load();}setBusy("");}
  return <main className="admin-page"><header className="admin-header"><a className="logo" href="/">goodmiles<span>.</span></a><span>OPERATIONS</span><a href="/">Back to website</a></header><div className="admin-content"><p className="eyebrow">GOODMILES / ADMIN</p><h1>Booking requests.</h1>{state === "loading" && <p>Loading…</p>}{state === "login" && <p>Please <a href="/login?next=%2Fadmin">sign in</a> with your admin account.</p>}{state === "denied" && <p>This account does not have admin access.</p>}{state === "error" && <p>Could not load the admin dashboard. Check that the admin database setup has been applied.</p>}{state === "ready" && <><p>Assign an active worker before confirming a request. Contact the customer manually to confirm the visit.</p><p role="status">{message}</p>{bookings.length === 0 ? <p>No requests yet.</p> : <div className="admin-list">{bookings.map(b=><article className="admin-request" key={b.id}><div><span className="admin-status">{b.status}</span><h2>{b.customer_name}</h2><p>{b.phone} · {b.vehicle_category} · {b.vehicle_number}</p><p>Parking: {b.parking_location} · Preferred date: {b.preferred_date}</p></div><div className="admin-actions"><label>Worker <select aria-label="Assign worker" value={b.assigned_worker_id ?? ""} disabled={!!busy || !["requested", "confirmed"].includes(b.status)} onChange={e=>assign(b.id,e.target.value)}><option value="">Unassigned</option>{workers.map(w=><option key={w.user_id} value={w.user_id}>{w.display_name}</option>)}</select></label><button disabled={!!busy || b.status !== "requested" || !b.assigned_worker_id} onClick={()=>updateStatus(b.id,"confirmed")}>Mark confirmed</button><button disabled={!!busy || !["requested", "confirmed"].includes(b.status)} onClick={()=>updateStatus(b.id,"cancelled")}>Mark cancelled</button></div></article>)}</div>}<section className="admin-incidents"><h2>Incidents</h2>{incidents.length===0?<p>No incidents reported.</p>:incidents.map(i=><article className="admin-request" key={i.id}><div><span className="admin-status">{i.status}</span><h3>{i.category}</h3><p>{i.notes}</p><p>Vehicle: {bookings.find(b=>b.id===i.booking_id)?.vehicle_number ?? "Unavailable"}</p></div>{i.status==="open"&&<button disabled={!!busy} onClick={()=>resolveIncident(i.id)}>Mark resolved</button>}</article>)}</section></>}</div></main>;
}
