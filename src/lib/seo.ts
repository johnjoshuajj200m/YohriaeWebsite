/**
 * SEO helpers — produces a consistent set of meta + link tags for every page.
 * Plain object data only; safe to import from any client or server route.
 */

export const SITE_URL = "https://www.yohriae.com";
export const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/455a4834-473e-498a-96ee-f27782a83a37/id-preview-7228dcee--bc2d6ffa-72f5-4f13-b479-e0b873f18d0e.lovable.app-1781368796558.png";
export const TWITTER_HANDLE = "@yohriae";

export type PageMetaInput = {
  /** Full page title. */
  title: string;
  /** Meta description (≈ 50–160 chars recommended). */
  description: string;
  /** Path relative to the site root, e.g. "/about". Leading slash required. */
  path: string;
  /** Optional Open Graph / Twitter image (absolute URL). */
  image?: string;
  /** og:type — defaults to "website". */
  type?: "website" | "article" | "profile";
  /** If true, adds `<meta name="robots" content="noindex,nofollow">`. */
  noindex?: boolean;
  /** Extra meta tag objects to append. */
  extraMeta?: Array<Record<string, string>>;
};

export type MetaTag = Record<string, string>;
export type LinkTag = Record<string, string>;

/**
 * Build a canonical set of meta tags + canonical link for a route's `head()`.
 * Spread the result into the TanStack `head` config:
 *
 *   head: () => buildPageHead({ title, description, path: "/about" })
 */
export function buildPageHead(input: PageMetaInput): {
  meta: MetaTag[];
  links: LinkTag[];
} {
  const url = `${SITE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const type = input.type ?? "website";

  const meta: MetaTag[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "YOHRIAE" },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: input.title },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: image },
  ];

  if (input.noindex) {
    meta.push({ name: "robots", content: "noindex,nofollow" });
  }

  if (input.extraMeta) {
    meta.push(...input.extraMeta);
  }

  const links: LinkTag[] = [{ rel: "canonical", href: url }];

  return { meta, links };
}

/** Routes included in the public sitemap. Update when adding a new public page. */
export const PUBLIC_ROUTES: Array<{
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.9 },
  { path: "/founder", changefreq: "monthly", priority: 0.7 },
  { path: "/team", changefreq: "monthly", priority: 0.7 },
  { path: "/programs", changefreq: "monthly", priority: 0.9 },
  { path: "/events", changefreq: "weekly", priority: 0.8 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/gallery", changefreq: "monthly", priority: 0.6 },
  { path: "/resources", changefreq: "monthly", priority: 0.6 },
  { path: "/volunteer", changefreq: "monthly", priority: 0.8 },
  { path: "/partner", changefreq: "monthly", priority: 0.8 },
  { path: "/donate", changefreq: "monthly", priority: 0.9 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
];
