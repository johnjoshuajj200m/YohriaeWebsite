export const SITE = {
  name: "YOHRIAE",
  longName: "Youth Health and Right Initiative for Advocacy and Empowerment",
  tagline: "Empowering Young People. Building Stronger Communities.",
  description:
    "YOHRIAE empowers young people and vulnerable communities across Northern Nigeria through health education, human rights advocacy, leadership development, and community empowerment.",
  executiveDirector: "Saeed Abubakar Aliyu",
  email: "yohriae2019@gmail.com",
  secondaryEmail: "yohriaenigeria@gmail.com",
  phone: "+2348021445256",
  whatsapp: "+2347038120170",
  location: "Northern Nigeria",
  address: "Northern Nigeria",
  founded: "2019",
  registration: "Registered Youth-Led Nonprofit Organization",
  social: {
    twitter: "https://x.com/yohriae",
    facebook: "https://www.facebook.com/search/top?q=Youth%20Health%20and%20Right%20Initiative%20for%20Advocacy%20and%20Empowerment",
    instagram: "https://www.instagram.com/yohriae",
    linkedin: "https://www.linkedin.com/search/results/all/?keywords=YOHRIAE%20Nigeria",
    tiktok: "https://www.tiktok.com/@yohriae",
  },
};

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
  { to: "/gallery", label: "Gallery" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  about: [
    { to: "/about", label: "Our Story" },
    { to: "/founder", label: "Founder" },
    { to: "/team", label: "Our Team" },
    { to: "/contact", label: "Contact Us" },
  ],
  programs: [
    { to: "/programs", label: "All Programs" },
    { to: "/programs", label: "Health Education" },
    { to: "/programs", label: "Human Rights Advocacy" },
    { to: "/programs", label: "Youth Empowerment" },
  ],
  resources: [
    { to: "/resources", label: "Resources" },
    { to: "/blog", label: "Blog" },
    { to: "/events", label: "Events" },
    { to: "/gallery", label: "Photo Gallery" },
  ],
  getInvolved: [
    { to: "/donate", label: "Donate" },
    { to: "/partner", label: "Partner With Us" },
    { to: "/volunteer", label: "Volunteer" },
  ],
} as const;

export const HERO_STATS = [
  { value: "5,000+", label: "Youth Reached" },
  { value: "20+", label: "Communities Served" },
  { value: "50+", label: "Programs Delivered" },
] as const;

export const IMPACT_STATS = [
  { value: "5,000+", label: "Beneficiaries Reached" },
  { value: "120+", label: "Events Organized" },
  { value: "20+", label: "Communities Engaged" },
  { value: "15+", label: "Partnerships Built" },
] as const;

export const HOME_PROGRAMS = [
  {
    title: "Health Education",
    desc: "Comprehensive health literacy, SRHR, and access to care for young people and communities.",
    slug: "health",
    stat: "1,800+ people reached through health literacy and referral activities",
  },
  {
    title: "Human Rights Advocacy",
    desc: "Rights education, legal literacy, and policy advocacy for dignity and equality.",
    slug: "rights",
    stat: "30+ advocacy and legal empowerment sessions delivered",
  },
  {
    title: "Leadership Development",
    desc: "Equipping youth with skills, mentorship, and civic engagement opportunities.",
    slug: "leadership",
    stat: "450+ young people engaged in leadership and capacity building",
  },
  {
    title: "Community Outreach",
    desc: "Grassroots mobilization, dialogue, and behaviour change at the community level.",
    slug: "outreach",
    stat: "20+ communities reached through dialogue and outreach",
  },
  {
    title: "Mental Health Support",
    desc: "Psychosocial support, safe spaces, and referral pathways for young people.",
    slug: "mental-health",
    stat: "Safe spaces and peer support integrated into youth programming",
  },
  {
    title: "Youth Empowerment",
    desc: "Livelihood skills, entrepreneurship, and pathways to economic opportunity.",
    slug: "empowerment",
    stat: "Youth skills, sport, and mentorship used as entry points for change",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "The sessions made it easier for young people to ask questions about health and rights without fear. People left with information they could actually use.",
    name: "Youth participant",
    role: "Health education program, Kaduna",
    initials: "YP",
  },
  {
    quote:
      "YOHRIAE does not arrive with assumptions. Their team listens to community leaders, youth groups, and service providers before shaping the response.",
    name: "Community leader",
    role: "Outreach dialogue, Kano",
    initials: "CL",
  },
  {
    quote:
      "The organization brings strong local trust and clear documentation, which makes collaboration easier for partners working on health and protection.",
    name: "Program partner",
    role: "Rights and health collaboration",
    initials: "PP",
  },
] as const;

export const CORE_VALUES = [
  "Dignity & Respect",
  "Equity & Inclusion",
  "Integrity & Accountability",
  "Community Ownership",
  "Evidence-Based Action",
  "Collaboration",
] as const;
