import { defineField, defineType } from "sanity";

// A Series is a *show* — a standalone strand that runs on its own schedule,
// outside the monthly issue cycle (e.g. "Class of 2026 Spotlight"). Each weekly
// piece is an `episode` that references its series (one-to-many, reverse query).
export default defineType({
  name: "series",
  title: "Series",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Name of the series, e.g. 'Class of 2026 Spotlight'",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "A short description of what this series is about.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description: "Hero/promo image for the series. Aim for ~1200×630.",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alternative Text" }],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Active series are surfaced as currently running.",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "active",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first on the Series index.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      media: "coverImage",
    },
    prepare({ title, status, media }) {
      return {
        title,
        subtitle: status === "archived" ? "Archived" : "Active",
        media,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
