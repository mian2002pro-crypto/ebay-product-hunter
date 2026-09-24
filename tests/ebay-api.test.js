const assert=require("node:assert/strict");
const { buildEbaySearchUrl, MARKETPLACES }=require("../lib/ebay-api.js");

const url=new URL(buildEbaySearchUrl({market:"US",q:"halloween lights",limit:25,minPrice:10,maxPrice:50}));
assert.equal(MARKETPLACES.US,"EBAY_US");
assert.equal(url.searchParams.get("q"),"halloween lights");
assert.equal(url.searchParams.get("limit"),"25");
assert.match(url.searchParams.get("filter"),/price:\[10\.\.50\]/);
assert.equal(url.searchParams.get("priceCurrency"),"USD");
console.log("eBay query builder tests passed");
