import test from "node:test";
import assert from "node:assert/strict";
import { WORKFLOW_STATES, advanceWorkflow } from "../lib/product-workflow.js";

test("workflow has the four listing stages", () => {
  assert.deepEqual(WORKFLOW_STATES, ["Hunted","Sourced","Listing Generated","Ready"]);
});

test("workflow advances one stage at a time", () => {
  assert.equal(advanceWorkflow("Hunted"), "Sourced");
  assert.equal(advanceWorkflow("Sourced"), "Listing Generated");
  assert.equal(advanceWorkflow("Listing Generated"), "Ready");
  assert.equal(advanceWorkflow("Ready"), "Ready");
});
