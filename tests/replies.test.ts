import { test } from "node:test";
import assert from "node:assert/strict";
import { validCommentId, parseReplyBody } from "../app/lib/reply";

test("reply body validates and trims content without accepting empty or oversized bodies", () => {
  assert.equal(parseReplyBody({ body: "  hello  " }), "hello");
  for (const input of [
    null,
    {},
    { body: 42 },
    { body: "   " },
    { body: "x".repeat(501) },
  ])
    assert.equal(parseReplyBody(input), null);
});
test("reply and parent identifiers must be UUIDs", () => {
  assert.equal(validCommentId("a83fe557-977f-4de4-9d45-9878aab37aba"), true);
  for (const id of ["", "not-a-uuid", "../comment", "x".repeat(36)])
    assert.equal(validCommentId(id), false);
});
