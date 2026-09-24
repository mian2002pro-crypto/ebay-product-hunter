const assert=require("node:assert/strict");
const {scoreOpportunity,detectSeason,extractTrendTerms,rankTrendProducts,compareTrendSnapshots}=require("../lib/opportunity.js");

assert.equal(detectSeason("LED Halloween Pumpkin Lights"),"Halloween");
assert.equal(detectSeason("Christmas window projector"),"Christmas");
assert.equal(detectSeason("Autumn leaf garland"),"Fall");
assert.equal(detectSeason("Stainless steel water bottle"),"Evergreen");

const score=scoreOpportunity({price:30,active:5,title:"Halloween Pumpkin Lights"}, {market:"US",season:"Halloween"});
assert.equal(typeof score.score,"number");
assert.ok(score.score>=0 && score.score<=100);
assert.ok(score.marginEstimate>0);
assert.ok(score.reasons.length>0);

const low=scoreOpportunity({price:5,active:100,title:"Basic item"}, {market:"US",season:"All"});
assert.ok(low.score<score.score);

const sourced=scoreOpportunity({price:30,active:5,title:"Halloween Pumpkin Lights",supplierCost:7,shipping:2,sold:20},{market:"US",season:"Halloween"});
assert.ok(sourced.score>score.score);
assert.ok(sourced.reasons.some((r)=>/supplier|margin|profit/i.test(r)));

assert.ok(extractTrendTerms("LED Halloween Pumpkin Lights").includes("pumpkin"));
const trends=rankTrendProducts([
  {title:"LED Pumpkin Lights",price:20},
  {title:"Pumpkin Garden Lights",price:30},
  {title:"Stainless Bottle",price:15}
]);
assert.equal(trends[0].term,"pumpkin");
assert.equal(trends[0].listings,2);
assert.equal(trends[0].avgPrice,25);

const movement=compareTrendSnapshots(
  [{term:"pumpkin",listings:10,avgPrice:20},{term:"ornament",listings:4,avgPrice:15}],
  [{term:"pumpkin",listings:15,avgPrice:22},{term:"ornament",listings:2,avgPrice:15}]
);
assert.equal(movement.find(x=>x.term==="pumpkin").direction,"Rising");
assert.equal(movement.find(x=>x.term==="ornament").direction,"Falling");
console.log("opportunity scoring tests passed");
