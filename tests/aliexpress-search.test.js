const test = require("node:test");
const assert = require("node:assert/strict");
const { buildAliExpressSearchUrl, searchAliExpress } = require("../lib/aliexpress-search.js");

test("builds a direct AliExpress web search URL without an API", () => {
  const url = buildAliExpressSearchUrl("Pet Hair Remover Roller");
  assert.equal(url, "https://www.aliexpress.com/w/wholesale-pet-hair-remover-roller.html");
});

test("AliExpress sourcing never fabricates an exact supplier price", () => {
  const result = searchAliExpress({ q: "Pet Hair Remover Roller", market: "UK" });
  assert.equal(result.provider, "aliexpress-web");
  assert.equal(result.items[0].market, "UK");
  assert.equal(result.items[0].price, null);
  assert.match(result.items[0].url, /aliexpress\.com\/w\/wholesale-/);
});
