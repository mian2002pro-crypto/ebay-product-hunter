const test = require("node:test");
const assert = require("node:assert/strict");
const { buildGenerationRequest } = require("../lib/listing-generation.js");

test("builds a server-side generation request from market prompt and product facts", () => {
  const request = buildGenerationRequest({
    market: "UK",
    kind: "description",
    prompt: "Use supplied facts only.",
    product: { title: "Pet Brush", price: 9.99 }
  });
  assert.equal(request.kind, "description");
  assert.match(request.user, /Pet Brush/);
  assert.match(request.system, /supplied facts only/i);
  assert.doesNotMatch(JSON.stringify(request), /api[_-]?key/i);
});
