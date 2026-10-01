const test=require("node:test"); const assert=require("node:assert/strict"); const {searchLocalSupplier}=require("../lib/local-supplier-data.js");
test("local supplier search works without CJ credentials",async()=>{const r=await searchLocalSupplier({q:"pet",market:"UK"});assert.ok(r.items.length>0);assert.equal(r.provider,"local");assert.equal(r.items[0].market,"UK");});
