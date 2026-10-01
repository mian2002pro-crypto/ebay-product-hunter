const MARKET_HOST = {
  US: "www.ebay.com",
  UK: "www.ebay.co.uk",
  CA: "www.ebay.ca",
  AU: "www.ebay.com.au",
  DE: "www.ebay.de",
  FR: "www.ebay.fr",
  IT: "www.ebay.it",
  ES: "www.ebay.es"
};

const MARKET_CURRENCY = {
  US: "USD", UK: "GBP", CA: "CAD", AU: "AUD",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR"
};

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(value = "", currency = "USD") {
  const cleaned = decodeHtml(value).replace(/[^0-9.,-]/g, "");
  if (!cleaned) return 0;
  const normalized = currency === "EUR"
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function extractFirst(pattern, html) {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : "";
}

function parseEbaySearchHtml(html, market = "US") {
  const currency = MARKET_CURRENCY[market] || "USD";
  const chunks = String(html).split(/<li[^>]+class=["'][^"']*s-item[^"']*["'][^>]*>/i).slice(1);
  const items = [];

  for (const chunk of chunks) {
    const title = extractFirst(/class=["'][^"']*s-item__title[^"']*["'][^>]*>.*?<span[^>]*>([\s\S]*?)<\/span>/i, chunk)
      || extractFirst(/class=["'][^"']*s-item__title[^"']*["'][^>]*>([\s\S]*?)<\//i, chunk);
    if (!title || /^shop on ebay$/i.test(title)) continue;

    const url = extractFirst(/class=["'][^"']*s-item__link[^"']*["'][^>]*href=["']([^"']+)/i, chunk);
    const priceText = extractFirst(/class=["'][^"']*s-item__price[^"']*["'][^>]*>([\s\S]*?)<\//i, chunk);
    const image = extractFirst(/class=["'][^"']*s-item__image-img[^"']*["'][^>]*(?:src|data-src)=["']([^"']+)/i, chunk);
    const seller = extractFirst(/class=["'][^"']*s-item__seller-info-text[^"']*["'][^>]*>([\s\S]*?)<\//i, chunk);

    items.push({
      itemId: url || title,
      title,
      price: parsePrice(priceText, currency),
      currency,
      seller,
      url,
      image,
      condition: "New"
    });
  }

  return items;
}

async function searchEbayWeb({ market = "US", q = "", limit = 50, fetchImpl = fetch } = {}) {
  const host = MARKET_HOST[market] || MARKET_HOST.US;
  const query = String(q).trim();
  const url = "https://" + host + "/sch/i.html?_nkw=" + encodeURIComponent(query) + "&_sop=12";

  if (!query) return { total: 0, source: "ebay-web", apiRequired: false, url, items: [] };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetchImpl(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; MiaanProductHunter/1.0)" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error("eBay web search returned HTTP " + response.status);
    const html = await response.text();
    const items = parseEbaySearchHtml(html, market).slice(0, Math.min(Math.max(Number(limit) || 50, 1), 100));
    return { total: items.length, source: "ebay-web", apiRequired: false, url, items };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { parseEbaySearchHtml, searchEbayWeb };
