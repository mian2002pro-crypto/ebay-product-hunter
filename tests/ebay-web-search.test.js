const test = require("node:test");
const assert = require("node:assert/strict");
const { parseEbaySearchHtml } = require("../lib/ebay-web-search.js");

test("parses eBay web listing facts without an API", () => {
  const html = `
    <li class="s-item">
      <div class="s-item__title"><span>Pet Hair Remover Roller</span></div>
      <a class="s-item__link" href="https://www.ebay.com/itm/123">item</a>
      <span class="s-item__price">$14.99</span>
      <span class="s-item__seller-info-text">seller123</span>
      <img class="s-item__image-img" src="https://i.ebayimg.com/image.jpg">
    </li>`;
  const items = parseEbaySearchHtml(html, "US");
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Pet Hair Remover Roller");
  assert.equal(items[0].price, 14.99);
  assert.equal(items[0].currency, "USD");
  assert.equal(items[0].seller, "seller123");
  assert.match(items[0].url, /ebay\.com\/itm\/123/);
});
