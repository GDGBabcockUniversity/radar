import { defineField, defineType } from "sanity";

// Embedded object on `issue` — a short, byline-less list item.
// Signals are NOT documents and have no URL of their own.
export default defineType({
  name: "signalItem",
  title: "Signal",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      options: {
        list: [
          { title: "Win", value: "WIN" },
          { title: "Launch", value: "LAUNCH" },
          { title: "Watch", value: "WATCH" },
          { title: "Shift", value: "SHIFT" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "blurb",
      title: "Blurb",
      type: "text",
      rows: 3,
      description: "Roughly 50–100 words.",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
    }),
  ],
  preview: {
    select: {
      label: "label",
      headline: "headline",
    },
    prepare({ label, headline }) {
      return {
        title: headline,
        subtitle: label,
      };
    },
  },
});
