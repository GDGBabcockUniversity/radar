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
export const ISSUE_SECTION_ORDER: SectionValue[] = [
  "openingNote",
  "spotlight",
  "editorial",
  "interview",
  "feature",
  "ecosystemBrief",
  "alumniSpotlight",
];
