type EnvRecord = Record<string, string | undefined>;

// Support both Bun.env (local/Bun runtime) and process.env (Vercel/Node.js compatibility)
const sourceEnv: EnvRecord = typeof Bun !== 'undefined' && Bun.env
  ? Bun.env
  : process.env;

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
