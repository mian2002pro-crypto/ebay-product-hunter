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
  const marginEstimate=price*0.87;
  const marginScore=marginEstimate>=15?20:marginEstimate>=8?12:5;
  const score=Math.round(clamp(priceScore+competitionScore+seasonScore+titleScore+marginScore));

  const reasons=[];
  if(priceScore>=20) reasons.push("Mid-range retail price");
  if(competitionScore>=18) reasons.push("Relatively low active-listing competition");
  if(season!=="Evergreen") reasons.push(`${season} keyword detected`);
  if(marginScore>=12) reasons.push("Room for marketplace fees before supplier cost");
  if(!reasons.length) reasons.push("Limited observable listing signals");

  return {score,season,marginEstimate:Number(marginEstimate.toFixed(2)),reasons};
}

module.exports={scoreOpportunity,detectSeason};
