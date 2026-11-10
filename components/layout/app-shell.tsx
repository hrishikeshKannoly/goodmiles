import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SurfaceNav } from "@/components/layout/surface-nav";
import { routesFor, surfaceMeta, type Surface } from "@/lib/routes";

type AppShellProps = {
  surface: Exclude<Surface, "public">;
  children: React.ReactNode;
};

export function AppShell({ surface, children }: AppShellProps) {
  const meta = surfaceMeta[surface];
  const links = routesFor(surface).filter((route) => route.path !== "/worker/service/[id]");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="goodmiles home">
              <Wordmark size="sm" />
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-silver">
              {meta.label}
            </p>
          </div>
          <SurfaceNav routes={links} label={meta.label} />
          <p className="text-sm text-silver">
            Preview shell. Sign-in and permissions are not enforced until Phase 2.
          </p>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
