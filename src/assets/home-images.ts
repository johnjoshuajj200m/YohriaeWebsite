/** Homepage-only image imports — avoids pulling the full gallery bundle on `/`. */
/* eslint-disable @typescript-eslint/ban-ts-comment -- imagetools query suffixes are build-time only */
// @ts-nocheck
import workshopPlanning from "./PHOTO-2026-06-13-18-17-48 (1).jpg?w=1280&format=webp&quality=78";
import hivAwareness from "./PHOTO-2026-06-13-18-17-49 (2).jpg?w=1280&format=webp&quality=78";
import mentalHealth from "./PHOTO-2026-06-13-18-17-49 (12).jpg?w=1280&format=webp&quality=78";
import partnerVisit from "./PHOTO-2026-06-13-18-17-49 (10).jpg?w=1280&format=webp&quality=78";
import paralegalTraining from "./PHOTO-2026-06-13-18-17-49 (1).jpg?w=1280&format=webp&quality=78";
import leadershipWorkshop from "./PHOTO-2026-06-13-18-17-49 (6).jpg?w=1280&format=webp&quality=78";

export const HOME_IMAGES = {
  about: workshopPlanning,
  impactHealth: hivAwareness,
  impactMentalHealth: mentalHealth,
  partner: partnerVisit,
} as const;

export const HOME_PROGRAM_IMAGES = {
  health: hivAwareness,
  rights: paralegalTraining,
  leadership: leadershipWorkshop,
} as const;
