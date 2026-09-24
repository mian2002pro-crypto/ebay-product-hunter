import { NextRequest, NextResponse } from "next/server";
const { searchEbay, MARKETPLACES } = require("../../../../lib/ebay-api.js");
const { normalizeEbaySearch } = require("../../../../lib/ebay-normalize.js");

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = (params.get("market") || "US").toUpperCase();
  if (!MARKETPLACES[market as keyof typeof MARKETPLACES]) {
    return NextResponse.json({ error: "Unsupported eBay marketplace" }, { status: 400 });
  }

  try {
    const data = await searchEbay({
      market,
      q: params.get("q") || "",
      limit: Number(params.get("limit") || 50),
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    });
    return NextResponse.json(normalizeEbaySearch(data));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "eBay request failed" },
      { status: 502 }
    );
  }
}
