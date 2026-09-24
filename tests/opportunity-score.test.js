const assert=require("node:assert/strict");
const {scoreOpportunity,detectSeason}=require("../lib/opportunity.js");

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
console.log("opportunity scoring tests passed");
