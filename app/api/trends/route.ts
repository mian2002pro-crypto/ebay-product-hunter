import { NextRequest, NextResponse } from "next/server";
const { getTrendDb } = require("../../../../lib/trend-db.js");
const { getPreviousTrendSnapshot, saveTrendSnapshot } = require("../../../../lib/trend-store.js");
const { compareTrendSnapshots } = require("../../../../lib/opportunity.js");
const { ensureTrendSchema } = require("../../../../lib/ensure-schema.js");

export async function GET(request: NextRequest) {
  const params=request.nextUrl.searchParams;
  const market=(params.get("market")||"US").toUpperCase();
  const query=params.get("q")||"";
  try{
    const db=getTrendDb();
    await ensureTrendSchema(db);
    const previous=await getPreviousTrendSnapshot(db,{market,query});
    return NextResponse.json({market,query,items:previous});
  }catch(error){
    return NextResponse.json({error:{code:"TREND_HISTORY_UNAVAILABLE",message:error instanceof Error?error.message:"Trend history unavailable"}},{status:503});
  }
}

export async function POST(request: NextRequest) {
  try{
    const body=await request.json();
    const market=String(body.market||"US").toUpperCase();
    const query=String(body.query||"");
    const terms=Array.isArray(body.terms)?body.terms:[];
    if(!terms.length) return NextResponse.json({error:{code:"INVALID_TRENDS",message:"terms must contain at least one trend"}},{status:400});
    const db=getTrendDb();
    await ensureTrendSchema(db);
    const previous=await getPreviousTrendSnapshot(db,{market,query});
    const movement=compareTrendSnapshots(previous,terms);
    const saved=await saveTrendSnapshot(db,{market,query,terms});
    return NextResponse.json({market,query,saved,items:movement});
  }catch(error){
    return NextResponse.json({error:{code:"TREND_HISTORY_FAILED",message:error instanceof Error?error.message:"Trend history request failed"}},{status:503});
  }
}
