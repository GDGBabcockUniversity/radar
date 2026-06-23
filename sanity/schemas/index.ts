import blockContent from "./blockContent";
import category from "./category";
import post from "./post";
import author from "./author";
import teamMember from "./teamMember";
import series from "./series";
import episode from "./episode";
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
  // Series: standalone shows that run on their own schedule (e.g. weekly),
  // each made up of episodes — independent of the monthly issue cycle.
  series,
  episode,
  // Deprecated — retained so existing docs remain accessible; migrate to author
  teamMember,
];
