import test from "node:test";
import assert from "node:assert/strict";
import { mergeWorkflowUpdate } from "../lib/product-workflow-store.js";

test("merges workflow updates without losing product facts", () => {
  const product={id:"1",title:"Pet Brush",price:10,status:"Sourced",listingOutputs:{USA:{}}};
  const updated=mergeWorkflowUpdate(product,{status:"Listing Generated",listingOutputs:{USA:{title:"Pet Brush"}}});
  assert.equal(updated.title,"Pet Brush");
  assert.equal(updated.price,10);
  assert.equal(updated.status,"Listing Generated");
  assert.equal(updated.listingOutputs.USA.title,"Pet Brush");
});
