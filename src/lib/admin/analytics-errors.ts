export const GA_NOT_CONNECTED = "Google Analytics not connected.";

export function isGa4ConfigError(message: string) {
  return (
    message.includes("GA4_PROPERTY_ID") ||
    message.includes("GA4_SERVICE_ACCOUNT_JSON") ||
    message.includes("not configured") ||
    message.includes("invalid JSON")
  );
}

export function normalizeGa4Error(message: string) {
  if (isGa4ConfigError(message)) {
    return GA_NOT_CONNECTED;
  }
  return message;
}
