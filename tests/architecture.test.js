const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Hunter/Sourcer extension has Manifest V3 and eBay market coverage", () => {
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.json", "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.ok(manifest.permissions.includes("storage"));
  assert.ok(manifest.content_scripts?.[0]?.matches.includes("https://www.ebay.com/*"));
  assert.ok(manifest.content_scripts?.[0]?.matches.includes("https://www.ebay.co.uk/*"));
  assert.ok(manifest.host_permissions.includes("https://www.aliexpress.com/*"));
});

test("Windows Studio contains persistent prompt settings for both markets", () => {
  const settings = fs.readFileSync("studio-desktop/settings.js", "utf8");
  assert.match(settings, /US:/);
  assert.match(settings, /UK:/);
  assert.match(settings, /title:/);
  assert.match(settings, /description:/);
  assert.match(settings, /options:/);
  assert.match(settings, /image:/);
});