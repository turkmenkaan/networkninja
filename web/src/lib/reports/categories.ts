/**
 * The fixed set of issue categories a reader can pick when reporting a problem
 * with a lesson or lab. Shared by the client form (ReportIssue.tsx) and the
 * server-side validator (reports/store.ts) so the two never drift.
 */
export const REPORT_CATEGORIES = [
  { value: "typo", label: "Typo or wording" },
  { value: "inaccuracy", label: "Technical inaccuracy" },
  { value: "lab-broken", label: "Lab does not work" },
  { value: "confusing", label: "Confusing or unclear" },
  { value: "other", label: "Something else" },
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]["value"];

export function isReportCategory(value: string): value is ReportCategory {
  return REPORT_CATEGORIES.some((c) => c.value === value);
}
