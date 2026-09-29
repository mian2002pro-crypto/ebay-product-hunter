import { NextRequest, NextResponse } from "next/server";
const { searchLocalMarket } = require("../../../../lib/local-market-data.js");
const { toHunterRows } = require("../../../../lib/product-hunter.js");

const MARKETS = new Set(["US","UK","CA","AU","DE","FR","IT","ES"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = (params.get("market") || "US").toUpperCase();
  if (!MARKETS.has(market)) return NextResponse.json({error:"Unsupported market"},{status:400});
  const data = searchLocalMarket({market,q:params.get("q")||"",limit:Number(params.get("limit")||50)});
  return NextResponse.json({
    total:data.total,
    source:"local-research-catalog",
    apiRequired:false,
    items:toHunterRows(data,market)
  });
}
