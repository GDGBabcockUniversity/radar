import { defineField, defineType } from "sanity";
import { PreviewUrlField } from "../components/PreviewUrlField";

// The container. An issue holds NO articles directly — each article references
// its issue (one-to-many) and the issue page fetches them by reverse query.
// Signals and opportunities ARE embedded here (they are byline-less list items).
export default defineType({
  name: "issue",
  title: "Issue",
  type: "document",
  fields: [
    defineField({
      name: "issueNumber",
      title: "Issue Number",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "The first spotlight of the ecosystem"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Use the zero-padded issue number, e.g. 006, so the URL is /issues/006.",
      options: {
        source: (doc) => {
          const n = (doc as { issueNumber?: number }).issueNumber;
          return n ? String(n).padStart(3, "0") : "";
        },
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description:
        "Used as the og:image for the issue page. Aim for ~1200×630.",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alternative Text" },
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "string",
      description:
        "~160 chars. Short summary; OG/link-preview description and archive card text.",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "signals",
      title: "Signals This Month",
      type: "array",
      of: [{ type: "signalItem" }],
    }),
    defineField({
      name: "opportunities",
      title: "Opportunity Drop",
      type: "array",
      of: [{ type: "opportunityItem" }],
    }),
    defineField({
      name: "editorial",
      title: "Editorial",
      type: "editorial",
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
      issueNumber: "issueNumber",
      media: "coverImage",
    },
    prepare({ title, issueNumber, media }) {
      return {
        title: `#${issueNumber ?? "?"} — ${title}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Issue Number (newest first)",
      name: "issueNumberDesc",
      by: [{ field: "issueNumber", direction: "desc" }],
    },
  ],
});
