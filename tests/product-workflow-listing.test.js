import test from "node:test";
import assert from "node:assert/strict";
import { recordListingOutput } from "../lib/product-workflow.js";

test("partial listing output keeps product sourced", () => {
  const product = { status:"Sourced" };
  const result = recordListingOutput(product,"USA","title","Great Pet Brush");
  assert.equal(result.status,"Sourced");
  assert.equal(result.listingOutputs.USA.title,"Great Pet Brush");
});

test("complete listing output moves product to Ready", () => {
  let product = { status:"Sourced" };
  for (const kind of ["title","description","options","image"]) {
    product = recordListingOutput(product,"USA",kind,"generated");
  }
  assert.equal(product.status,"Ready");
});
