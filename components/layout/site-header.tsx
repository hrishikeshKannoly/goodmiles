"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { routesFor } from "@/lib/routes";

const primaryPaths = [
  "/",
  "/services",
  "/plans",
  "/how-it-works",
  "/about",
  "/contact",
  "/event",
];

export function SiteHeader() {
  const pathname = usePathname();
  const links = routesFor("public").filter((route) =>
    primaryPaths.includes(route.path),
  );

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" aria-label="goodmiles home">
          <Wordmark size="sm" showCategory />
        </Link>
        <nav aria-label="Public" className="flex items-center gap-4 overflow-x-auto">
          {links.map((route) => {
            const active = pathname === route.path;
            return (
              <Link
                key={route.path}
                href={route.path}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 text-sm ${
                  active ? "text-ice" : "text-silver hover:text-pearl"
                }`}
              >
                {route.navLabel}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="shrink-0 rounded-full border border-ice/40 px-3 py-1.5 text-sm text-ice hover:bg-ice/10"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
