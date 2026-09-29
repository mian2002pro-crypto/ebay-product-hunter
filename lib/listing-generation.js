function buildGenerationRequest({market,kind,prompt,product={}}){
  const safeProduct={
    title:product.title||"",
    price:product.price||"",
    currency:product.currency||"",
    description:product.description||"",
    specifications:product.specifications||{},
    sourceUrl:product.url||""
  };
  return {
    kind,
    system:"You are an eBay listing assistant. Follow the market-specific prompt. Use supplied facts only. Never invent specifications. If a fact is unsupported, use Not Specified or omit it.",
    user:"Market: "+market+"\nTask: "+kind+"\nPrompt: "+prompt+"\nProduct facts:\n"+JSON.stringify(safeProduct,null,2)
  };
}
const LISTING_TABS=["title","description","options","image"];
module.exports={buildGenerationRequest,LISTING_TABS};
