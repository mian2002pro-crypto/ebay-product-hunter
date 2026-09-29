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

  function extractListing() {
    const title = firstText(["h1.x-item-title__mainTitle span", "h1.x-item-title__mainTitle", "h1"]);
    const price = firstText(["div.x-price-primary span", ".x-price-primary"]);
    const seller = firstText([".x-sellercard-atf__info__about-seller", ".x-sellercard-atf__info__about-seller-name"]);
    const image = firstAttr(["div.ux-image-carousel-item.active img", ".ux-image-carousel-item img", "img"], "src")
      || firstAttr(["meta[property='og:image']"], "content");
    const url = location.href.split("?")[0];
    return {
      title,
      priceText: price,
      seller,
      image,
      url,
      market: location.hostname
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "MIAN_EXTRACT_LISTING") {
      sendResponse({ok: true, listing: extractListing()});
    }
    return true;
  });
})();