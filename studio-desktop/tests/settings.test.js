const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Studio has separate USA and UK prompt profiles", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "settings.js"), "utf8");
  assert.match(source, /US:/);
  assert.match(source, /UK:/);
  assert.match(source, /title:/);
  assert.match(source, /description:/);
  assert.match(source, /options:/);
  assert.match(source, /image:/);
});