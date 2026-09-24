function estimateEconomics({sellPrice=0,supplierCost=0,shipping=0,feeRate=.13}={}){
  const price=Math.max(0,Number(sellPrice)||0);
  const cost=Math.max(0,Number(supplierCost)||0);
  const ship=Math.max(0,Number(shipping)||0);
  const fee=price*Math.max(0,Number(feeRate)||0);
  const profit=price-fee-cost-ship;
  const margin=price>0?profit/price:0;
  return {sellPrice:price,supplierCost:cost,shipping:ship,fee:Number(fee.toFixed(4)),profit:Number(profit.toFixed(4)),margin:Number(margin.toFixed(4))};
}
function rankSupplier(input={}){
  const e=estimateEconomics(input);
  const processing=Math.max(0,Number(input.processingDays)||0);
  const rating=Math.max(0,Math.min(5,Number(input.rating)||0));
  const marginScore=Math.max(0,Math.min(45,e.margin*75));
  const speedScore=Math.max(0,Math.min(25,25-processing*2));
  const ratingScore=rating/5*20;
  const costScore=e.sellPrice>0?Math.max(0,Math.min(10,(1-e.supplierCost/e.sellPrice)*10)):0;
  const score=Math.round(marginScore+speedScore+ratingScore+costScore);
  return {...e,score,processingDays:processing,rating};
}
module.exports={estimateEconomics,rankSupplier};
