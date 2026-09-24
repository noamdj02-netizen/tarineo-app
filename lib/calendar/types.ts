/** Un événement prêt à afficher, qu'il vienne de Navpit ou du calendrier iCal. */
export type CalEvent = {
  id: string;
  title: string;
  /** ISO. Pour un événement « toute la journée », minuit du jour concerné. */
  start: string;
  end: string | null;
  allDay: boolean;
  /** jour AAAA-MM-JJ des événements « toute la journée » (évite les décalages de fuseau) */
  day: string | null;
  source: "navpit" | "ical";
  project: string | null;
};

export type CalendarFeedInfo =
  { connected: false } | { connected: true; provider: string };

/** Plage max chargée d'un coup (une grille de mois = 6 semaines). */
export const MAX_RANGE_DAYS = 45;
