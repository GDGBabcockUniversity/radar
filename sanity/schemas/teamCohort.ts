import { defineField, defineType } from "sanity";

// A team cohort = the RADAR team for one academic year (e.g. 2025/2026).
// Team membership is a yearly overlay on top of the permanent `author`
// identity: authors keep their bylines/profiles regardless of cohort, while
// each cohort lists who served that year and in what role (roles rotate).
// The current team is the cohort with the highest `startYear`.
export default defineType({
  name: "teamCohort",
  title: "Team Cohort",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Academic Year",
      type: "string",
      description: 'e.g. "2025/2026"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startYear",
      title: "Start Year",
      type: "number",
      description:
        "Starting calendar year, e.g. 2025. Orders cohorts — the newest is the current team.",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "members",
      title: "Members",
      type: "array",
      of: [
        {
          type: "object",
          name: "cohortMember",
          fields: [
            defineField({
              name: "author",
              title: "Person",
              type: "reference",
              to: [{ type: "author" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "role",
              title: "Role (this year)",
              type: "string",
              description: "e.g. Team Lead, Writer, Editor",
            }),
            defineField({
              name: "order",
              title: "Display Order",
              type: "number",
              description: "Lower numbers appear first.",
              initialValue: 0,
            }),
            defineField({
              name: "course",
              title: "Course (this year)",
              type: "string",
              description: "e.g. Computer Science. Frozen for this year.",
            }),
            defineField({
              name: "image",
              title: "Photo (this year)",
              type: "image",
              description:
                "Optional per-year photo. Falls back to the author's main photo.",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string", title: "Alternative Text" }],
            }),
            // Personality snapshot — frozen per year.
            defineField({
              name: "songObsession",
              title: "New Song Obsession",
              type: "string",
            }),
            defineField({
              name: "tabsCurrentlyOpen",
              title: "Tabs Currently Open",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "currentlyLearning",
              title: "What I'm Learning Right Now",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "unpopularOpinion",
              title: "Unpopular Dev Opinion / Hot Take",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "techPhilosophy",
              title: "Tech Philosophy",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: "author.name",
              subtitle: "role",
              media: "author.image",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "label", members: "members" },
    prepare({ title, members }) {
      const count = Array.isArray(members) ? members.length : 0;
      return {
        title: title || "Team Cohort",
        subtitle: `${count} member${count === 1 ? "" : "s"}`,
      };
    },
  },
  orderings: [
    {
      title: "Start Year (newest first)",
      name: "startYearDesc",
      by: [{ field: "startYear", direction: "desc" }],
    },
  ],
});
