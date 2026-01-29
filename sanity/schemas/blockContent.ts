import { defineType, defineArrayMember } from "sanity";

export default defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      title: "Block",
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
        },
        {
          name: "caption",
          type: "string",
          title: "Caption",
        },
      ],
    }),
    defineArrayMember({
      name: "code",
      title: "Code Block",
      type: "object",
      fields: [
        {
          name: "language",
          title: "Language",
          type: "string",
          options: {
            list: [
              { title: "JavaScript", value: "javascript" },
              { title: "TypeScript", value: "typescript" },
              { title: "Python", value: "python" },
              { title: "HTML", value: "html" },
              { title: "CSS", value: "css" },
              { title: "Bash", value: "bash" },
              { title: "JSON", value: "json" },
            ],
          },
        },
        {
          name: "code",
          title: "Code",
          type: "text",
        },
      ],
    }),
    defineArrayMember({
      name: "divider",
      title: "Divider",
      type: "object",
      fields: [
        {
          name: "style",
          title: "Style",
          type: "string",
          options: {
            list: [
              { title: "Simple Line", value: "line" },
              { title: "Dotted", value: "dotted" },
              { title: "Spaced", value: "spaced" },
            ],
          },
          initialValue: "line",
        },
      ],
      preview: {
        prepare() {
          return {
            title: "─────────────── Divider ───────────────",
          };
        },
      },
    }),
    defineArrayMember({
      name: "crossword",
      title: "Crossword Puzzle",
      type: "object",
      fields: [
        {
          name: "puzzleId",
          title: "Puzzle ID",
          type: "string",
          description: "Unique identifier for the crossword puzzle",
        },
      ],
      preview: {
        select: {
          puzzleId: "puzzleId",
        },
        prepare({ puzzleId }) {
          return {
            title: `🧩 Crossword Puzzle${puzzleId ? `: ${puzzleId}` : ""}`,
          };
        },
      },
    }),
  ],
});
