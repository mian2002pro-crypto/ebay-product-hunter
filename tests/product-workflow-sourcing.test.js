import test from "node:test";
import assert from "node:assert/strict";
import { markSourced } from "../lib/product-workflow.js";

test("supplier match marks product sourced and preserves supplier facts", () => {
  const product = { id:"1", title:"Pet Brush", status:"Hunted" };
  const supplier = { id:"cj-1", title:"Pet Grooming Brush", cost:3.5 };
  const result = markSourced(product, supplier);
  assert.equal(result.status, "Sourced");
  assert.deepEqual(result.supplier, supplier);
});
