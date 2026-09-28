import test from "node:test";
import assert from "node:assert/strict";
import { buildGenerationContext, getMarketProfile } from "../shared/listing-config.js";

test("keeps USA and UK profiles independent", () => {
  const us = getMarketProfile("US");
  const uk = getMarketProfile("UK");
  assert.notEqual(us, uk);
  assert.equal(us.market, "US");
  assert.equal(uk.market, "UK");
});

test("generation context preserves supplied facts and never invents missing facts", () => {
  const result = buildGenerationContext("UK", {
    title: "Example Pet Brush",
    price: "12.99",
    url: "https://example.test/item"
  });
  assert.equal(result.market, "UK");
  assert.equal(result.product.title, "Example Pet Brush");
  assert.equal(result.product.price, "12.99");
  assert.match(result.rules.missingFacts, /Not Specified|omit/i);
  assert.ok(result.profile.prompts.title);
  assert.ok(result.profile.prompts.description);
  assert.ok(result.profile.prompts.options);
  assert.ok(result.profile.prompts.image);
});

test("UK profile includes the required eBay option fields", () => {
  const uk = getMarketProfile("UK");
  assert.match(uk.prompts.description, /Country of Origin: United Kingdom/);
  assert.match(uk.prompts.image, /1:1/);
  for (const field of ["Pattern", "Item Length", "Department", "Texture", "Features", "Number of Attachments", "Product Line", "Production Technique", "Production Style", "Set Includes"]) {
    assert.ok(uk.optionFields.includes(field), field);
  }
});
