(() => {
  const imageUrl = (node) => node?.currentSrc
    || node?.getAttribute("src")
    || node?.getAttribute("data-src")
    || node?.getAttribute("data-lazy-src")
    || node?.getAttribute("data-original")
    || "";

  const isProductImage = (url) => /(?:alicdn\.com|aliexpress-media\.com)/i.test(url)
    && /\.(?:jpg|jpeg|png|webp)(?:[?#]|$)/i.test(url);

  const upgradeImageUrl = (url) => url
    .replace(/_(?:50x50|80x80|100x100|120x120|150x150|220x220|300x300|400x400)\.(jpg|jpeg|png|webp)/i, ".$1")
    .replace(/\.\d+x\d+\.(jpg|jpeg|png|webp)/i, ".$1");

  const isRecommendationImage = (img) => {
    const context = [
      String(img.className || "").toLowerCase(),
      String(img.getAttribute?.("data-testid") || "").toLowerCase(),
      String(img.getAttribute?.("aria-label") || "").toLowerCase()
    ];
    let node = img.parentElement;
    for (let i = 0; node && i < 5; i++, node = node.parentElement) {
      context.push(String(node.className || "").toLowerCase());
      context.push(String(node.getAttribute?.("data-testid") || "").toLowerCase());
      context.push(String(node.getAttribute?.("aria-label") || "").toLowerCase());
    }
    return /(recommend|related|similar|feed|suggest)/i.test(context.join(" "));
  };

  const scoreImage = (img) => {
    let score = 0;
    const rect = img.getBoundingClientRect();
    if (rect.width >= 200 && rect.height >= 200) score += 5;
    if (rect.width >= 400 && rect.height >= 400) score += 3;

    const context = [
      String(img.className || "").toLowerCase(),
      String(img.getAttribute?.("data-testid") || "").toLowerCase(),
      String(img.getAttribute?.("aria-label") || "").toLowerCase()
    ];
    let node = img.parentElement;
    for (let i = 0; node && i < 5; i++, node = node.parentElement) {
      context.push(String(node.className || "").toLowerCase());
      context.push(String(node.getAttribute?.("data-testid") || "").toLowerCase());
      context.push(String(node.getAttribute?.("aria-label") || "").toLowerCase());
    }
    const text = context.join(" ");
    if (/(gallery|slider|carousel|product|sku|variation|thumbnail|image)/i.test(text)) score += 6;
    if (/(recommend|related|similar|feed|suggest)/i.test(text)) score -= 12;
    return score;
  };

  const productRoot = () => {
    const main = document.querySelector("main");
    if (main) return main;

    const productImages = [...document.images].filter((img) => isProductImage(imageUrl(img)));
    const best = productImages.sort((a, b) => scoreImage(b) - scoreImage(a))[0];
    return best?.parentElement || document.body;
  };

  function extractProduct() {
    const root = productRoot();
    const title = document.querySelector("h1")?.textContent?.trim()
      || document.querySelector("[class*='title']")?.textContent?.trim()
      || document.title.replace(/\s*[-|].*$/, "").trim();

    const price = [...root.querySelectorAll("[class*='price'],[class*='Price']")]
      .map((node) => node.textContent?.trim())
      .find(Boolean) || "";

    const candidates = [...root.querySelectorAll("img")]
      .filter((img) => isProductImage(imageUrl(img)))
      .filter((img) => !isRecommendationImage(img))
      .map((img) => ({
        img,
        score: scoreImage(img),
        url: upgradeImageUrl(imageUrl(img))
      }))
      .filter((item) => item.url && item.score >= 0);

    const images = candidates
      .sort((a, b) => b.score - a.score)
      .map((item) => item.url)
      .filter((url, index, list) => list.indexOf(url) === index);

    const videoRoot = root.querySelectorAll("video, video source").length ? root : document;
    const videos = [
      ...[...videoRoot.querySelectorAll("video, video source")].map((node) =>
        node?.currentSrc || node?.src || node?.getAttribute("src") || node?.getAttribute("data-src") || ""
      ),
      ...(typeof document.querySelectorAll === "function"
        ? [...document.querySelectorAll("meta[property='og:video'], meta[property='og:video:url'], meta[property='og:video:secure_url']")]
        : []
      ).map((node) => node?.getAttribute("content") || "")
    ]
      .filter((url) => /^https?:\/\//i.test(url))
      .filter((url) => /\.(?:mp4|webm|mov)(?:[?#]|$)/i.test(url) || /(?:alicdn\.com|aliexpress-media\.com)/i.test(url))
      .filter((url, index, list) => list.indexOf(url) === index);

    return {
      title,
      priceText: price,
      seller: "",
      image: images[0] || "",
      images,
      videos,
      url: location.href.split("?")[0],
      market: "aliexpress.com",
      source: "AliExpress",
      imageMode: "all-product-gallery-and-variation-images"
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "MIAN_EXTRACT_ALI_PRODUCT") return true;
    try {
      const product = extractProduct();
      if (!product.images.length) {
        sendResponse({ok: false, error: "No AliExpress product gallery images were detected."});
        return true;
      }
      sendResponse({ok: true, product});
    } catch (error) {
      sendResponse({ok: false, error: "AliExpress product extraction failed: " + error.message});
    }
    return true;
  });
})();