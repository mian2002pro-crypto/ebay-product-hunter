const assert=require("node:assert/strict");
const {buildSourcingQuery}=require("../lib/sourcing-query.js");

const url=new URL(buildSourcingQuery({q:"halloween pumpkin lights",market:"US",minCost:3,maxCost:12}));
assert.equal(url.searchParams.get("q"),"halloween pumpkin lights");
assert.equal(url.searchParams.get("market"),"US");
assert.equal(url.searchParams.get("minCost"),"3");
assert.equal(url.searchParams.get("maxCost"),"12");
console.log("sourcing query tests passed");
