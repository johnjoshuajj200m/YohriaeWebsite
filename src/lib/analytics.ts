const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const isProduction = import.meta.env.PROD;

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initializeAnalytics() {
  if (!isProduction || !GA_MEASUREMENT_ID || typeof window === "undefined") return;
  if (window.gtag) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string, title = document.title) {
  if (!isProduction || !GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: new URL(path, window.location.origin).href,
  });
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (!isProduction || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

export const analyticsEvents = {
  donateClick: (location: string, amount?: number, recurring?: boolean) =>
    trackEvent("donate_click", { location, amount, recurring }),
  partnerClick: (location: string) => trackEvent("partner_with_us_click", { location }),
  contactSubmission: () => trackEvent("contact_form_submission"),
  eventRegistration: (eventTitle: string, eventId: string) =>
    trackEvent("event_registration_click", { event_title: eventTitle, event_id: eventId }),
};
