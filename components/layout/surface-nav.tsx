"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppRoute } from "@/lib/routes";
import { previewHref } from "@/lib/routes";

type SurfaceNavProps = {
  routes: AppRoute[];
  label: string;
};

export function SurfaceNav({ routes, label }: SurfaceNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
      {routes.map((route) => {
        const href = previewHref(route);
        const active =
          pathname === href ||
          (route.path.includes("[id]") && pathname.startsWith("/worker/service/"));
        return (
          <Link
            key={route.path}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              active
                ? "bg-ice text-ink"
                : "border border-white/10 text-silver hover:text-pearl"
            }`}
          >
            {route.navLabel}
          </Link>
        );
      })}
    </nav>
  );
}
