const test = require("node:test");
const assert = require("node:assert/strict");
const { searchSuppliers } = require("../lib/supplier-search.js");

test("supplier search uses the API-free local provider and returns normalized results", async () => {
  const result = await searchSuppliers({
    provider: "local",
    q: "pet hair remover",
    market: "US"
  });

  assert.equal(result.provider, "local");
  assert.ok(result.total >= 1);
  assert.equal(result.items[0].market, "US");
  assert.ok(result.items[0].title);
  assert.ok(result.items[0].price > 0);
});

test("unknown supplier provider fails clearly", async () => {
  await assert.rejects(
    () => searchSuppliers({ provider: "unknown", q: "x" }),
    /Unsupported supplier provider/
  );
});
