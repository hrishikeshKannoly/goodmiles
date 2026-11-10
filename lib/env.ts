import { z } from "zod";

/**
 * Public configuration only. Secret keys are documented in .env.example
 * and must not be read by client components. Nothing here is required
 * until Supabase and Cashfree are introduced.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("goodmiles"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function blankToUndefined(value: string | undefined): string | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }
  return value;
}

export function parsePublicEnv(
  source: Record<string, string | undefined> = process.env,
): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: blankToUndefined(source.NEXT_PUBLIC_APP_URL),
    NEXT_PUBLIC_APP_NAME: blankToUndefined(source.NEXT_PUBLIC_APP_NAME),
  });
}

export function getPublicEnv(): PublicEnv {
  return parsePublicEnv();
}
