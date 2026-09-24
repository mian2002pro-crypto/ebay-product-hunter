function buildSourcingQuery({q="",market="US",minCost,maxCost}={}){
  const p=new URLSearchParams();
  if(q) p.set("q",q);
  p.set("market",market);
  if(minCost!=null) p.set("minCost",String(minCost));
  if(maxCost!=null) p.set("maxCost",String(maxCost));
  return `/api/sourcing/search?${p.toString()}`;
}
module.exports={buildSourcingQuery};
