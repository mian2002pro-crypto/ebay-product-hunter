const COMMON_OPTIONS = [
  "Material", "Theme", "Color", "Department", "Item Length", "Item Width",
  "Item Height", "Shape", "Country of Origin", "Occasion", "Features",
  "Character", "Category", "Type", "Style", "Fabric Type", "Pattern",
  "Texture", "Accents", "Attachment", "Fabric Weight", "No. of Items",
  "Set Includes", "Production Style", "Production Technique", "Filling",
  "Product Line", "Number of Attachments"
];

const PROFILES = {
  US: {
    market: "US",
    name: "USA",
    currency: "USD",
    optionFields: [...COMMON_OPTIONS]
  },
  UK: {
    market: "UK",
    name: "United Kingdom",
    currency: "GBP",
    optionFields: [...COMMON_OPTIONS]
  }
};

function getMarketProfile(market = "US") {
  const key = String(market).toUpperCase();
  if (!PROFILES[key]) throw new Error(`Unsupported market: ${market}`);
  return { ...PROFILES[key], optionFields: [...PROFILES[key].optionFields] };
}

function buildGenerationContext(market, product = {}) {
  const profile = getMarketProfile(market);
  const facts = {
    title: product.title || "",
    price: product.price || "",
    image: product.image || "",
    url: product.url || "",
    description: product.description || "",
    specifications: product.specifications || {}
  };

  return {
    market: profile.market,
    profile,
    product: facts,
    rules: {
      missingFacts: "Use Not Specified or omit when unsupported; never invent specifications.",
      sourceOfTruth: "Use supplied product facts and source evidence only."
    }
  };
}

module.exports = { COMMON_OPTIONS, getMarketProfile, buildGenerationContext };
