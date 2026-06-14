import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site-config";

export type SiteSettings = {
  name: string;
  longName: string;
  executiveDirector: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
  location: string;
  footerText: string;
  social: {
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    tiktok: string;
  };
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: SITE.name,
  longName: SITE.longName,
  executiveDirector: SITE.executiveDirector,
  email: SITE.email,
  secondaryEmail: SITE.secondaryEmail,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  address: SITE.address,
  location: SITE.location,
  footerText:
    "YOHRIAE works with young people, community leaders, health actors, and partners to build safer, healthier futures.",
  social: {
    instagram: SITE.social.instagram,
    twitter: SITE.social.twitter,
    facebook: SITE.social.facebook,
    linkedin: SITE.social.linkedin,
    tiktok: SITE.social.tiktok,
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error || !data) return DEFAULT_SITE_SETTINGS;

  return {
    name: data.name ?? DEFAULT_SITE_SETTINGS.name,
    longName: data.long_name ?? DEFAULT_SITE_SETTINGS.longName,
    executiveDirector: data.executive_director ?? DEFAULT_SITE_SETTINGS.executiveDirector,
    email: data.email ?? DEFAULT_SITE_SETTINGS.email,
    secondaryEmail: data.secondary_email ?? DEFAULT_SITE_SETTINGS.secondaryEmail,
    phone: data.phone ?? DEFAULT_SITE_SETTINGS.phone,
    whatsapp: data.whatsapp ?? DEFAULT_SITE_SETTINGS.whatsapp,
    address: data.address ?? DEFAULT_SITE_SETTINGS.address,
    location: data.location ?? DEFAULT_SITE_SETTINGS.location,
    footerText: data.footer_text ?? DEFAULT_SITE_SETTINGS.footerText,
    social: {
      instagram: data.instagram ?? DEFAULT_SITE_SETTINGS.social.instagram,
      twitter: data.twitter ?? DEFAULT_SITE_SETTINGS.social.twitter,
      facebook: data.facebook ?? DEFAULT_SITE_SETTINGS.social.facebook,
      linkedin: data.linkedin ?? DEFAULT_SITE_SETTINGS.social.linkedin,
      tiktok: data.tiktok ?? DEFAULT_SITE_SETTINGS.social.tiktok,
    },
  };
}

export function useSiteSettings() {
  const { data = DEFAULT_SITE_SETTINGS } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  });

  return data;
}

export function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function toWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
