const test=require("node:test");
const assert=require("node:assert/strict");
const {searchLocalMarket}=require("../lib/local-market-data.js");

test("local market search works without eBay credentials",()=>{
 const result=searchLocalMarket({market:"US",q:"pet",limit:10});
 assert.ok(result.items.length>0);
 assert.equal(result.items[0].market,"US");
});

test("local market search returns an empty set for unknown query",()=>{
 assert.equal(searchLocalMarket({market:"US",q:"zzzz-no-match"}).items.length,0);
});
