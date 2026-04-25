import { defineField, defineType } from "sanity";

export default defineType({
  name: "teamMember",
  title: "Team Member",
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
    }),
    defineField({
      name: "role",
      title: "Team Role",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., RADAR Team Lead, Writer, Editor",
    }),
    defineField({
      name: "course",
      title: "Course",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., Computer Science, Software Engineering",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
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
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({
          name: "email",
          title: "Email",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["mailto"],
            }),
        }),
        defineField({
          name: "medium",
          title: "Medium",
          type: "url",
        }),
        defineField({
          name: "substack",
          title: "Substack",
          type: "url",
        }),
        defineField({
          name: "x",
          title: "X (Twitter)",
          type: "url",
        }),
        defineField({
          name: "instagram",
          title: "Instagram",
          type: "url",
        }),
        defineField({
          name: "snapchat",
          title: "Snapchat",
          type: "url",
        }),
      ],
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
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
