const SEASON_RULES=[
  ["Halloween",["halloween","pumpkin","ghost","spooky","witch","costume"]],
  ["Christmas",["christmas","xmas","santa","snowman","ornament","stocking"]],
  ["Fall",["autumn","fall leaves","leaf garland","harvest","thanksgiving"]],
  ["Winter",["winter","snow","snowflake","thermal","fleece"]],
  ["Spring",["spring","easter","bunny","flower","garden"]]
];

function detectSeason(title=""){
  const value=String(title).toLowerCase();
  for(const [season,words] of SEASON_RULES){
    if(words.some(word=>value.includes(word))) return season;
  }
  return "Evergreen";
}

function clamp(value,min=0,max=100){return Math.max(min,Math.min(max,value));}

function scoreOpportunity(item={},options={}){
  const price=Number(item.price)||0;
  const active=Math.max(0,Number(item.active)||0);
  const title=String(item.title||"");
  const season=options.season&&options.season!=="All"?options.season:detectSeason(title);

  // This is a listing-quality heuristic, not a sales prediction.
  const priceScore=price>=15&&price<=80?20:price>0?10:0;
  const competitionScore=active===0?25:clamp(25-(Math.log10(active+1)*9),0,25);
  const seasonScore=season!=="Evergreen"?20:10;
  const titleScore=title.length>=20?15:title.length>=10?10:5;
  const supplierCost=Math.max(0,Number(item.supplierCost)||0);  const shipping=Math.max(0,Number(item.shipping)||0);  const hasSupplier=supplierCost>0;  const marginEstimate=hasSupplier?price-(price*0.13)-supplierCost-shipping:price*0.87;
  const marginScore=marginEstimate>=15?20:marginEstimate>=8?12:5;  const supplierScore=hasSupplier&&price>0?clamp((marginEstimate/price)*20,0,20):0;  const observedSold=Math.max(0,Number(item.sold)||0);  const demandScore=observedSold>0?clamp(Math.log10(observedSold+1)*7,0,15):0;  const totalMax=hasSupplier?120:100;
  const rawScore=priceScore+competitionScore+seasonScore+titleScore+marginScore+supplierScore+demandScore;  const score=Math.round(clamp((rawScore/totalMax)*100));

  const reasons=[];
  if(priceScore>=20) reasons.push("Mid-range retail price");
  if(competitionScore>=18) reasons.push("Relatively low active-listing competition");
  if(season!=="Evergreen") reasons.push(`${season} keyword detected`);
  if(marginScore>=12) reasons.push(hasSupplier?"Positive estimated supplier margin":"Room for marketplace fees before supplier cost");  if(demandScore>0) reasons.push("Observed sold-demand signal available");
  if(!reasons.length) reasons.push("Limited observable listing signals");

  return {score,season,marginEstimate:Number(marginEstimate.toFixed(2)),reasons};
}


function extractTrendTerms(title=""){
  const stop=new Set(["with","and","for","the","new","set","of","from","inch","in","on","to"]);
  return [...new Set(String(title).toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(w=>w.length>=4&&!stop.has(w)))];
}
function rankTrendProducts(items=[]){
  const groups=new Map();
  for(const item of Array.isArray(items)?items:[]){
    const terms=extractTrendTerms(item.title);
    for(const term of terms){
      const g=groups.get(term)||{term,listings:0,totalPrice:0,season:detectSeason(item.title)};
      g.listings++;
      g.totalPrice+=Number(item.price)||0;
      groups.set(term,g);
    }
  }
  return [...groups.values()].map(g=>({...g,avgPrice:Number((g.totalPrice/g.listings).toFixed(2))}))
    .sort((a,b)=>b.listings-a.listings);
}

function compareTrendSnapshots(previous=[],current=[]){
  const prior=Array.isArray(previous)?previous:[];
  const nowItems=Array.isArray(current)?current:[];
  const oldMap=new Map(prior.map(x=>[x.term,{listings:Number(x.listings)||0,avgPrice:Number(x.avgPrice)||0}]));
  const currentMap=new Map(nowItems.map(x=>[x.term,x]));
  const terms=new Set([...oldMap.keys(),...currentMap.keys()]);
  return [...terms].map(term=>{
    const before=oldMap.get(term);
    const currentItem=currentMap.get(term);
    const now=Number(currentItem?.listings)||0;
    const old=before?.listings||0;
    const change=now-old;
    const pct=old>0?(change/old)*100:(now>0?100:0);
    return {
      ...(currentItem||{term,listings:0,avgPrice:before?.avgPrice||0,season:"Evergreen"}),
      previousListings:old,
      listingChange:change,
      changePercent:Number(pct.toFixed(1)),
      direction:change>0?"Rising":change<0?"Falling":"Stable"
    };
  }).sort((a,b)=>b.changePercent-a.changePercent);
}
module.exports={scoreOpportunity,detectSeason,extractTrendTerms,rankTrendProducts,compareTrendSnapshots};
