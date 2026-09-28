import test from "node:test";
import assert from "node:assert/strict";
import { LISTING_TABS } from "../lib/listing-generation.js";

test("generation bundle covers every Studio output type",()=> {
 assert.deepEqual(LISTING_TABS,["title","description","options","image"]);
});
