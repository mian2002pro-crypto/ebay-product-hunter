const assert=require("node:assert/strict");
const {estimateEconomics,rankSupplier}=require("../lib/sourcing.js");

const e=estimateEconomics({sellPrice:29.99,supplierCost:8,shipping:2,feeRate:.13});
assert.equal(e.fee,3.8987);
assert.equal(e.profit,16.0913);
assert.equal(Math.round(e.margin*100),54);

const ranked=rankSupplier({sellPrice:29.99,supplierCost:8,shipping:2,feeRate:.13,processingDays:5,rating:4.8});
assert.ok(ranked.score>=0&&ranked.score<=100);
assert.ok(ranked.profit>0);
console.log("sourcing economics tests passed");
