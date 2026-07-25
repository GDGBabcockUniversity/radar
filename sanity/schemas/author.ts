import { defineField, defineType } from "sanity";

// The single identity for everyone on RADAR. An author both bylines articles
// AND appears on the /team page; their profile (/team/[slug]) is a reverse
// query of every article that references them. The personality fields were
// consolidated here from the deprecated `teamMember` type.
export default defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alternative Text" },
      ],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "role",
      title: "Team Role",
      type: "string",
      description:
        "Legacy default. For team display, set the role per year on the Team Cohort.",
    }),
    defineField({
      name: "course",
      title: "Course",
      type: "string",
      description:
        "Legacy default. For team display, set the course per year on the Team Cohort.",
    }),
    defineField({
      name: "platformUserId",
      title: "Platform Profile ID",
      type: "string",
      description:
        "Optional. The author's GDG platform ID (a UUID, from the admin user list). Links their bylines to their profile on gdgbabcock.com so reads on their work show up as writer stats. Deliberately the ID and not an email — this dataset is public.",
      validation: (Rule) =>
        Rule.regex(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          { name: "UUID" }
        ).error("Must be a full platform UUID, e.g. 3f2a1c8e-...."),
    }),
    defineField({
      name: "socials",
      title: "Socials",
      type: "array",
      description: "Optional list of labelled links (e.g. X, Medium, Email).",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) =>
                Rule.uri({ scheme: ["http", "https", "mailto"] }).required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
    }),
    // --- Personality fields (legacy default; the live snapshot is now frozen
    // per year on each Team Cohort membership, falling back to these). ---
    defineField({
      name: "songObsession",
      title: "New Song Obsession",
      type: "string",
      description: "The song you currently have on repeat",
    }),
    defineField({
      name: "tabsCurrentlyOpen",
      title: "Tabs Currently Open",
      type: "text",
      rows: 2,
      description: "What tabs do you currently have open in your browser?",
    }),
    defineField({
      name: "currentlyLearning",
      title: "What I'm Learning Right Now",
      type: "text",
      rows: 3,
      description: "What are you actively learning or studying at the moment?",
    }),
    defineField({
      name: "unpopularOpinion",
      title: "Unpopular Dev Opinion / Hot Take",
      type: "text",
      rows: 3,
      description: "Your most controversial tech or dev opinion",
    }),
    defineField({
      name: "techPhilosophy",
      title: "Tech Philosophy",
      type: "text",
      rows: 3,
      description: "Your personal philosophy around technology and building",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first on the team page",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "image",
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
