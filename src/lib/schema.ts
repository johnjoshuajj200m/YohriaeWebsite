/**
 * JSON-LD structured data helpers for YOHRIAE public pages.
 * Uses only data that appears on the site — no fabricated fields.
 */

import { SITE } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export type BreadcrumbItem = { name: string; path: string };

export type ProgramSchemaItem = {
  name: string;
  description: string;
  serviceType: string;
};

export type EventSchemaItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
  organizer?: string | null;
  slug: string;
  registration_link?: string | null;
};

export type BlogPostSchemaItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  featured_image_url?: string | null;
  slug: string;
  author?: string | null;
};

export type VolunteerOpportunity = {
  name: string;
};

/** Strip undefined/null keys so JSON-LD stays valid and lean. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as T;
}

export function pageUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageId(path: string, fragment = "webpage") {
  return `${pageUrl(path)}#${fragment}`;
}

/** Full organization node — emitted once on the root layout. */
export function buildOrganizationNode() {
  return compact({
    "@type": ["NGO", "NonprofitOrganization", "Organization"],
    "@id": ORG_ID,
    name: SITE.name,
    alternateName: SITE.longName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/favicon.svg`,
    },
    image: DEFAULT_OG_IMAGE,
    description: SITE.description,
    slogan: SITE.tagline,
    foundingDate: SITE.founded,
    founder: {
      "@type": "Person",
      name: SITE.executiveDirector,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: SITE.location,
    },
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      addressRegion: SITE.address,
      addressCountry: "NG",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: SITE.email,
        telephone: SITE.phone,
        areaServed: "NG",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "partnerships",
        email: SITE.secondaryEmail,
        telephone: SITE.phone,
        areaServed: "NG",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      SITE.social.twitter,
      SITE.social.facebook,
      SITE.social.instagram,
      SITE.social.linkedin,
      SITE.social.tiktok,
    ],
    knowsAbout: [
      "Youth health",
      "Human rights",
      "Advocacy",
      "Community empowerment",
      "Northern Nigeria",
    ],
  });
}

export function buildWebSiteNode() {
  return compact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  });
}

export function buildBreadcrumbNode(path: string, crumbs: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl(path)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: pageUrl(crumb.path),
      }),
    ),
  };
}

function pageShell(
  path: string,
  type: string,
  name: string,
  description: string,
  extra?: Record<string, unknown>,
) {
  return compact({
    "@type": type,
    "@id": pageId(path),
    url: pageUrl(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en-US",
    ...extra,
  });
}

export function buildHomePageSchema() {
  return jsonLdGraph(
    pageShell(
      "/",
      "WebPage",
      "YOHRIAE — Youth Health, Human Rights & Empowerment in Northern Nigeria",
      SITE.description,
      { mainEntity: { "@id": ORG_ID } },
    ),
  );
}

export function buildAboutPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/about",
      "AboutPage",
      "About YOHRIAE — Our Story, Mission, Vision and Values",
      "YOHRIAE is a youth-led nonprofit working across Northern Nigeria on health, human rights, advocacy, and community empowerment.",
      { mainEntity: { "@id": ORG_ID } },
    ),
    buildBreadcrumbNode("/about", [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  );
}

export function buildProgramsPageSchema(programs: ProgramSchemaItem[]) {
  const serviceNodes = programs.map((program, index) =>
    compact({
      "@type": "Service",
      "@id": `${pageUrl("/programs")}#service-${index + 1}`,
      name: program.name,
      description: program.description,
      serviceType: program.serviceType,
      provider: { "@id": ORG_ID },
      areaServed: SITE.location,
    }),
  );

  return jsonLdGraph(
    pageShell(
      "/programs",
      "CollectionPage",
      "Our Programs — Health, Rights, Leadership & Empowerment",
      "YOHRIAE programs span health education, human rights advocacy, youth empowerment, GBV prevention, mental health support, and community engagement in Northern Nigeria.",
      {
        mainEntity: {
          "@type": "ItemList",
          name: "YOHRIAE Programs",
          numberOfItems: programs.length,
          itemListElement: programs.map((program, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: serviceNodes[index],
          })),
        },
      },
    ),
    ...serviceNodes,
    buildBreadcrumbNode("/programs", [
      { name: "Home", path: "/" },
      { name: "Programs", path: "/programs" },
    ]),
  );
}

export function buildEventsPageSchema(events: EventSchemaItem[]) {
  const eventNodes = events.map((event) => {
    const isPast = new Date(event.starts_at) < new Date();
    return compact({
      "@type": "Event",
      "@id": `${pageUrl("/events")}#event-${event.slug || event.id}`,
      name: event.title,
      description: event.description ?? undefined,
      startDate: event.starts_at,
      endDate: event.ends_at ?? undefined,
      eventStatus: isPast
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: event.location
        ? {
            "@type": "Place",
            name: event.location,
            address: {
              "@type": "PostalAddress",
              addressRegion: event.location,
              addressCountry: "NG",
            },
          }
        : {
            "@type": "Place",
            name: SITE.location,
            address: {
              "@type": "PostalAddress",
              addressRegion: SITE.location,
              addressCountry: "NG",
            },
          },
      image: event.image_url ?? undefined,
      organizer: event.organizer
        ? { "@type": "Organization", name: event.organizer }
        : { "@id": ORG_ID },
      offers: event.registration_link
        ? {
            "@type": "Offer",
            url: event.registration_link,
            price: "0",
            priceCurrency: "NGN",
            availability: "https://schema.org/InStock",
          }
        : undefined,
    });
  });

  const graph: Record<string, unknown>[] = [
    pageShell(
      "/events",
      "CollectionPage",
      "Events — Trainings, Dialogues & Community Outreach",
      "YOHRIAE events include youth dialogues, health trainings, advocacy convenings, and community outreach across Northern Nigeria.",
      events.length > 0
        ? {
            mainEntity: {
              "@type": "ItemList",
              name: "YOHRIAE Events",
              numberOfItems: events.length,
              itemListElement: events.map((event, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: { "@id": `${pageUrl("/events")}#event-${event.slug || event.id}` },
              })),
            },
          }
        : undefined,
    ),
    buildBreadcrumbNode("/events", [
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
    ]),
    ...eventNodes,
  ];

  return jsonLdGraph(...graph);
}

export function buildBlogPageSchema(posts: BlogPostSchemaItem[]) {
  const blogPostNodes = posts.map((post) =>
    compact({
      "@type": "BlogPosting",
      "@id": `${pageUrl("/blog")}#post-${post.slug}`,
      headline: post.title,
      description: post.excerpt ?? undefined,
      datePublished: post.published_at ?? undefined,
      dateModified: post.updated_at ?? post.published_at ?? undefined,
      author: post.author ? { "@type": "Person", name: post.author } : { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: post.featured_image_url ?? undefined,
      url: `${pageUrl("/blog")}#post-${post.slug}`,
      mainEntityOfPage: pageUrl("/blog"),
      inLanguage: "en-US",
    }),
  );

  const graph: Record<string, unknown>[] = [
    compact({
      "@type": "Blog",
      "@id": `${pageUrl("/blog")}#blog`,
      name: "YOHRIAE Blog",
      description:
        "Stories, insights, advocacy wins, and program updates from YOHRIAE across Northern Nigeria.",
      url: pageUrl("/blog"),
      publisher: { "@id": ORG_ID },
      inLanguage: "en-US",
      ...(posts.length > 0
        ? {
            blogPost: posts.map((post) => ({
              "@id": `${pageUrl("/blog")}#post-${post.slug}`,
            })),
          }
        : {}),
    }),
    pageShell(
      "/blog",
      "CollectionPage",
      "Blog — Stories, Insights & Updates from YOHRIAE",
      "YOHRIAE stories, insights, advocacy wins, and program updates from Northern Nigeria.",
      posts.length > 0
        ? {
            mainEntity: {
              "@type": "ItemList",
              name: "YOHRIAE Blog Posts",
              numberOfItems: posts.length,
              itemListElement: posts.map((post, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: { "@id": `${pageUrl("/blog")}#post-${post.slug}` },
              })),
            },
          }
        : undefined,
    ),
    buildBreadcrumbNode("/blog", [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]),
    ...blogPostNodes,
  ];

  return jsonLdGraph(...graph);
}

export function buildContactPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/contact",
      "ContactPage",
      "Contact YOHRIAE — Partnerships, Media & General Inquiries",
      "Contact YOHRIAE for partnerships, media, volunteering, or general inquiries in Northern Nigeria.",
      {
        mainEntity: {
          "@type": "Organization",
          "@id": ORG_ID,
        },
      },
    ),
    buildBreadcrumbNode("/contact", [
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  );
}

export function buildVolunteerPageSchema(opportunities: VolunteerOpportunity[]) {
  const serviceNodes = opportunities.map((item, index) =>
    compact({
      "@type": "Service",
      "@id": `${pageUrl("/volunteer")}#opportunity-${index + 1}`,
      name: item.name,
      provider: { "@id": ORG_ID },
      areaServed: SITE.location,
      serviceType: "Volunteer opportunity",
    }),
  );

  return jsonLdGraph(
    pageShell(
      "/volunteer",
      "WebPage",
      "Volunteer With YOHRIAE — Support Youth, Health & Rights Programs",
      "Volunteer with YOHRIAE to support youth health, human rights, advocacy, and community outreach programs across Northern Nigeria.",
      {
        potentialAction: {
          "@type": "VolunteerAction",
          agent: { "@type": "Person" },
          recipient: { "@id": ORG_ID },
          target: pageUrl("/volunteer"),
        },
        mainEntity: {
          "@type": "ItemList",
          name: "Volunteer opportunities",
          numberOfItems: opportunities.length,
          itemListElement: opportunities.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: serviceNodes[index],
          })),
        },
      },
    ),
    ...serviceNodes,
    buildBreadcrumbNode("/volunteer", [
      { name: "Home", path: "/" },
      { name: "Volunteer", path: "/volunteer" },
    ]),
  );
}

export function buildDonatePageSchema() {
  return jsonLdGraph(
    pageShell(
      "/donate",
      "WebPage",
      "Donate to YOHRIAE — Fund Youth Health, Rights & Empowerment",
      "Support YOHRIAE's community work on youth health, human rights, advocacy, and empowerment in Northern Nigeria.",
      {
        potentialAction: {
          "@type": "DonateAction",
          target: pageUrl("/donate"),
          recipient: { "@id": ORG_ID },
          object: {
            "@type": "MonetaryGrant",
            name: "Donation to YOHRIAE",
            description:
              "Support YOHRIAE programs in health education, human rights advocacy, and youth empowerment.",
          },
        },
      },
    ),
    buildBreadcrumbNode("/donate", [
      { name: "Home", path: "/" },
      { name: "Donate", path: "/donate" },
    ]),
  );
}

export function buildResourcesPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/resources",
      "CollectionPage",
      "Resources — Blog, Events, Reports & Stories",
      "Public resources from YOHRIAE: blog updates, events, reports, and photo stories.",
      {
        mainEntity: {
          "@type": "ItemList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: { "@type": "WebPage", name: "Blog", url: pageUrl("/blog") },
            },
            {
              "@type": "ListItem",
              position: 2,
              item: { "@type": "WebPage", name: "Events", url: pageUrl("/events") },
            },
            {
              "@type": "ListItem",
              position: 3,
              item: { "@type": "WebPage", name: "Gallery", url: pageUrl("/gallery") },
            },
          ],
        },
      },
    ),
    buildBreadcrumbNode("/resources", [
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
    ]),
  );
}

export function buildPartnerPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/partner",
      "WebPage",
      "Partner With YOHRIAE — Donors, NGOs & Community Collaboration",
      "Partner with YOHRIAE to advance youth health, human rights, advocacy, and community empowerment in Northern Nigeria.",
      {
        potentialAction: {
          "@type": "CommunicateAction",
          target: pageUrl("/contact"),
          recipient: { "@id": ORG_ID },
        },
      },
    ),
    buildBreadcrumbNode("/partner", [
      { name: "Home", path: "/" },
      { name: "Partner", path: "/partner" },
    ]),
  );
}

export function buildFounderPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/founder",
      "ProfilePage",
      `Meet the Founder — ${SITE.executiveDirector}`,
      "The founder's story behind YOHRIAE and the conviction that drives work on youth health, human rights, and community empowerment.",
      {
        mainEntity: {
          "@type": "Person",
          name: SITE.executiveDirector,
          jobTitle: "Executive Director",
          worksFor: { "@id": ORG_ID },
        },
      },
    ),
    buildBreadcrumbNode("/founder", [
      { name: "Home", path: "/" },
      { name: "Founder", path: "/founder" },
    ]),
  );
}

export function buildTeamPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/team",
      "AboutPage",
      "Our Team — Leadership, Staff & Advisors",
      "Meet the people behind YOHRIAE — leadership, staff, and advisors driving youth health and rights programs in Northern Nigeria.",
      { mainEntity: { "@id": ORG_ID } },
    ),
    buildBreadcrumbNode("/team", [
      { name: "Home", path: "/" },
      { name: "Team", path: "/team" },
    ]),
  );
}

export function buildGalleryPageSchema() {
  return jsonLdGraph(
    pageShell(
      "/gallery",
      "CollectionPage",
      "Photo Gallery — Community Programs & Events",
      "Photographs from YOHRIAE programs, advocacy events, trainings, and community engagement across Northern Nigeria.",
    ),
    buildBreadcrumbNode("/gallery", [
      { name: "Home", path: "/" },
      { name: "Gallery", path: "/gallery" },
    ]),
  );
}

/** Root layout graph: organization + website (referenced by all inner pages). */
export function buildRootSchemaGraph() {
  return jsonLdGraph(buildOrganizationNode(), buildWebSiteNode());
}

export function jsonLdGraph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

export function jsonLdScript(data: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify(data),
  };
}
