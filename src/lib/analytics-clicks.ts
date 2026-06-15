/** Lazy event tracking — keeps `@/lib/analytics` off the homepage initial bundle. */
export function trackDonateClick(location: string) {
  void import("./analytics").then(({ analyticsEvents }) => analyticsEvents.donateClick(location));
}

export function trackPartnerClick(location: string) {
  void import("./analytics").then(({ analyticsEvents }) => analyticsEvents.partnerClick(location));
}
