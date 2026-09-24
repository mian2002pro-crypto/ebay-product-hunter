const { searchCjProducts } = require("./cj-api.js");

async function searchSuppliers({ provider = "cj", q = "", market = "US", minCost, maxCost, page = 1, size = 20 } = {}, deps = {}) {
  if (provider !== "cj") throw new Error("Unsupported supplier provider: " + provider);
  const cjSearch = deps.cjSearch || searchCjProducts;
  const result = await cjSearch({ q, market, minCost, maxCost, page, size });
  return { provider: "cj", ...result };
}

module.exports = { searchSuppliers };