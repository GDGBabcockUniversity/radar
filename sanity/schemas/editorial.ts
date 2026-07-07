import { defineField, defineType } from "sanity";

// Embedded object on `issue` — the editorial note shown on the home page.
// A single opening note (quote + short description) plus the standing mission
// statement. Not a document; has no URL of its own.
export default defineType({
  name: "editorial",
  title: "Editorial",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "string",
      description: "The opening editorial line, e.g. a short pull-quote.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "note",
      title: "Note",
      type: "text",
      rows: 3,
      description: "A sentence or two introducing this issue's editorial.",
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "text",
      rows: 3,
      description: "The standing mission statement shown in the editorial card.",
    }),
  ],
  preview: {
    select: {
      quote: "quote",
    },
    prepare({ quote }) {
      return {
        title: quote || "Editorial",
        subtitle: "Editorial note",
      };
    },
  },
});
