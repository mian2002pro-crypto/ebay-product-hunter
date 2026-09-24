const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

const MARKET_COUNTRIES = { US: "US", UK: "GB", CA: "CA", AU: "AU", DE: "DE", FR: "FR", IT: "IT", ES: "ES" };

function buildCjProductSearchUrl({ q = "", market = "US", minCost, maxCost, page = 1, size = 20 } = {}) {
  const p = new URLSearchParams();
  if (q) p.set("keyWord", q);
  p.set("page", String(Math.max(1, Number(page) || 1)));
  p.set("size", String(Math.min(100, Math.max(1, Number(size) || 20))));
  p.set("countryCode", MARKET_COUNTRIES[market] || "US");
  if (minCost != null && minCost !== "") p.set("startSellPrice", String(Math.max(0, Number(minCost) || 0)));
  if (maxCost != null && maxCost !== "") p.set("endSellPrice", String(Math.max(0, Number(maxCost) || 0)));
  return BASE_URL + "/product/listV2?" + p.toString();
}

function parsePrice(value) {
  if (typeof value === "number") return value;
  const first = String(value ?? "").split("-")[0].trim();
  const n = Number.parseFloat(first);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCjProducts(payload) {
  const data = payload?.data || {};
  const rows = Array.isArray(data.content) ? data.content : [];
  return {
    total: Number(data.totalRecords) || rows.length,
    items: rows.map((item) => ({
      id: item.pid || item.productSku || item.vid || "",
      title: item.productNameEn || item.productName || "Untitled supplier product",
      price: parsePrice(item.sellPrice ?? item.nowPrice),
      currency: "USD",
      source: "CJdropshipping",
      sku: item.productSku || "",
      image: item.bigImage || "",
      category: item.categoryName || "",
      url: item.productUrl || ""
    }))
  };
}

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getCjAccessToken(fetchImpl = fetch) {
  if (process.env.CJ_ACCESS_TOKEN) return process.env.CJ_ACCESS_TOKEN;
  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) throw new Error("CJ supplier is not configured. Set CJ_ACCESS_TOKEN or CJ_API_KEY.");
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;
  const response = await fetchImpl(BASE_URL + "/authentication/getAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey })
  });
  const body = await response.json();
  if (!response.ok || body?.code !== 200 || !body?.data?.accessToken) throw new Error(body?.message || "CJ authentication failed");
  cachedToken = body.data.accessToken;
  cachedTokenExpiry = Date.now() + 60 * 60 * 1000;
  return cachedToken;
}

async function searchCjProducts(options = {}, fetchImpl = fetch) {
  const token = await getCjAccessToken(fetchImpl);
  const response = await fetchImpl(buildCjProductSearchUrl(options), { headers: { "CJ-Access-Token": token } });
  const body = await response.json();
  if (!response.ok || body?.code !== 200 || body?.result === false) throw new Error(body?.message || "CJ product search failed");
  return normalizeCjProducts(body);
}

module.exports = { BASE_URL, buildCjProductSearchUrl, normalizeCjProducts, getCjAccessToken, searchCjProducts };