(() => {
  const IMAGE_ATTRS = ["src", "currentSrc", "data-src", "data-lazy-src", "data-original", "data-image", "data-img", "data-url"];

  const rawImageUrls = (node) => {
    if (!node) return [];
    const urls = [];
    for (const attr of IMAGE_ATTRS) {
      const value = attr === "currentSrc" ? node.currentSrc : node.getAttribute?.(attr);
      if (value) urls.push(value);
    }
    const srcset = node.getAttribute?.("srcset") || node.getAttribute?.("data-srcset") || "";
    if (srcset) {
      srcset.split(",").forEach((part) => {
        const url = part.trim().split(/\s+/)[0];
        if (url) urls.push(url);
      });
    }
    return urls;
  };

  const isProductImage = (url) => /(?:alicdn\.com|aliexpress-media\.com)/i.test(url)
    && /\.(?:jpg|jpeg|png|webp|avif)(?:[?#]|$)/i.test(url);

  const upgradeImageUrl = (url) => {
    let value = String(url || "").trim();
    value = value
      .replace(/_(?:50x50|80x80|100x100|120x120|150x150|172x172|220x220|300x300|400x400|480x480|640x640|800x800)(?:q\d+)?\.(?:jpg|jpeg|png|webp|avif)_?\.(?:webp|avif)$/i, (match, ext) => match)
      .replace(/_(?:50x50|80x80|100x100|120x120|150x150|172x172|220x220|300x300|400x400|480x480|640x640|800x800)(?:q\d+)?\.(jpg|jpeg|png|webp|avif)(?:_)?\.(webp|avif)$/i, ".$1")
      .replace(/_(?:50x50|80x80|100x100|120x120|150x150|172x172|220x220|300x300|400x400|480x480|640x640|800x800)(?:q\d+)?\.(jpg|jpeg|png|webp|avif)(?:_)?$/i, ".$1")
      .replace(/\.\d+x\d+(?:q\d+)?\.(jpg|jpeg|png|webp|avif)(?:_)?\.(webp|avif)$/i, ".$1")
      .replace(/\.\d+x\d+(?:q\d+)?\.(jpg|jpeg|png|webp|avif)(?:_)?$/i, ".$1");
    return value;
  };

  const contextFor = (img) => {
    const context = [
      String(img?.className || "").toLowerCase(),
      String(img?.getAttribute?.("data-testid") || "").toLowerCase(),
      String(img?.getAttribute?.("aria-label") || "").toLowerCase()
    ];
    let node = img?.parentElement;
    for (let i = 0; node && i < 6; i++, node = node.parentElement) {
      context.push(String(node.className || "").toLowerCase());
      context.push(String(node.getAttribute?.("data-testid") || "").toLowerCase());
      context.push(String(node.getAttribute?.("aria-label") || "").toLowerCase());
    }
    return context.join(" ");
  };

  const isRecommendationImage = (img) => /(recommend|related|similar|feed|suggest|more-to-love|you-may-also)/i.test(contextFor(img));

  const scoreImage = (img) => {
    const rect = img?.getBoundingClientRect?.() || {width: 0, height: 0};
    let score = 0;
    if (rect.width >= 200 && rect.height >= 200) score += 5;
    if (rect.width >= 400 && rect.height >= 400) score += 3;
    if (rect.width > 0 && rect.height > 0 && rect.width < 200 && rect.height < 200) score += 1;
    const text = contextFor(img);
    if (/(gallery|slider|carousel|product|sku|variation|thumbnail|swatch|image)/i.test(text)) score += 6;
    if (/(recommend|related|similar|feed|suggest|more-to-love|you-may-also)/i.test(text)) score -= 20;
    return score;
  };

  const productRoot = () => {
    const main = document.querySelector("main");
    if (main) return main;
    const productImages = [...document.images].filter((img) => isProductImage(rawImageUrls(img)[0] || ""));
    const best = productImages.sort((a, b) => scoreImage(b) - scoreImage(a))[0];
    return best?.parentElement || document.body;
  };

  const collectProductImages = (root) => {
    const nodes = [];
    const seenNodes = new Set();
    const addNodes = (list) => {
      for (const node of Array.from(list || [])) {
        if (!seenNodes.has(node)) {
          seenNodes.add(node);
          nodes.push(node);
        }
      }
    };

    addNodes(document.images || []);
    addNodes(document.querySelectorAll?.("img, source") || []);
    if (root && root !== document) addNodes(root.querySelectorAll?.("img, source") || []);

    const results = [];
    for (const node of nodes) {
      if (node.tagName && String(node.tagName).toLowerCase() === "source") {
        const sources = rawImageUrls(node);
        for (const url of sources) {
          if (isProductImage(url)) results.push({node, url, score: scoreImage(node), variant: /(sku|variation|swatch|property)/i.test(contextFor(node))});
        }
        continue;
      }

      if (isRecommendationImage(node)) continue;
      for (const url of rawImageUrls(node)) {
        if (!isProductImage(url)) continue;
        const upgraded = upgradeImageUrl(url);
        const score = scoreImage(node);
        if (score >= 0) results.push({
          node,
          url: upgraded,
          score,
          variant: /(sku|variation|swatch|property)/i.test(contextFor(node))
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map((item) => item.url)
      .filter((url, index, list) => list.indexOf(url) === index);
  };

  function extractProduct() {
    const root = productRoot();
    const title = document.querySelector("h1")?.textContent?.trim()
      || document.querySelector("[class*='title']")?.textContent?.trim()
      || document.title.replace(/\s*[-|].*$/, "").trim();

    const price = [...root.querySelectorAll("[class*='price'],[class*='Price']")]
      .map((node) => node.textContent?.trim())
      .find(Boolean) || "";

    const imageRecords = collectProductImages(root);
    const mainImages = imageRecords.filter((item) => !item.variant).map((item) => item.url);
    const variantImages = imageRecords.filter((item) => item.variant).map((item) => item.url);
    const images = [...mainImages, ...variantImages]
      .filter((url, index, list) => list.indexOf(url) === index);

    const videoRoot = root.querySelectorAll("video, video source").length ? root : document;
    const videos = [
      ...[...videoRoot.querySelectorAll("video, video source")].map((node) =>
        node?.currentSrc || node?.src || node?.getAttribute?.("src") || node?.getAttribute?.("data-src") || ""
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
      mainImages,
      variantImages,
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