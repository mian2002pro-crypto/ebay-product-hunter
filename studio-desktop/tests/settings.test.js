import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Studio has separate USA and UK prompt profiles",()=>{
  const source=fs.readFileSync(path.join(process.cwd(),"settings.js"),"utf8");
  assert.match(source,/US/); assert.match(source,/UK/);
  assert.match(source,/title/); assert.match(source,/description/); assert.match(source,/options/); assert.match(source,/image/);
});