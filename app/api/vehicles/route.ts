import { getModels } from "@meterapp/vehicle-db";

const catalog = [
  ...getModels({ vehicleTypeId: 2 }),
  ...getModels({ vehicleTypeId: 7 }),
];
const makes = [...new Set(catalog.map(({ makeName }) => makeName))].sort();

export async function GET(request: Request) {
  const make = new URL(request.url).searchParams.get("make")?.trim().toLowerCase();
  const models = make
    ? [...new Set(catalog.filter((item) => item.makeName.toLowerCase() === make).map((item) => item.modelName))].sort()
    : [];
  return Response.json({ makes, models });
}
