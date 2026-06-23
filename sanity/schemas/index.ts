import blockContent from "./blockContent";
import category from "./category";
import post from "./post";
import author from "./author";
import teamMember from "./teamMember";
import seriesGroup from "./seriesGroup";
import series from "./series";
import issue from "./issue";
import article from "./article";
import signalItem from "./signalItem";
import opportunityItem from "./opportunityItem";

export const schemaTypes = [
  // New publication model
  issue,
  article,
  author,
  signalItem,
  opportunityItem,
  // Shared
  blockContent,
  category,
  // Legacy newsletter model (kept; do not migrate existing content)
  post,
  // Class of 2026 weekly spotlight
  seriesGroup,
  series,
  // Deprecated — retained so existing docs remain accessible; migrate to author
  teamMember,
];
