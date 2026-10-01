function localGenerate({ market = "US", kind, product = {}, prompt = "" } = {}) {
  const title = product.title || "Not Specified";
  const price = product.price != null && product.currency ? product.price + " " + product.currency : "Not Specified";
  const origin = market === "UK" ? "United Kingdom" : market === "US" ? "United States" : "Not Specified";

  if (kind === "title") {
    return title;
  }

  if (kind === "options") {
    return [
      "Type: Not Specified",
      "Material: Not Specified",
      "Brand: Not Specified",
      "Features: Not Specified",
      "Pattern: Not Specified",
      "Theme: Not Specified",
      "Colour: Not Specified",
      "Department: Not Specified",
      "Style: Not Specified",
      "Product Line: Not Specified",
      "Item Length: Not Specified",
      "Item Width: Not Specified",
      "Item Height: Not Specified",
      "Texture: Not Specified",
      "Shape: Not Specified",
      "Occasion: Not Specified",
      "Character: Not Specified",
      "Set Includes: Not Specified",
      "No. of Items: Not Specified",
      "Production Technique: Not Specified",
      "Production Style: Not Specified",
      "Number of Attachments: Not Specified"
    ].join("\n");
  }

  if (kind === "description") {
    return [
      title,
      "",
      "What’s the Product?",
      title,
      "",
      "Key Features",
      "🔹 Not Specified",
      "🔹 Not Specified",
      "🔹 Not Specified",
      "🔹 Not Specified",
      "🔹 Not Specified",
      "",
      "Size: Not Specified",
      "Color: Not Specified",
      "What’s in the Package? Not Specified",
      "Country of Origin: " + origin,
      "",
      "Price Reference: " + price,
      "",
      "Only supplied product facts are used. Unsupported specifications are not invented."
    ].join("\n");
  }

  if (kind === "image") {
    return [
      "eBay main-image prompt",
      "Square 1:1 format.",
      "Product: " + title,
      "Make the supplied product large, sharp, centered and realistic.",
      "Use only the supplied product facts; do not add unsupported product features.",
      market === "UK"
        ? "Add a UK flag top-right, Free and fast shipping bottom-left, Returns accepted bottom-right."
        : "Add a US flag top-right, FREE SHIPPING bottom-left, Shipment / Returns Accepted bottom-right.",
      prompt
    ].join("\n");
  }

  return "Unsupported listing type.";
}

module.exports = { localGenerate };
