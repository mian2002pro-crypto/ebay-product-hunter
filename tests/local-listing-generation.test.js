const test = require("node:test");
const assert = require("node:assert/strict");
const { localGenerate } = require("../lib/local-listing-generation.js");

test("local Listing Studio generates every supported output type without an API", () => {
  const product = { title: "Pet Brush", price: 9.99, currency: "GBP" };
  for (const kind of ["title", "description", "options", "image"]) {
    const output = localGenerate({ market: "UK", kind, product });
    assert.ok(output);
  }
});

test("local description keeps unsupported facts explicit", () => {
  const output = localGenerate({ market: "UK", kind: "description", product: { title: "Pet Brush" } });
  assert.match(output, /Country of Origin: United Kingdom/);
  assert.match(output, /Size: Not Specified/);
});
