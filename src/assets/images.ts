import logo from "./YOHRIAE LOGO.png";

import teamGroup from "./PHOTO-2026-06-13-18-17-48.jpg";
import workshopPlanning from "./PHOTO-2026-06-13-18-17-48 (1).jpg";
import teamOutdoor from "./PHOTO-2026-06-13-18-17-48 (2).jpg";

import workshopSession from "./PHOTO-2026-06-13-18-17-49.jpg";
import paralegalTraining from "./PHOTO-2026-06-13-18-17-49 (1).jpg";
import hivAwareness from "./PHOTO-2026-06-13-18-17-49 (2).jpg";
import womensDay from "./PHOTO-2026-06-13-18-17-49 (3).jpg";
import youthAcademy from "./PHOTO-2026-06-13-18-17-49 (4).jpg";
import capacityWorkshop from "./PHOTO-2026-06-13-18-17-49 (5).jpg";
import leadershipWorkshop from "./PHOTO-2026-06-13-18-17-49 (6).jpg";
import iwdAdvocacy from "./PHOTO-2026-06-13-18-17-49 (7).jpg";
import advocacyMap from "./PHOTO-2026-06-13-18-17-49 (8).jpg";
import regionalLeadership from "./PHOTO-2026-06-13-18-17-49 (9).jpg";
import partnerVisit from "./PHOTO-2026-06-13-18-17-49 (10).jpg";
import safetyTraining from "./PHOTO-2026-06-13-18-17-49 (11).jpg";
import mentalHealth from "./PHOTO-2026-06-13-18-17-49 (12).jpg";
import orgGroup from "./PHOTO-2026-06-13-18-17-49 (13).jpg";
import mentalHealthTraining from "./PHOTO-2026-06-13-18-17-49 (14).jpg";
import academyTeam from "./PHOTO-2026-06-13-18-17-49 (15).jpg";

export { logo };

export const IMAGES = {
  hero: teamGroup,
  about: workshopPlanning,
  impactHealth: hivAwareness,
  impactMentalHealth: mentalHealth,
  founder: advocacyMap,
  team: orgGroup,
  partner: partnerVisit,
} as const;

export const GALLERY = [
  { id: "g1", src: teamGroup, caption: "YOHRIAE team and community partners" },
  { id: "g2", src: workshopPlanning, caption: "Strategic planning workshop" },
  { id: "g3", src: teamOutdoor, caption: "Team gathering — Northern Nigeria" },
  { id: "g4", src: workshopSession, caption: "Community workshop session" },
  { id: "g5", src: paralegalTraining, caption: "Paralegal & human rights documentation training" },
  { id: "g6", src: hivAwareness, caption: "World AIDS Day awareness campaign" },
  { id: "g7", src: womensDay, caption: "International Women's Day advocacy" },
  { id: "g8", src: youthAcademy, caption: "YOHRIAE Academy youth football team" },
  { id: "g9", src: capacityWorkshop, caption: "Capacity building training session" },
  { id: "g10", src: leadershipWorkshop, caption: "Regional leadership workshop — Kano State" },
  { id: "g11", src: iwdAdvocacy, caption: "Women's rights advocacy campaign" },
  { id: "g12", src: advocacyMap, caption: "Community advocacy and inclusion mapping" },
  { id: "g13", src: regionalLeadership, caption: "Joint partners initiative — capacity building" },
  { id: "g14", src: partnerVisit, caption: "Partnership engagement with community leaders" },
  { id: "g15", src: safetyTraining, caption: "Safety & security training for advocates" },
  { id: "g16", src: mentalHealth, caption: "Mental health advocacy session" },
  { id: "g17", src: orgGroup, caption: "YOHRIAE organizational team" },
  { id: "g18", src: mentalHealthTraining, caption: "Mental health training workshop" },
  { id: "g19", src: academyTeam, caption: "YOHRIAE Academy — youth empowerment through sport" },
] as const;

export const PROGRAM_IMAGES = {
  health: hivAwareness,
  rights: paralegalTraining,
  leadership: leadershipWorkshop,
  outreach: workshopSession,
  mentalHealth: mentalHealthTraining,
  empowerment: youthAcademy,
  gbv: womensDay,
  advocacy: safetyTraining,
} as const;
