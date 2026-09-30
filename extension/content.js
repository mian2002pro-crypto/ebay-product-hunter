(() => {
  const firstText = (selectors) => {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = node?.textContent?.trim();
      if (value) return value;
    }
    return "";
  };
  const firstAttr = (selectors, attr) => {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = node?.getAttribute(attr);
      if (value) return value;
    }
    return "";
  };
  const mediaUrl = (node) => node?.getAttribute("src")
    || node?.getAttribute("data-src")
    || node?.getAttribute("data-original")
    || node?.getAttribute("data-lazy-src")
    || "";

  const selectedImage = () => firstAttr([
    ".ux-image-carousel-item.active img",
    ".ux-image-carousel-item[aria-current='true'] img",
    "img[aria-current='true']",
    "meta[property='og:image']"
  ], "src") || firstAttr([
    ".ux-image-carousel-item.active img",
    ".ux-image-carousel-item[aria-current='true'] img",
    "img[aria-current='true']",
  ], "data-src") || firstAttr([
    ".ux-image-carousel-item.active img",
    ".ux-image-carousel-item[aria-current='true'] img",
    "img[aria-current='true']",
  ], "data-original") || firstAttr([
    "meta[property='og:image']"
  ], "content");

  function extractListing() {
    const title = firstText(["h1.x-item-title__mainTitle span", "h1.x-item-title__mainTitle", "h1"]);
    const price = firstText(["div.x-price-primary span", ".x-price-primary"]);
    const seller = firstText([".x-sellercard-atf__info__about-seller", ".x-sellercard-atf__info__about-seller-name"]);
    const image = selectedImage();
    const metaVideo = firstAttr(["meta[property='og:video']", "meta[property='og:video:url']", "meta[property='og:video:secure_url']"], "content");
    const videos = [...document.querySelectorAll("video, video source")].map(mediaUrl)
      .filter((url) => /^https?:\/\//i.test(url));
    if (metaVideo && !videos.includes(metaVideo)) videos.unshift(metaVideo);
    const url = location.href.split("?")[0];
    return {
      title,
      priceText: price,
      seller,
      image,
      images: image ? [image] : [],
      videos: videos.filter((value, index, list) => list.indexOf(value) === index),
      url,
      market: location.hostname
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "MIAN_EXTRACT_LISTING") {
      sendResponse({ok: true, listing: extractListing()});
    }
    if (message?.type === "MIAN_GET_SELECTED_IMAGE") {
      const image = selectedImage();
      sendResponse({ok: Boolean(image), image});
    }
    return true;
  });
})();