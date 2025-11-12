type EnvRecord = Record<string, string | undefined>;

if (typeof Bun === 'undefined' || !Bun.env) {
  throw new Error('Bun runtime is required to access runtime environment variables.');
}

const sourceEnv: EnvRecord = Bun.env;

export const runtimeEnv: EnvRecord = sourceEnv;

/**
 * Fetch an environment variable while providing an optional fallback.
 */
export function getEnv(name: string, fallback?: string): string | undefined {
  const value = sourceEnv[name];
  return value ?? fallback;
}

/**
 * Require an environment variable at runtime, throwing a descriptive error if missing.
 */
export function requireEnv(name: string): string {
  const value = sourceEnv[name];

  if (!value) {
    throw new Error(`[Bun] Missing required environment variable: ${name}`);
  }

  return value;
}
