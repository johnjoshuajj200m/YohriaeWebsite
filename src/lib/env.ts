/** Public Supabase config (safe for client bundle). */
export function readSupabasePublicEnv() {
  const url = (
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) ||
    ""
  ).trim();

  const anonKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== "undefined" ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined) ||
    ""
  ).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

let loggedMissingSupabase = false;

export function logMissingSupabaseEnvOnce() {
  if (loggedMissingSupabase) return;
  loggedMissingSupabase = true;
  const { url, anonKey } = readSupabasePublicEnv();
  const missing = [
    ...(!url ? ["VITE_SUPABASE_URL / SUPABASE_URL"] : []),
    ...(!anonKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY"] : []),
  ];
  console.error(
    `[Supabase] Missing environment variable(s): ${missing.join(", ")}. ` +
      "Dynamic features will be unavailable until deployment env is configured.",
  );
}
