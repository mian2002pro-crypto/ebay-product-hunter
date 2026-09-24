const assert=require("node:assert/strict");
const {saveTrendSnapshot,getPreviousTrendSnapshot}=require("../lib/trend-store.js");

const calls=[];
const db={
  query:async(text,params)=>{calls.push({text,params});return {rows:text.includes("SELECT")?[{term:"pumpkin",listings:10,avg_price:20,season:"Halloween"}]:[]};}
};

const saved=await saveTrendSnapshot(db,{market:"US",query:"pumpkin",terms:[
  {term:"pumpkin",listings:15,avgPrice:22,season:"Halloween"}
]});
assert.equal(saved,1);
assert.equal(calls[0].params[0],"US");
assert.equal(calls[0].params[1],"pumpkin");

const previous=await getPreviousTrendSnapshot(db,{market:"US",query:"pumpkin"});
assert.equal(previous.length,1);
assert.equal(previous[0].term,"pumpkin");
assert.equal(previous[0].listings,10);
assert.equal(previous[0].avgPrice,20);
console.log("trend store tests passed");
