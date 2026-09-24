const assert=require("node:assert");
function sellThrough(sold,active){return active+sold===0?0:sold/(sold+active)*100}
function profit(price,cost,feeRate=.13,shipping=0){return price-(price*feeRate)-cost-shipping}
assert.equal(Math.round(sellThrough(80,20)),80);
assert.equal(profit(30,10,0.1,2),15);
console.log("Product analytics tests passed");
