import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "../lib/password";

describe("password hashing", () => {
  it("verifies the password used to create a hash", async () => {
    const hash = await hashPassword("correct horse battery staple");

    assert.equal(await verifyPassword("correct horse battery staple", hash), true);
  });

  it("rejects a different password", async () => {
    const hash = await hashPassword("correct horse battery staple");

    assert.equal(await verifyPassword("wrong password", hash), false);
  });

  it("rejects malformed password hashes", async () => {
    assert.equal(await verifyPassword("anything", "not-a-valid-hash"), false);
    assert.equal(await verifyPassword("anything", "salt:"), false);
  });
});
