const assert=require("node:assert/strict");
const {getTrendDb}=require("../lib/trend-db.js");

const original=process.env.DATABASE_URL;
delete process.env.DATABASE_URL;
assert.throws(()=>getTrendDb(),/DATABASE_URL/);
if(original!==undefined) process.env.DATABASE_URL=original;
console.log("trend db tests passed");
