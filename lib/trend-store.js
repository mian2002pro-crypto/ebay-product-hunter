const DEFAULT_TABLE="trend_snapshots";

function assertDb(db){
  if(!db || typeof db.query!=="function") throw new Error("Database client with query() is required");
}

async function saveTrendSnapshot(db,{market="US",query="",terms=[]}={}){
  assertDb(db);
  const rows=Array.isArray(terms)?terms:[];
  if(!rows.length) return 0;
  await db.query(
    `INSERT INTO ${DEFAULT_TABLE} (market, search_query, term, listings, avg_price, season)
     SELECT $1,$2,x.term,x.listings,x.avg_price,x.season
     FROM jsonb_to_recordset($3::jsonb) AS x(term text,listings integer,avg_price numeric,season text)`,
    [market,String(query||""),JSON.stringify(rows.map(x=>({
      term:String(x.term||""),
      listings:Number(x.listings)||0,
      avg_price:Number(x.avgPrice)||0,
      season:String(x.season||"Evergreen")
    })))]
  );
  return rows.length;
}

async function getPreviousTrendSnapshot(db,{market="US",query=""}={}){
  assertDb(db);
  const result=await db.query(
    `SELECT DISTINCT ON (term) term,listings,avg_price,season,captured_at
     FROM ${DEFAULT_TABLE}
     WHERE market=$1 AND search_query=$2
       AND captured_at < (SELECT COALESCE(MAX(captured_at),'epoch'::timestamptz)
                          FROM ${DEFAULT_TABLE} WHERE market=$1 AND search_query=$2)
     ORDER BY term,captured_at DESC`,
    [market,String(query||"")]
  );
  return (result.rows||[]).map(x=>({
    term:x.term,
    listings:Number(x.listings)||0,
    avgPrice:Number(x.avg_price)||0,
    season:x.season||"Evergreen",
    capturedAt:x.captured_at
  }));
}

module.exports={saveTrendSnapshot,getPreviousTrendSnapshot};
