import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { visitSigner, validArticleId } from "../app/lib/article-visit";
const signer = visitSigner("test-secret-with-at-least-32-characters");
test("visitor cookies persist and forged cookies are replaced", () => {
  const first = signer.visitor();
  assert.equal(signer.visitor(first.cookie).id, first.id);
  assert.notEqual(signer.visitor(first.cookie + "x").id, first.id);
});
test("visit tokens bind article and visitor, expire, and reject tampering", () => {
  const token = signer.issue("visitor", "article", randomUUID(), 1000);
  assert.ok(signer.validate(token, "visitor", "article", 11_000));
  assert.equal(signer.validate(token, "other", "article", 11_000), null);
  assert.equal(signer.validate(token, "visitor", "other", 11_000), null);
  assert.equal(
    signer.validate(token + "x", "visitor", "article", 11_000),
    null,
  );
  assert.equal(signer.validate(token, "visitor", "article", 86_402_000), null);
});
test("article identifiers exclude drafts and unsafe input", () => {
  assert.ok(validArticleId("abc-123"));
  for (const id of ["", "../etc", "drafts.abc", "x".repeat(129), "<script>"])
    assert.equal(validArticleId(id), false);
});

test("malformed Unicode signatures are rejected without throwing", () => {
  const first = signer.visitor();
  const forged =
    first.cookie.slice(0, first.cookie.lastIndexOf(".") + 1) + "é".repeat(64);
  assert.notEqual(signer.visitor(forged).id, first.id);
});
