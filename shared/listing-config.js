const COMMON_OPTIONS = [
  "Material", "Theme", "Color", "Department", "Item Length", "Item Width",
  "Item Height", "Shape", "Country of Origin", "Occasion", "Features",
  "Character", "Category", "Type", "Style", "Fabric Type", "Pattern",
  "Texture", "Accents", "Attachment", "Fabric Weight", "No. of Items",
  "Set Includes", "Production Style", "Production Technique", "Filling",
  "Product Line", "Number of Attachments"
];
const COMMON_PROMPTS = {
  title: "Create a catchy, creative, genuine, data-based eBay listing title using only the supplied product facts.",
  options: "Generate accurate eBay-ready values using supplied product information only. Never invent specifications; use Not Specified or omit when unsupported.",
  description: "Create a professional eBay listing description from the supplied product facts. Never invent unsupported specifications.",
  image: "Create a premium professional eBay first image. Make the supplied product large, clear, sharp and centered in square 1:1 format. Keep text away from the product."
};
const PROFILES = {
  US: { market:"US", name:"USA", currency:"USD", prompts:{...COMMON_PROMPTS}, optionFields:[...COMMON_OPTIONS] },
  UK: { market:"UK", name:"United Kingdom", currency:"GBP", prompts:{
    title: COMMON_PROMPTS.title,
    description: "Write an SEO-optimized eBay description with 5 features and sophisticated emojis. Structure it as: title (same as listing title), what's the product, 5 features, size, color, what's in the package, and a final paragraph. State Country of Origin: United Kingdom.",
    options: "Generate accurate eBay-ready values using supplied title, description, specifications and images only. Never invent specifications, dimensions, materials, quantities, certifications, features or other product information. If unsupported, use Not Specified or omit when appropriate.",
    image: "Create a premium professional eBay listing main image using the supplied product. Make it large, clear, sharp and centered in square 1:1 format. Add a relevant premium background, UK flag aesthetically, Free and fast shipping bottom-left, and Returns accepted bottom-right. Never write UKseller, UK Stock or UK Seller."
  }, optionFields:[...COMMON_OPTIONS] }
};
function getMarketProfile(market="US"){ const key=String(market).toUpperCase(); if(!PROFILES[key]) throw new Error("Unsupported market: "+market); return {...PROFILES[key], optionFields:[...PROFILES[key].optionFields], prompts:{...PROFILES[key].prompts}}; }
function buildGenerationContext(market, product={}){ const profile=getMarketProfile(market); return { market:profile.market, profile, product:{title:product.title||"",price:product.price||"",image:product.image||"",url:product.url||"",description:product.description||"",specifications:product.specifications||{}}, rules:{missingFacts:"Use Not Specified or omit when unsupported; never invent specifications.",sourceOfTruth:"Use supplied product facts and source evidence only."} }; }
module.exports={COMMON_OPTIONS,getMarketProfile,buildGenerationContext};