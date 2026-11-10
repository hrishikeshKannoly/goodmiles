export const surfaces = [
  "public",
  "auth",
  "customer",
  "worker",
  "admin",
] as const;

export type Surface = (typeof surfaces)[number];

export type Phase =
  | "Phase 1"
  | "Phase 2"
  | "Phase 3"
  | "Phase 4"
  | "Phase 5";

export type AppRoute = {
  path: string;
  title: string;
  navLabel: string;
  surface: Surface;
  phase: Phase;
  summary: string;
};

export const surfaceMeta: Record<
  Surface,
  { label: string; description: string }
> = {
  public: {
    label: "Public website",
    description: "Marketing pages for residents and the November event.",
  },
  auth: {
    label: "Authentication",
    description: "Sign-in, phone verification, and onboarding.",
  },
  customer: {
    label: "Customer",
    description: "Subscription, vehicles, schedule, and support.",
  },
  worker: {
    label: "Worker",
    description: "Daily assignments and the service workflow.",
  },
  admin: {
    label: "Admin",
    description: "Operations, people, schedule, and leads.",
  },
};

export const routes: readonly AppRoute[] = [
  {
    path: "/",
    title: "Home",
    navLabel: "Home",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Foundation preview. The premium public homepage is built in Phase 1.",
  },
  {
    path: "/services",
    title: "Services",
    navLabel: "Services",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Placeholder for exterior and light interior detailing. Service copy is not published yet.",
  },
  {
    path: "/plans",
    title: "Plans",
    navLabel: "Plans",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Placeholder for subscription plans. Prices will load from configuration, not from hardcoded page copy.",
  },
  {
    path: "/how-it-works",
    title: "How it works",
    navLabel: "How it works",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Placeholder for the resident journey from registration to a scheduled visit.",
  },
  {
    path: "/about",
    title: "About",
    navLabel: "About",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Placeholder. Company facts will be added only after the owner confirms them.",
  },
  {
    path: "/contact",
    title: "Contact",
    navLabel: "Contact",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Placeholder. Business phone, email, and address are not published yet.",
  },
  {
    path: "/event",
    title: "November event",
    navLabel: "Event",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Placeholder for the 28–29 November apartment event and demo registration.",
  },
  {
    path: "/privacy",
    title: "Privacy",
    navLabel: "Privacy",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Draft placeholder. This is not a privacy policy and needs owner and legal review before publication.",
  },
  {
    path: "/terms",
    title: "Terms",
    navLabel: "Terms",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Draft placeholder. This is not a terms of service and needs owner and legal review before publication.",
  },
  {
    path: "/refund-policy",
    title: "Refund policy",
    navLabel: "Refunds",
    surface: "public",
    phase: "Phase 1",
    summary:
      "Draft placeholder. Refund and cancellation rules are not approved yet.",
  },
  {
    path: "/login",
    title: "Log in",
    navLabel: "Log in",
    surface: "auth",
    phase: "Phase 2",
    summary: "Placeholder. Authentication is not connected yet.",
  },
  {
    path: "/verify",
    title: "Verify phone",
    navLabel: "Verify",
    surface: "auth",
    phase: "Phase 2",
    summary: "Placeholder. Phone verification is not connected yet.",
  },
  {
    path: "/onboarding",
    title: "Onboarding",
    navLabel: "Onboarding",
    surface: "auth",
    phase: "Phase 2",
    summary:
      "Placeholder for apartment, vehicle, and subscription setup after sign-in.",
  },
  {
    path: "/app",
    title: "Customer home",
    navLabel: "Home",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for the customer dashboard.",
  },
  {
    path: "/app/vehicles",
    title: "Vehicles",
    navLabel: "Vehicles",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for registered vehicles.",
  },
  {
    path: "/app/subscription",
    title: "Subscription",
    navLabel: "Subscription",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for the active plan, cycle, and visit balance.",
  },
  {
    path: "/app/schedule",
    title: "Schedule",
    navLabel: "Schedule",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for upcoming visits and reschedule requests.",
  },
  {
    path: "/app/history",
    title: "Service history",
    navLabel: "History",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for completed services.",
  },
  {
    path: "/app/payments",
    title: "Payments",
    navLabel: "Payments",
    surface: "customer",
    phase: "Phase 3",
    summary:
      "Placeholder. Live payments are Phase 6 and are not enabled.",
  },
  {
    path: "/app/support",
    title: "Support",
    navLabel: "Support",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for feedback, complaints, and damage reports.",
  },
  {
    path: "/app/profile",
    title: "Profile",
    navLabel: "Profile",
    surface: "customer",
    phase: "Phase 3",
    summary: "Placeholder for the customer profile.",
  },
  {
    path: "/worker",
    title: "Worker home",
    navLabel: "Today",
    surface: "worker",
    phase: "Phase 5",
    summary: "Placeholder for today's assignments.",
  },
  {
    path: "/worker/assignments",
    title: "Assignments",
    navLabel: "Assignments",
    surface: "worker",
    phase: "Phase 5",
    summary: "Placeholder for the daily job list.",
  },
  {
    path: "/worker/service/[id]",
    title: "Service visit",
    navLabel: "Service",
    surface: "worker",
    phase: "Phase 5",
    summary:
      "Placeholder for inspection, checklist, and completion. No job data is loaded.",
  },
  {
    path: "/worker/issues",
    title: "Issues",
    navLabel: "Issues",
    surface: "worker",
    phase: "Phase 5",
    summary: "Placeholder for incident reporting.",
  },
  {
    path: "/worker/profile",
    title: "Profile",
    navLabel: "Profile",
    surface: "worker",
    phase: "Phase 5",
    summary: "Placeholder for the worker profile.",
  },
  {
    path: "/admin",
    title: "Admin overview",
    navLabel: "Overview",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for the operations overview.",
  },
  {
    path: "/admin/customers",
    title: "Customers",
    navLabel: "Customers",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for customer management.",
  },
  {
    path: "/admin/vehicles",
    title: "Vehicles",
    navLabel: "Vehicles",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for vehicle management.",
  },
  {
    path: "/admin/workers",
    title: "Workers",
    navLabel: "Workers",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for worker accounts and assignments.",
  },
  {
    path: "/admin/apartments",
    title: "Apartments",
    navLabel: "Apartments",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for approved apartment communities.",
  },
  {
    path: "/admin/schedule",
    title: "Schedule",
    navLabel: "Schedule",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for the operations calendar.",
  },
  {
    path: "/admin/subscriptions",
    title: "Subscriptions",
    navLabel: "Subscriptions",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for subscription management.",
  },
  {
    path: "/admin/payments",
    title: "Payments",
    navLabel: "Payments",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder. Payment reconciliation is Phase 6.",
  },
  {
    path: "/admin/leads",
    title: "Leads",
    navLabel: "Leads",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for event and enquiry leads.",
  },
  {
    path: "/admin/incidents",
    title: "Incidents",
    navLabel: "Incidents",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for damage and service issues.",
  },
  {
    path: "/admin/reports",
    title: "Reports",
    navLabel: "Reports",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for operational reports.",
  },
  {
    path: "/admin/settings",
    title: "Settings",
    navLabel: "Settings",
    surface: "admin",
    phase: "Phase 4",
    summary: "Placeholder for configurable business settings.",
  },
];

const requiredPaths = [
  "/",
  "/services",
  "/plans",
  "/how-it-works",
  "/about",
  "/contact",
  "/event",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/login",
  "/verify",
  "/onboarding",
  "/app",
  "/app/vehicles",
  "/app/subscription",
  "/app/schedule",
  "/app/history",
  "/app/payments",
  "/app/support",
  "/app/profile",
  "/worker",
  "/worker/assignments",
  "/worker/service/[id]",
  "/worker/issues",
  "/worker/profile",
  "/admin",
  "/admin/customers",
  "/admin/vehicles",
  "/admin/workers",
  "/admin/apartments",
  "/admin/schedule",
  "/admin/subscriptions",
  "/admin/payments",
  "/admin/leads",
  "/admin/incidents",
  "/admin/reports",
  "/admin/settings",
] as const;

export function getRoute(path: string): AppRoute {
  const route = routes.find((item) => item.path === path);
  if (!route) {
    throw new Error(`Unknown goodmiles route: ${path}`);
  }
  return route;
}

export function routesFor(surface: Surface): AppRoute[] {
  return routes.filter((route) => route.surface === surface);
}

export function routeToPageFile(route: AppRoute): string {
  const root: Record<Surface, string> = {
    public: "app/(public)",
    auth: "app/(auth)",
    customer: "app/app",
    worker: "app/worker",
    admin: "app/admin",
  };

  const relative = relativeSegment(route);
  return relative ? `${root[route.surface]}/${relative}/page.tsx` : `${root[route.surface]}/page.tsx`;
}

function relativeSegment(route: AppRoute): string {
  if (route.surface === "public" || route.surface === "auth") {
    return route.path.replace(/^\//, "");
  }

  if (route.surface === "customer") {
    return route.path === "/app" ? "" : route.path.slice("/app/".length);
  }

  if (route.surface === "worker") {
    return route.path === "/worker" ? "" : route.path.slice("/worker/".length);
  }

  return route.path === "/admin" ? "" : route.path.slice("/admin/".length);
}

export function previewHref(route: AppRoute): string {
  return route.path.replace("[id]", "preview");
}

export const masterPlanPaths: readonly string[] = requiredPaths;
