import { defineField, defineType } from "sanity";
import { PreviewUrlField } from "../components/PreviewUrlField";
import { SECTIONS } from "../../app/lib/sections";

// The authored unit. Each article references exactly one issue (one-to-many)
// and can have many authors (many-to-many via the `authors` reference array).
// Its globally-unique slug is what makes it independently shareable.
export default defineType({
  name: "article",
  title: "Article",
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
      description: "Globally unique — this is the shareable URL (/articles/...).",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authors",
      title: "Authors",
      type: "array",
      description: "One or more authors. The full byline links to each profile.",
      of: [{ type: "reference", to: { type: "author" } }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "issue",
      title: "Issue",
      type: "reference",
      to: { type: "issue" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "section",
      title: "Section",
      type: "string",
      options: {
        list: SECTIONS.map((s) => ({ title: s.title, value: s.value })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description:
        "Doubles as the article's og:image. Aim for ~1200×630 so it renders cleanly on WhatsApp/X/LinkedIn.",
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
        "~160 chars plain text. OG/link-preview description AND the archive/issue card text.",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Manual ordering when several articles share a section (lower first).",
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
      section: "section",
      author0: "authors.0.name",
      issueNumber: "issue.issueNumber",
      media: "coverImage",
    },
    prepare({ title, section, author0, issueNumber, media }) {
      const sectionTitle =
        SECTIONS.find((s) => s.value === section)?.title ?? section;
      const bits = [
        issueNumber ? `#${issueNumber}` : null,
        sectionTitle,
        author0 ? `by ${author0}` : null,
      ].filter(Boolean);
      return { title, subtitle: bits.join(" · "), media };
    },
  },
  orderings: [
    {
      title: "Section, then order",
      name: "sectionOrder",
      by: [
        { field: "section", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Published (newest first)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
