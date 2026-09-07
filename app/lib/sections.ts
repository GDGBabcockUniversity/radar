// Single source of truth for the article `section` enum.
// Imported by the Sanity schema (sanity/schemas/article.ts) AND the issue page
// so the option set and the newspaper render order never drift apart.

export const SECTIONS = [
  { value: "openingNote", title: "Opening Note" },
  { value: "spotlight", title: "Spotlight" },
  { value: "editorial", title: "Editorial" },
  { value: "alumniSpotlight", title: "Alumni Spotlight" },
  { value: "ecosystemBrief", title: "Ecosystem Brief" },
  { value: "interview", title: "Interview" },
  { value: "feature", title: "Feature" },
] as const;

export type SectionValue = (typeof SECTIONS)[number]["value"];

export const SECTION_TITLES: Record<SectionValue, string> = SECTIONS.reduce(
  (acc, s) => {
    acc[s.value] = s.title;
    return acc;
  },
  {} as Record<SectionValue, string>,
);

// The order sections appear on an issue page (newspaper layout, brief §4).
// signals + opportunities are embedded blocks slotted in by the page, not here.
// editorial/interview/feature fall into the page's "More from this issue"
// bucket, which inherits the query's section-alphabetical order.
export const ISSUE_SECTION_ORDER: SectionValue[] = [
  "openingNote",
  "spotlight",
  "ecosystemBrief",
  "alumniSpotlight",
  "editorial",
  "feature",
  "interview",
];

// Position of a section in the issue's running order; unknown sections sort
// last, matching the page dropping them into "More from this issue".
export function sectionRank(section?: string) {
  const i = ISSUE_SECTION_ORDER.indexOf(section as SectionValue);
  return i === -1 ? ISSUE_SECTION_ORDER.length : i;
}
