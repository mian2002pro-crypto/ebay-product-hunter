function toHunterRows(payload, market="US"){
  const items=Array.isArray(payload?.items)?payload.items:[];
  return items.map(item=>({
    id:item.itemId||item.url||item.title,
    title:item.title||"Untitled product",
    category:"eBay listing",
    price:Number(item.price)||0,
    currency:item.currency||"USD",
    sold:null,
    active:1,
    trend:null,
    supplier:null,
    season:"Unknown",
    market,
    condition:item.condition||"",
    seller:item.seller||"",
    url:item.url||"",
    image:item.image||""
  }));
}
module.exports={toHunterRows};
