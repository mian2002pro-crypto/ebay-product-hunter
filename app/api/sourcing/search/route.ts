import { NextRequest, NextResponse } from "next/server";
const { searchAliExpress } = require("../../../../lib/aliexpress-search.js");

const MARKETS = new Set(["US", "UK", "CA", "AU", "DE", "FR", "IT", "ES"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = (params.get("market") || "US").toUpperCase();
  const provider = (params.get("provider") || "aliexpress").toLowerCase();
  const q = params.get("q") || "";

  if (!MARKETS.has(market)) {
    return NextResponse.json({ error: { code: "INVALID_MARKET", message: "Unsupported marketplace" } }, { status: 400 });
  }

  if (provider !== "aliexpress") {
    return NextResponse.json({
      error: {
        code: "UNSUPPORTED_PROVIDER",
        message: "Only AliExpress web sourcing is enabled in API-free mode."
      }
    }, { status: 400 });
  }

  return NextResponse.json(searchAliExpress({ q, market }));
}
