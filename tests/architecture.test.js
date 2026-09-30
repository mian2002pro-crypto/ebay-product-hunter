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

test("eBay Hunter extracts only the currently selected eBay picture", () => {
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
    },
    querySelectorAll(selector) {
      if (selector.includes("video")) return [];
      return [];
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
  assert.deepEqual(Array.from(response.listing.images), ["https://img.example/product.jpg"]);
});


test("Sourcer UI provides direct supplier search and does not claim an unverified supplier price", () => {
  const popup = fs.readFileSync("extension/popup.html", "utf8");
  const script = fs.readFileSync("extension/popup.js", "utf8");
  assert.match(popup, /Miaan Sourcer/);
  assert.match(popup, /supplier-search/);
  assert.match(script, /aliexpress\.com\/w\/wholesale-/);
  assert.match(script, /price not verified/i);
});


test("Hunter supports product media downloads", () => {
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.json", "utf8"));
  const background = fs.readFileSync("extension/background.js", "utf8");
  const content = fs.readFileSync("extension/content.js", "utf8");
  const popup = fs.readFileSync("extension/popup.html", "utf8");
  const script = fs.readFileSync("extension/popup.js", "utf8");
  assert.ok(manifest.permissions.includes("downloads"));
  assert.match(content, /images/);
  assert.match(content, /video/);
  assert.match(background, /chrome\.downloads\.download/);
  assert.match(background, /\.downloads/);
  assert.match(script, /MIAN_DOWNLOAD_MEDIA/);
  assert.match(script, /MIAN_GET_SELECTED_IMAGE/);
  assert.match(popup, /Download Selected Picture/);
  assert.match(popup, /Download Video/);
});


test("AliExpress Hunter loads a product extractor and keeps product images separate from recommendations", () => {
  const vm = require("node:vm");
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.json", "utf8"));
  const aliScript = fs.readFileSync("extension/aliexpress-content.js", "utf8");
  const aliContentScript = manifest.content_scripts.find((item) => item.js?.includes("aliexpress-content.js"));
  assert.ok(aliContentScript?.matches.includes("https://www.aliexpress.com/*"));
  assert.match(aliScript, /all-product-gallery-and-variation-images/);
  assert.match(aliScript, /recommend|related|similar/i);

  const makeImage = (url, className) => ({
    currentSrc: url,
    getAttribute: (name) => name === "src" ? url : null,
    getBoundingClientRect: () => ({width: 500, height: 500}),
    className,
    parentElement: null
  });
  const productA = makeImage("https://ae01.alicdn.com/kf/product-a.jpg", "product-gallery-image");
  const productB = makeImage("https://ae01.alicdn.com/kf/variation-b.jpg", "sku-variation-image");
  const related = makeImage("https://ae01.alicdn.com/kf/related.jpg", "recommend-product-image");

  const root = {
    querySelectorAll(selector) {
      if (selector === "img") return [productA, productB, related];
      if (selector.includes("price")) return [];
      return [];
    }
  };
  const document = {
    images: [productA, productB, related],
    querySelector(selector) {
      if (selector === "main") return root;
      if (selector === "h1") return {textContent: "Ali Product Test"};
      return null;
    }
  };
  const messages = {};
  vm.runInNewContext(aliScript, {
    document,
    location: {href: "https://www.aliexpress.com/item/1000001.html?spm=test"},
    chrome: {runtime: {onMessage: {addListener: (handler) => { messages.handler = handler; }}}}
  });

  let response;
  messages.handler({type: "MIAN_EXTRACT_ALI_PRODUCT"}, {}, (value) => { response = value; });
  assert.equal(response.ok, true);
  assert.deepEqual(Array.from(response.product.images), [
    "https://ae01.alicdn.com/kf/product-a.jpg",
    "https://ae01.alicdn.com/kf/variation-b.jpg"
  ]);
});


test("AliExpress capture keeps product picture and video downloads enabled independently of eBay selected-picture mode", () => {
  const popup = fs.readFileSync("extension/popup.js", "utf8");
  const ali = fs.readFileSync("extension/aliexpress-content.js", "utf8");
  assert.match(popup, /source === "AliExpress"/);
  assert.match(popup, /Download All Product Pictures/);
  assert.match(popup, /current\.images \|\| \[\]/);
  assert.match(popup, /current\?\.videos \|\| \[\]/);
  assert.match(popup, /MIAN_EXTRACT_ALI_PRODUCT/);
  assert.match(ali, /video, video source/);
  assert.match(ali, /og:video/);
  assert.match(ali, /videos,/);
});


test("AliExpress media downloads work directly without capture or sourcing first", () => {
  const popup = fs.readFileSync("extension/popup.html", "utf8");
  const script = fs.readFileSync("extension/popup.js", "utf8");
  assert.doesNotMatch(popup, /id="download-pictures" disabled/);
  assert.doesNotMatch(popup, /id="download-video" disabled/);
  assert.match(script, /prepareDirectMediaProduct/);
  assert.match(script, /MIAN_EXTRACT_ALI_PRODUCT/);
  assert.match(script, /MIAN_DOWNLOAD_MEDIA/);
  assert.match(script, /Download All Product Pictures/);
  assert.match(script, /Download Product Video/);
});

test("Direct media workflow never saves or sources the product", () => {
  const script = fs.readFileSync("extension/popup.js", "utf8");
  const start = script.indexOf("async function prepareDirectMediaProduct");
  const end = script.indexOf("downloadPictures.addEventListener", start);
  const directSection = script.slice(start, end);
  assert.ok(directSection.indexOf("MIAN_SAVE_PRODUCT") === -1);
  assert.ok(directSection.indexOf("openAliExpress") === -1);
});
