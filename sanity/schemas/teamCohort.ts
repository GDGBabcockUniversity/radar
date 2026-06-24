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
