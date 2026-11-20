# goodmiles

A web app for requesting and managing car-care visits at apartment communities. It combines a public-facing website with customer, worker, and operations screens.

**Live site:** [goodmiles-nine.vercel.app](https://goodmiles-nine.vercel.app/)

## What it does

- **Public website:** presents the service, provisional plan information, and a visit request entry point.
- **Customer account:** signs in with a password or email link, requests a visit, and shows request status and visit history. Details from the latest request are reused when filling in a new request.
- **Operations:** lets authorized admins review requests, assign active workers, confirm or cancel requests, and review reported incidents. The team contacts customers manually to confirm visits.
- **Worker dashboard:** shows assigned visits and lets active workers start and complete services with a checklist or report an issue.
- **Mobile experience:** provides responsive customer screens, accessible focus styles, reduced-motion support, and an installable web-app manifest.

A visit request is **not** a confirmed appointment. Subscription management, online payments, self-service rescheduling, and parts of account management and support are placeholders or planned features. Prices and membership details on the site are provisional.

## Technology

- Next.js App Router, React, TypeScript, and CSS
- Supabase Auth and PostgreSQL, with row-level security policies and database functions
- Vercel deployment connected to the GitHub repository

## Local setup

You need Node.js compatible with the installed Next.js version, npm, and a Supabase project. Prefer a separate Supabase project for development: requests made locally change the data in the configured project.

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create `.env.local` in the project root with the project's public Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   These values are exposed to the browser. Do not put a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable or commit `.env.local`.

3. Apply the SQL files in `supabase/migrations/` to the intended Supabase project **in filename order**, using the Supabase migration workflow or SQL Editor. On an existing project, check which migrations have already been applied before running any pending files; several create objects and policies and are not safe to rerun blindly.
4. Add at least one active record to `public.apartments`. The booking form only lists active communities.
5. Configure Supabase Auth for email sign-in and add the local and production callback addresses to its redirect allow list. The app sends email links back to `/login`, optionally with query parameters for the original destination and selected vehicle category. Set the Supabase Site URL to the public production origin, and configure allowed redirects for the required environments.
6. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use the same browser and device to request and open an email sign-in link.

### Passwords and email links

Enable email/password authentication in Supabase. Customers can sign in with a password or request an email sign-in link. To create or reset a password, select the email-link option and request the link to set a password; open it on the same device and browser. An existing signed-in customer can also open `/login?setPassword=1` to set a password. Supabase's configured password and reauthentication rules apply. The redirect allow list must include the `/login` callback with its query parameters. Test email delivery and the complete flow on the intended domain before deploying.

### Admin and worker access

The `/admin` and `/worker` pages require a signed-in Supabase user and the corresponding database membership. A trusted database administrator must add admins to `public.admin_users` and workers to `public.workers`; workers must be active to receive assignments. These roles are not granted from the public app.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Public website |
| `/login` | Email sign-in; password option in development |
| `/booking` | Visit request form |
| `/app` | Customer dashboard |
| `/admin` | Operations dashboard for authorized admins |
| `/worker` | Assignments and service workflow for active workers |

## Commands

```bash
npm run dev     # Start the development server
npm run build   # Create a production build
npm run start   # Serve a completed production build
npm run lint    # Run ESLint
```

The repository currently has no configured test script. A successful build checks compilation and TypeScript, but does not verify live Supabase configuration, email delivery, or a complete booking flow.

## Deployment

The GitHub repository is connected to Vercel; pushes to its configured production branch trigger a deployment. Set the two public Supabase environment variables in Vercel for the appropriate environment, and configure the production domain in Supabase Auth's URL settings.

Use the public production domain for customer testing. Deployment-specific or preview URLs may be protected by Vercel Authentication and can send visitors to a Vercel login page. Request a new sign-in link after changing domains or redirect configuration.

Deploying the frontend does **not** apply database migrations. Apply pending migrations separately to the correct Supabase project and verify the booking and role flows. In particular, `202611110001_booking_transitions.sql` adds database checks for administrative booking transitions; its presence in the repository does not establish that it has been applied to a live database.

The vehicle category and catalogue migrations (`202611170001` and `202611170002`) create five pricing categories, a review category, and a snapshot of passenger-car and MPV models from `@meterapp/vehicle-db`. Only the examples discussed have an initial classification; the rest need review. Admins can update `vehicle_models.category_id`, and refreshing the seed with `node scripts/generate-vehicle-seed.cjs` leaves existing assignments unchanged when the seed is applied. Sample plan rates in `app/app/custom-plan.tsx` are not final. Applying migrations is required before category lookup can work.

## Project structure

```text
app/                 Pages, layout, styles, and web-app manifest
components/          Shared UI components
lib/                 Client configuration and shared utilities
public/              Images, brand assets, and app icons
supabase/migrations/ Database schema, policies, and functions
```
