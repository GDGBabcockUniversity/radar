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
      title: "Role",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., RADAR Team Lead, Writer, Editor",
    }),
    defineField({
      name: "department",
      title: "Department",
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
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      description: "Optional personal quote or tagline",
    }),
    defineField({
      name: "songObsession",
      title: "Song Obsession",
      type: "string",
      description: "Current favorite song",
    }),
    defineField({
      name: "favoriteBook",
      title: "Favorite Book",
      type: "string",
    }),
    defineField({
      name: "favoriteColor",
      title: "Favorite Color",
      type: "string",
    }),
    defineField({
      name: "colorMeaning",
      title: "What It Means To You",
      type: "text",
      rows: 3,
      description: "What your favorite color means to you",
    }),
    defineField({
      name: "howIManagePressure",
      title: "How I Manage School Pressure",
      type: "text",
      rows: 3,
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
