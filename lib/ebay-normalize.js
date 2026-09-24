function normalizeEbaySearch(payload){
  const raw=Array.isArray(payload?.itemSummaries)?payload.itemSummaries:[];
  return {
    total:Number(payload?.total)||raw.length,
    items:raw.map(item=>({
      itemId:item.itemId||"",
      title:item.title||"",
      price:Number(item.price?.value)||0,
      currency:item.price?.currency||"USD",
      condition:item.condition||"",
      seller:item.seller?.username||"",
      url:item.itemWebUrl||"",
      image:item.image?.imageUrl||""
    }))
  };
}
module.exports={normalizeEbaySearch};
