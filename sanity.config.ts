import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  name: "radar",
  title: "RADAR CMS",

  projectId,
  dataset,

  basePath: "/studio",

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },
});
