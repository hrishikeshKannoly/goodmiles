// Generate a repeatable snapshot; unverified models must never receive a guessed price category.
/* eslint-disable @typescript-eslint/no-require-imports -- This generator is a CommonJS script. */
const fs = require("node:fs");
const { getModels } = require("@meterapp/vehicle-db");
const reviewed = {
  "SUZUKI|ALTO": "small_hatchback", "MARUTI|ALTO": "small_hatchback", "RENAULT|KWID": "small_hatchback",
  "SUZUKI|BALENO": "large_hatch_compact_sedan", "HYUNDAI|I20": "large_hatch_compact_sedan", "HONDA|AMAZE": "large_hatch_compact_sedan",
  "HONDA|CITY": "sedan", "HYUNDAI|VERNA": "sedan", "SKODA|SLAVIA": "sedan",
  "TATA|NEXON": "compact_suv", "HYUNDAI|CRETA": "compact_suv", "KIA|SELTOS": "compact_suv",
  "TOYOTA|FORTUNER": "large_suv_mpv", "MAHINDRA|XUV700": "large_suv_mpv", "TOYOTA|INNOVA": "large_suv_mpv",
};
const rows = new Map();
for (const { makeName, modelName } of [...getModels({ vehicleTypeId: 2 }), ...getModels({ vehicleTypeId: 7 })]) {
  const make = makeName.trim().toUpperCase();
  const model = modelName.trim().toUpperCase();
  if (make && model) rows.set(`${make}|${model}`, [make, model, reviewed[`${make}|${model}`] || "needs_review"]);
}
const sql = (s) => `'${s.replaceAll("'", "''")}'`;
const chunks = [];
const values = [...rows.values()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
for (let i = 0; i < values.length; i += 500) {
  chunks.push(`insert into public.vehicle_models (make, model, category_id) values\n${values.slice(i, i + 500).map((row) => `  (${row.map(sql).join(", ")})`).join(",\n")}\non conflict (make, model) do nothing;`);
}
fs.writeFileSync("supabase/migrations/202611170002_vehicle_catalog_seed.sql", `-- Generated from @meterapp/vehicle-db; rerun scripts/generate-vehicle-seed.cjs to refresh.\n-- Existing classifications are never overwritten.\n${chunks.join("\n\n")}\n`);
console.log(`Generated ${values.length} distinct vehicle models.`);
