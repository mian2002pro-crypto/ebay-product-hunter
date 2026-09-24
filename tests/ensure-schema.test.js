const assert=require("node:assert/strict");
const {ensureTrendSchema}=require("../lib/ensure-schema.js");

let received="";
const db={query:async sql=>{received=sql;return {rows:[]};}};
await ensureTrendSchema(db);
assert.match(received,/CREATE TABLE IF NOT EXISTS trend_snapshots/);
assert.match(received,/CREATE INDEX IF NOT EXISTS trend_snapshots_lookup_idx/);
console.log("schema initialization tests passed");
