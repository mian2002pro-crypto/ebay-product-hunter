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

test("eBay Hunter extracts lazy-loaded product thumbnails", () => {
  const vm = require("node:vm");
  const source = fs.readFileSync("extension/content.js", "utf8");
  const nodes = {
    title: {textContent: "Test Product"},
    price: {textContent: "$19.99"},
    seller: {textContent: "Test Seller"},
    image: {getAttribute: (attr) => ({src: "", "data-src": "https://img.example/product.jpg"})[attr] || null},
    meta: {getAttribute: () => null}
  };
  const document = {
    querySelector(selector) {
      if (selector.includes("h1")) return nodes.title;
      if (selector.includes("price")) return nodes.price;
      if (selector.includes("seller")) return nodes.seller;
      if (selector.includes("meta")) return nodes.meta;
      if (selector.includes("img")) return nodes.image;
      return null;
    }
  };
  const messages = {};
  vm.runInNewContext(source, {
    document,
    location: {href: "https://www.ebay.com/itm/123?foo=bar", hostname: "www.ebay.com"},
    chrome: {runtime: {onMessage: {addListener: (handler) => { messages.handler = handler; }}}}
  });
  let response;
  messages.handler({type: "MIAN_EXTRACT_LISTING"}, {}, (value) => { response = value; });
  assert.equal(response.ok, true);
  assert.equal(response.listing.image, "https://img.example/product.jpg");
});


test("Sourcer UI provides direct supplier search and does not claim an unverified supplier price", () => {
  const popup = fs.readFileSync("extension/popup.html", "utf8");
  const script = fs.readFileSync("extension/popup.js", "utf8");
  assert.match(popup, /Miaan Sourcer/);
  assert.match(popup, /supplier-search/);
  assert.match(script, /aliexpress\.com\/w\/wholesale-/);
  assert.match(script, /price not verified/i);
});
