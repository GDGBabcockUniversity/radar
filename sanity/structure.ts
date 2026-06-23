import type { StructureResolver } from "sanity/structure";

const API_VERSION = "2024-01-01";

// Custom Studio desk: groups the publication model so editors see the
// relationships. Opening an Issue reveals its Articles; opening a Series
// reveals its Episodes. Legacy/shared types are tucked into a folder.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("RADAR")
    .items([
      // Issues -> the articles that reference each issue
      S.listItem()
        .title("Issues")
        .schemaType("issue")
        .child(
          S.documentTypeList("issue")
            .title("Issues")
            .child((issueId) =>
              S.list()
                .title("Issue")
                .items([
                  S.listItem()
                    .title("Edit issue")
                    .child(
                      S.document().documentId(issueId).schemaType("issue"),
                    ),
                  S.listItem()
                    .title("Articles in this issue")
                    .child(
                      S.documentList()
                        .title("Articles")
                        .apiVersion(API_VERSION)
                        .filter('_type == "article" && references($issueId)')
                        .params({ issueId }),
                    ),
                ]),
            ),
        ),
      S.documentTypeListItem("article").title("Articles"),

      S.divider(),

      // Series -> the episodes that reference each series
      S.listItem()
        .title("Series")
        .schemaType("series")
        .child(
          S.documentTypeList("series")
            .title("Series")
            .child((seriesId) =>
              S.list()
                .title("Series")
                .items([
                  S.listItem()
                    .title("Edit series")
                    .child(
                      S.document().documentId(seriesId).schemaType("series"),
                    ),
                  S.listItem()
                    .title("Episodes in this series")
                    .child(
                      S.documentList()
                        .title("Episodes")
                        .apiVersion(API_VERSION)
                        .filter('_type == "episode" && references($seriesId)')
                        .params({ seriesId }),
                    ),
                ]),
            ),
        ),
      S.documentTypeListItem("episode").title("Episodes"),

      S.divider(),

      S.documentTypeListItem("author").title("Authors"),

      S.divider(),

      // Legacy / shared types, kept reachable but out of the main flow.
      S.listItem()
        .title("Legacy & shared")
        .child(
          S.list()
            .title("Legacy & shared")
            .items([
              S.documentTypeListItem("post").title("Posts (legacy)"),
              S.documentTypeListItem("teamMember").title("Team Members (legacy)"),
              S.documentTypeListItem("category").title("Categories"),
            ]),
        ),
    ]);
