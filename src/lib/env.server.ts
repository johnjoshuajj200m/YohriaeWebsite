/** Server-only environment validation (safe for Nitro / API routes). */

export type EnvValidation = {
  ok: boolean;
  missing: string[];
  message: string;
};

function readEnv(name: string): string | undefined {
  try {
    const value = process.env[name]?.trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

function readFirstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = readEnv(name);
    if (value) return value;
  }
  return undefined;
}

function validation(missing: string[], readyMessage: string, prefix: string): EnvValidation {
  if (missing.length === 0) {
    return { ok: true, missing: [], message: readyMessage };
  }
  return {
    ok: false,
    missing,
    message: `${prefix} Missing: ${missing.join(", ")}. Add them in your Vercel project environment settings.`,
  };
}

export function readSupabaseUrl(): string | undefined {
  return readFirstEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
}

export function readSupabaseAnonKey(): string | undefined {
  return readFirstEnv("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");
}

export function readSupabaseServiceRoleKey(): string | undefined {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

/** Public Supabase vars used by server-side auth checks. */
export function validateSupabasePublicEnv(): EnvValidation {
  const missing: string[] = [];
  if (!readSupabaseUrl()) missing.push("SUPABASE_URL");
  if (!readSupabaseAnonKey()) missing.push("SUPABASE_PUBLISHABLE_KEY");
  return validation(
    missing,
    "Supabase public configuration is ready.",
    "Supabase authentication is unavailable.",
  );
}

/** Service-role Supabase vars for trusted admin/server writes. */
export function validateSupabaseServiceEnv(): EnvValidation {
  const missing: string[] = [];
  if (!readSupabaseUrl()) missing.push("SUPABASE_URL");
  if (!readSupabaseServiceRoleKey()) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return validation(
    missing,
    "Supabase service configuration is ready.",
    "Supabase admin server access is unavailable.",
  );
}

export function readResendApiKey(): string | undefined {
  return readEnv("RESEND_API_KEY");
}

export function readNewsletterFromEmail(): string | undefined {
  return readFirstEnv("NEWSLETTER_FROM_EMAIL", "NOTIFICATION_FROM_EMAIL");
}

export function readAdminNotificationEmailsRaw(): string | undefined {
  return readEnv("ADMIN_NOTIFICATION_EMAILS");
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseFromAddress(from: string) {
  if (from.includes("<")) {
    return from.slice(from.indexOf("<") + 1, from.indexOf(">")).trim();
  }
  return from.trim();
}

/** Newsletter / Resend notification vars. */
export function validateNewsletterEnv(): EnvValidation {
  const missing: string[] = [];
  if (!readResendApiKey()) missing.push("RESEND_API_KEY");

  const from = readNewsletterFromEmail();
  if (!from) {
    missing.push("NEWSLETTER_FROM_EMAIL");
  } else if (!looksLikeEmail(parseFromAddress(from))) {
    return {
      ok: false,
      missing: ["NEWSLETTER_FROM_EMAIL"],
      message:
        "Newsletter notifications are unavailable. NEWSLETTER_FROM_EMAIL must include a valid sender address.",
    };
  }

  const recipientsRaw = readAdminNotificationEmailsRaw();
  if (!recipientsRaw) {
    missing.push("ADMIN_NOTIFICATION_EMAILS");
  } else {
    const recipients = recipientsRaw
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (recipients.length === 0 || !recipients.every(looksLikeEmail)) {
      return {
        ok: false,
        missing: ["ADMIN_NOTIFICATION_EMAILS"],
        message:
          "Newsletter notifications are unavailable. ADMIN_NOTIFICATION_EMAILS must be a comma-separated list of valid email addresses.",
      };
    }
  }

  return validation(
    missing,
    "Newsletter notification configuration is ready.",
    "Newsletter notifications are unavailable.",
  );
}

function normalizePrivateKey(key: string) {
  const trimmed = key.trim();
  const unquoted =
    trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
  return unquoted.replace(/\\n/g, "\n");
}

function isValidGa4PropertyId(value: string) {
  return /^\d+$/.test(value);
}

function looksLikeMeasurementId(value: string) {
  return /^G-[A-Z0-9]+$/i.test(value);
}

function isPemPrivateKey(value: string) {
  return value.includes("BEGIN PRIVATE KEY") || value.includes("BEGIN RSA PRIVATE KEY");
}

/** Google Analytics 4 Data API credentials. */
export function validateGa4Env(): EnvValidation {
  const missing: string[] = [];
  const propertyId = readEnv("GA4_PROPERTY_ID");
  const clientEmail = readEnv("GOOGLE_CLIENT_EMAIL");
  const privateKeyRaw = readEnv("GOOGLE_PRIVATE_KEY");

  if (!propertyId) missing.push("GA4_PROPERTY_ID");
  if (!clientEmail) missing.push("GOOGLE_CLIENT_EMAIL");
  if (!privateKeyRaw) missing.push("GOOGLE_PRIVATE_KEY");

  if (missing.length > 0) {
    return validation(missing, "GA4 configuration is ready.", "GA4 analytics is unavailable.");
  }

  if (looksLikeMeasurementId(propertyId!)) {
    return {
      ok: false,
      missing: ["GA4_PROPERTY_ID"],
      message:
        "GA4 analytics is unavailable. GA4_PROPERTY_ID looks like a Measurement ID (G-XXXX). Use the numeric Property ID from GA4 Admin.",
    };
  }

  if (!isValidGa4PropertyId(propertyId!)) {
    return {
      ok: false,
      missing: ["GA4_PROPERTY_ID"],
      message: "GA4 analytics is unavailable. GA4_PROPERTY_ID must contain digits only.",
    };
  }

  if (!looksLikeEmail(clientEmail!)) {
    return {
      ok: false,
      missing: ["GOOGLE_CLIENT_EMAIL"],
      message:
        "GA4 analytics is unavailable. GOOGLE_CLIENT_EMAIL must be a valid Google service account email.",
    };
  }

  const privateKey = normalizePrivateKey(privateKeyRaw!);
  if (!isPemPrivateKey(privateKey)) {
    return {
      ok: false,
      missing: ["GOOGLE_PRIVATE_KEY"],
      message:
        "GA4 analytics is unavailable. GOOGLE_PRIVATE_KEY must be a PEM private key (BEGIN PRIVATE KEY).",
    };
  }

  return {
    ok: true,
    missing: [],
    message: "GA4 configuration is ready.",
  };
}

let loggedServiceEnv = false;

export function logSupabaseServiceEnvOnce(validation: EnvValidation) {
  if (validation.ok || loggedServiceEnv) return;
  loggedServiceEnv = true;
  console.error(`[Supabase] ${validation.message}`);
}
