import Link from "next/link";
import type { AppRoute } from "@/lib/routes";
import { surfaceMeta } from "@/lib/routes";

type RoutePlaceholderProps = {
  route: AppRoute;
  detail?: string;
};

export function RoutePlaceholder({ route, detail }: RoutePlaceholderProps) {
  const surface = surfaceMeta[route.surface];

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-16 sm:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-ice">
        {surface.label} · {route.phase}
      </p>
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-pearl sm:text-5xl">
          {route.title}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-silver">{route.summary}</p>
        {detail ? <p className="text-sm text-silver">{detail}</p> : null}
      </div>
      <div className="rounded-2xl border border-white/10 bg-navy px-5 py-4 text-sm leading-6 text-silver">
        This screen is a route placeholder. Business workflows, accounts, and
        payments are not implemented in this phase.
      </div>
      <Link
        href="/"
        className="w-fit text-sm font-medium text-ice underline-offset-4 hover:underline"
      >
        Back to the foundation preview
      </Link>
    </article>
  );
}
