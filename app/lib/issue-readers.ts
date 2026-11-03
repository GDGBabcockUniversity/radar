// shortcut: HyperLogLog is approximate (~0.8% error at large counts), switch to
// a Postgres (issue_id, reader) table if exact counts are ever needed.
export const issueReadersKey = (issueId: string) =>
  `radar:issue-readers:${issueId}`;
