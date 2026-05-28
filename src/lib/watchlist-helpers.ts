export const PHASES = ["Preclinical", "Phase I", "Phase II", "Phase III", "Filed", "Marketed"] as const;
export type Phase = (typeof PHASES)[number];

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export function isRecentPhaseChange(date: string | null | undefined): boolean {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < THIRTY_DAYS_MS;
}
