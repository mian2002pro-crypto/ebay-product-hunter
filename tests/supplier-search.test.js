const test = require("node:test");
const assert = require("node:assert/strict");
const { searchSuppliers } = require("../lib/supplier-search.js");

test("supplier search delegates to CJ provider and returns normalized results", async () => {
  const fake = async () => ({
    total: 1,
    items: [{ id: "p1", title: "Pet Hair Remover", price: 3.2, currency: "USD", source: "CJdropshipping" }]
  });
  const result = await searchSuppliers({ provider: "cj", q: "pet hair remover", fetchImpl: fake });
  assert.equal(result.provider, "cj");
  assert.equal(result.total, 1);
  assert.equal(result.items[0].source, "CJdropshipping");
});

test("unknown supplier provider fails clearly", async () => {
  await assert.rejects(() => searchSuppliers({ provider: "unknown", q: "x" }), /Unsupported supplier provider/);
});
