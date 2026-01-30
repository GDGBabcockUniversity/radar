import { defineCliConfig } from "sanity/cli";
import { CREDENTIALS } from "./app/lib/constants";

export default defineCliConfig({
  api: {
    projectId: CREDENTIALS.sanity_project_id,
    dataset: CREDENTIALS.sanity_dataset,
  },
});
