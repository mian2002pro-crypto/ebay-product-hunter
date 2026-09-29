const { searchLocalSupplier } = require("./local-supplier-data.js");

async function searchSuppliers({ provider = "cj", q = "", market = "US", minCost, maxCost, page = 1, size = 20 } = {}) {
  if (provider === "local") return searchLocalSupplier({ q, market, minCost, maxCost, page, size });
  if (provider !== "cj") throw new Error("Unsupported supplier provider: " + provider);
  return { provider: "cj", ...(await require("./cj-api.js").searchCjProducts({ q, market, minCost, maxCost, page, size })) };
}

module.exports = { searchSuppliers };
