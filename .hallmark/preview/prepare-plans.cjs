const fs = require("node:fs");
let page = fs.readFileSync("app/app/page.tsx", "utf8")
  .replace('import Link from "next/link";', 'const Link = ({href, children, ...props}: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>;')
  .replace('import { supabaseBrowser } from "@/lib/supabase/browser";', 'import { supabaseBrowser } from "./supabase-mock";')
  .replace('import "./customer-redesign.css";', 'import "../../app/app/customer-redesign.css";')
  .replace('import "./plans-redesign.css";', 'import "../../app/app/plans-redesign.css";')
  .replace('import { CustomPlan } from "./custom-plan";', 'import { CustomPlan } from "./current-custom-plan";')
  .replace('useState<Tab>("home")', 'useState<Tab>("plans")');
fs.writeFileSync(".hallmark/preview/current-plans.tsx", page);
fs.writeFileSync(".hallmark/preview/current-custom-plan.tsx", fs.readFileSync("app/app/custom-plan.tsx", "utf8").replace('import { supabaseBrowser } from "@/lib/supabase/browser";', 'import { supabaseBrowser } from "./supabase-mock";'));
