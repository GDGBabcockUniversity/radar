import { defineField, defineType } from "sanity";

// Embedded object on `issue` — the Opportunity Drop list.
// Opportunities are NOT documents and have no URL of their own.
export default defineType({
  name: "opportunityItem",
  title: "Opportunity",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Internship", value: "internship" },
          { title: "Fellowship", value: "fellowship" },
          { title: "Hackathon", value: "hackathon" },
          { title: "Grant", value: "grant" },
          { title: "Competition", value: "competition" },
          { title: "Ambassador", value: "ambassador" },
          { title: "Scholarship", value: "scholarship" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "deadline",
      title: "Deadline",
      type: "date",
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      deadline: "deadline",
    },
    prepare({ title, type, deadline }) {
      return {
        title,
        subtitle: [type, deadline].filter(Boolean).join(" · "),
      };
    },
  },
});
