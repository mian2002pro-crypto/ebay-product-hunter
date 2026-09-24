const assert=require("node:assert/strict");
const { normalizeEbaySearch }=require("../lib/ebay-normalize.js");

const sample={itemSummaries:[{itemId:"v1|123|0",title:"Test Product",price:{value:"19.99",currency:"USD"},seller:{username:"seller1"},condition:"NEW",itemWebUrl:"https://www.ebay.com/itm/123"}],total:1};

const result=normalizeEbaySearch(sample);
assert.equal(result.total,1);
assert.equal(result.items[0].title,"Test Product");
assert.equal(result.items[0].price,19.99);
assert.equal(result.items[0].currency,"USD");
assert.equal(result.items[0].itemId,"v1|123|0");
console.log("eBay normalization tests passed");
