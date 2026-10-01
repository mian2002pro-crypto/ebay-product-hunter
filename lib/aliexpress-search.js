function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildAliExpressSearchUrl(query = "") {
  const slug = slugify(query);
  return "https://www.aliexpress.com/w/wholesale-" + (slug || "products") + ".html";
}

function searchAliExpress({ q = "", market = "US" } = {}) {
  const query = String(q).trim();
  const url = buildAliExpressSearchUrl(query);
  return {
    provider: "aliexpress-web",
    market,
    total: query ? 1 : 0,
    page: 1,
    size: 1,
    items: query
      ? [{
          id: "aliexpress-search-" + slugify(query),
          title: query,
          price: null,
          currency: null,
          source: "AliExpress Web Search",
          market,
          url,
          image: ""
        }]
      : []
  };
}

module.exports = { buildAliExpressSearchUrl, searchAliExpress };
