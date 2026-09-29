import { NextRequest, NextResponse } from "next/server";
const { searchLocalMarket } = require("../../../../lib/local-market-data.js");
const { searchEbayWeb } = require("../../../../lib/ebay-web-search.js");
const { toHunterRows } = require("../../../../lib/product-hunter.js");

const MARKETS = new Set(["US","UK","CA","AU","DE","FR","IT","ES"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = (params.get("market") || "US").toUpperCase();
  const q = params.get("q") || "";
  const limit = Number(params.get("limit") || 50);

  if (!MARKETS.has(market)) return NextResponse.json({ error: "Unsupported market" }, { status: 400 });

  if (q.trim()) {
    try {
      const live = await searchEbayWeb({ market, q, limit });
      if (live.items.length > 0) {
        return NextResponse.json({
          total: live.total,
          source: live.source,
          apiRequired: false,
          liveWeb: true,
          items: toHunterRows(live, market)
        });
      }
    } catch {
      // Fall through to the local reference catalog when eBay blocks automated web access.
    }
  }

  const data = searchLocalMarket({ market, q, limit });
  return NextResponse.json({
    total: data.total,
    source: "local-reference-catalog",
    apiRequired: false,
    liveWeb: false,
    items: toHunterRows(data, market)
  });
}
