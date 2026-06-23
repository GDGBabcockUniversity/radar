import { defineField, defineType } from "sanity";
import { PreviewUrlField } from "../components/PreviewUrlField";

// An Episode is one weekly piece within a Series: a short video + write-up.
// It references exactly one series and carries its own publish date so a series
// can run on any cadence (weekly to start) independent of the monthly issues.
export default defineType({
  name: "episode",
  title: "Episode",
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
      description: "Shareable URL segment (/series/<series>/<episode>).",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "series",
      title: "Series",
      type: "reference",
      to: [{ type: "series" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "episodeNumber",
      title: "Episode Number",
      type: "number",
      description: "Manual ordering within the series (lower first).",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description:
        "The full YouTube video URL (e.g., https://www.youtube.com/watch?v=...)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description:
        "Card + og:image. Falls back to the YouTube thumbnail if omitted.",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alternative Text" }],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "string",
      description:
        "~160 chars. Card text and OG/link-preview description.",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Write-up",
      type: "blockContent",
    }),
    defineField({
      name: "previewUrl",
      title: "Preview URL",
      type: "string",
      readOnly: true,
      components: {
        field: PreviewUrlField,
      },
      description:
        "Relative preview link based on the slug. Use this to copy the URL for sharing.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage",
      series: "series.title",
      episodeNumber: "episodeNumber",
    },
    prepare({ title, author, media, series, episodeNumber }) {
      const bits = [
        series || null,
        episodeNumber ? `Ep. ${episodeNumber}` : null,
        author ? `by ${author}` : null,
      ].filter(Boolean);
      return { title, subtitle: bits.join(" · "), media };
    },
  },
  orderings: [
    {
      title: "Episode Number",
      name: "episodeAsc",
      by: [{ field: "episodeNumber", direction: "asc" }],
    },
    {
      title: "Published (newest first)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
