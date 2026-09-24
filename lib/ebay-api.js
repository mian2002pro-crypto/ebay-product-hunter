const MARKETPLACES={
  US:"EBAY_US",UK:"EBAY_GB",CA:"EBAY_CA",AU:"EBAY_AU",DE:"EBAY_DE",FR:"EBAY_FR",IT:"EBAY_IT",ES:"EBAY_ES"
};
const CURRENCY={US:"USD",UK:"GBP",CA:"CAD",AU:"AUD",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR"};

function buildEbaySearchUrl({market="US",q="",limit=50,minPrice,maxPrice}={}){
  const params=new URLSearchParams();
  if(q) params.set("q",q);
  params.set("limit",String(Math.min(Math.max(Number(limit)||50,1),200)));
  const filters=[];
  if(minPrice!=null||maxPrice!=null){
    const min=minPrice==null?"":String(minPrice);
    const max=maxPrice==null?"":String(maxPrice);
    filters.push(`price:[${min}..${max}]`);
    filters.push(`priceCurrency:${CURRENCY[market]||"USD"}`);
  }
  if(filters.length) params.set("filter",filters.join(","));
  return `https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`;
}

async function getEbayApplicationToken(fetchImpl=fetch){
  const id=process.env.EBAY_CLIENT_ID;
  const secret=process.env.EBAY_CLIENT_SECRET;
  if(!id||!secret) throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET");
  const auth=Buffer.from(`${id}:${secret}`).toString("base64");
  const response=await fetchImpl("https://api.ebay.com/identity/v1/oauth2/token",{
    method:"POST",
    headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"},
    body:"grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope"
  });
  if(!response.ok) throw new Error(`eBay token request failed: ${response.status}`);
  const data=await response.json();
  if(!data.access_token) throw new Error("eBay token response did not include access_token");
  return data.access_token;
}

async function searchEbay(options={},fetchImpl=fetch){
  const market=options.market||"US";
  const token=await getEbayApplicationToken(fetchImpl);
  const response=await fetchImpl(buildEbaySearchUrl(options),{
    headers:{Authorization:`Bearer ${token}`,"X-EBAY-C-MARKETPLACE-ID":MARKETPLACES[market]||MARKETPLACES.US,"Accept":"application/json"}
  });
  if(!response.ok){
    const body=await response.text();
    throw new Error(`eBay search failed: ${response.status} ${body.slice(0,200)}`);
  }
  return response.json();
}
module.exports={MARKETPLACES,CURRENCY,buildEbaySearchUrl,getEbayApplicationToken,searchEbay};
