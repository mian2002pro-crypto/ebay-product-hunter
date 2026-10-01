const test = require("node:test");
const assert = require("node:assert/strict");
const { LISTING_TABS } = require("../lib/listing-generation.js");

test("generation bundle covers every Studio output type",()=> {
 assert.deepEqual(LISTING_TABS,["title","description","options","image"]);
});
