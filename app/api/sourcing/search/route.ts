import { NextRequest, NextResponse } from "next/server";
const { searchSuppliers } = require("../../../../../lib/supplier-search.js");

const MARKETS = new Set(["US", "UK", "CA", "AU", "DE", "FR", "IT", "ES"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = (params.get("market") || "US").toUpperCase();
  const provider = (params.get("provider") || "cj").toLowerCase();
  const q = params.get("q") || "";
  const minCost = params.get("minCost");
  const maxCost = params.get("maxCost");
  const page = Number(params.get("page") || 1);
  const size = Number(params.get("size") || 20);

  if (!MARKETS.has(market)) {
    return NextResponse.json({ error: { code: "INVALID_MARKET", message: "Unsupported marketplace" } }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1 || size > 100) {
    return NextResponse.json({ error: { code: "INVALID_PAGINATION", message: "Invalid page or size" } }, { status: 400 });
  }

  try {
    const result = await searchSuppliers({
      provider,
      q,
      market,
      minCost: minCost === null ? undefined : Number(minCost),
      maxCost: maxCost === null ? undefined : Number(maxCost),
      page,
      size
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "SUPPLIER_REQUEST_FAILED",
        message: error instanceof Error ? error.message : "Supplier request failed"
      }
    }, { status: 502 });
  }
}
