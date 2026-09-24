const test = require("node:test");
const assert = require("node:assert/strict");
const { buildCjProductSearchUrl, normalizeCjProducts } = require("../lib/cj-api.js");

test("buildCjProductSearchUrl maps marketplace and price filters", () => {
  const url = buildCjProductSearchUrl({
    q: "pet hair remover",
    market: "US",
    minCost: 2,
    maxCost: 15,
    page: 2,
    size: 20
  });
  assert.match(url, /keyWord=pet+hair+remover/);
  assert.match(url, /countryCode=US/);
  assert.match(url, /startSellPrice=2/);
  assert.match(url, /endSellPrice=15/);
  assert.match(url, /page=2/);
  assert.match(url, /size=20/);
});

test("normalizeCjProducts returns stable supplier records", () => {
  const result = normalizeCjProducts({
    code: 200,
    result: true,
    data: {
      totalRecords: 1,
      content: [{
        pid: "p1",
        productNameEn: "Pet Hair Remover",
        bigImage: "https://example.com/p.jpg",
        sellPrice: "3.20",
        categoryName: "Pets > Grooming",
        productSku: "SKU1"
      }]
    }
  });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].id, "p1");
  assert.equal(result.items[0].title, "Pet Hair Remover");
  assert.equal(result.items[0].price, 3.2);
  assert.equal(result.items[0].currency, "USD");
  assert.equal(result.items[0].source, "CJdropshipping");
});
