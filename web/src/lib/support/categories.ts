/**
 * The fixed set of topics a reader can pick in the site-wide "Support" form.
 * Shared by the client form (SupportRequest.tsx) and the server-side validator
 * (support/store.ts) so the two never drift. Mirrors reports/categories.ts.
 */
export const SUPPORT_CATEGORIES = [
  { value: "question", label: "General question" },
  { value: "bug", label: "Bug / something broke" },
  { value: "feedback", label: "Feedback / suggestion" },
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["value"];

export function isSupportCategory(value: string): value is SupportCategory {
  return SUPPORT_CATEGORIES.some((c) => c.value === value);
}
