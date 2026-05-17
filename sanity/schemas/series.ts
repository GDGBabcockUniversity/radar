import { defineField, defineType } from "sanity";
import { PreviewUrlField } from "../components/PreviewUrlField";

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
      name: "group",
      title: "Series Group",
      type: "reference",
      to: [{ type: "seriesGroup" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "The full YouTube video URL (e.g., https://www.youtube.com/watch?v=...)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
        },
      ],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    }),
    defineField({
      name: "previewUrl",
      title: "Preview URL",
      type: "string",
      readOnly: true,
      components: {
        field: PreviewUrlField,
      },
      description: "Relative preview link based on the slug. Use this to copy the URL for sharing.",
    }),
    defineField({
      name: "body",
      title: "Write-up",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      group: "group.title",
    },
    prepare(selection) {
      const { author, group } = selection;
      return {
        ...selection,
        subtitle: `${group ? group + " - " : ""}${author ? "by " + author : ""}`,
      };
    },
  },
});
