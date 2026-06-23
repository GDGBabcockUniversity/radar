import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import { CREDENTIALS } from "./app/lib/constants";

export default defineConfig({
  name: "radar",
  title: "RADAR CMS",

  projectId: CREDENTIALS.sanity_project_id,
  dataset: CREDENTIALS.sanity_dataset,

  basePath: "/studio",

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },
});
