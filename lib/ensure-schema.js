const fs=require("node:fs");
const path=require("node:path");
const {getTrendDb}=require("./trend-db.js");

async function ensureTrendSchema(db=getTrendDb()){
  const schemaPath=path.join(process.cwd(),"db","schema.sql");
  const schema=fs.readFileSync(schemaPath,"utf8");
  await db.query(schema);
  return true;
}

module.exports={ensureTrendSchema};
