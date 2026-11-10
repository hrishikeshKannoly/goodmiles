import Link from "next/link";
import { brand } from "@/lib/brand";
import { routesFor } from "@/lib/routes";

export function SiteFooter() {
  const legal = routesFor("public").filter((route) =>
    ["/privacy", "/terms", "/refund-policy"].includes(route.path),
  );

  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-display text-lg text-pearl">
            {brand.name}
            <span className="text-ice">.</span>
          </p>
          <p className="max-w-sm text-sm leading-6 text-silver">
            {brand.proposition} {brand.location}.
          </p>
          <p className="text-sm text-silver">
            Contact details and legal identity are pending owner approval.
          </p>
        </div>
        <nav aria-label="Legal" className="flex gap-4 text-sm text-silver">
          {legal.map((route) => (
            <Link key={route.path} href={route.path} className="hover:text-pearl">
              {route.navLabel}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
