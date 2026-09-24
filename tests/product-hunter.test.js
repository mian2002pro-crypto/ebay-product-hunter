const assert=require("node:assert/strict");
const { toHunterRows }=require("../lib/product-hunter.js");

const result=toHunterRows({
  total:1,
  items:[{
    itemId:"v1|123|0",
    title:"Halloween Pumpkin Lights",
    price:24.99,
    currency:"USD",
    condition:"NEW",
    seller:"demo-seller",
    url:"https://www.ebay.com/itm/123",
    image:"https://i.ebayimg.com/example.jpg"
  }]
});

assert.equal(result.length,1);
assert.equal(result[0].title,"Halloween Pumpkin Lights");
assert.equal(result[0].price,24.99);
assert.equal(result[0].market,"US");
assert.equal(result[0].sold,null);
assert.equal(result[0].active,1);
console.log("product hunter mapping tests passed");
