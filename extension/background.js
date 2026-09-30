const safeName = (value = "eBay Product") => String(value)
  .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 120) || "eBay Product";

const extensionFor = (url, fallback) => {
  try {
    const path = new URL(url).pathname.toLowerCase();
    const match = path.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)(?:$|\?)/);
    return match ? "." + match[1] : fallback;
  } catch {
    return fallback;
  }
};

const downloadMedia = (product, kind, urls, sendResponse) => {
  const unique = [...new Set((urls || []).filter((url) => /^https?:\/\//i.test(url)))];
  if (!unique.length) {
    sendResponse({ok: false, error: "No " + kind + " media was found on this listing."});
    return;
  }
  const folder = safeName(product?.title);
  let completed = 0;
  let failed = 0;
  unique.forEach((url, index) => {
    const fallback = kind === "video" ? ".mp4" : ".jpg";
    const mediaFolder = kind === "video" ? "Videos" : "Images";
    const name = folder + "/" + mediaFolder + "/" + String(index + 1).padStart(2, "0") + "-" + (kind === "video" ? "video" : "image") + extensionFor(url, fallback);
    chrome.downloads.download({url, filename: name, conflictAction: "uniquify", saveAs: false}, (downloadId) => {
      if (chrome.runtime.lastError || downloadId === undefined) failed++;
      completed++;
      if (completed === unique.length) sendResponse({ok: failed === 0, count: completed - failed, failed});
    });
  });
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "MIAN_SAVE_PRODUCT") {
    chrome.storage.local.get({products: []}, (state) => {
      const products = state.products.filter((item) => item.url !== message.product.url);
      products.unshift({...message.product, savedAt: new Date().toISOString()});
      chrome.storage.local.set({products}, () => sendResponse({ok: true, count: products.length}));
    });
    return true;
  }

  if (message?.type === "MIAN_DOWNLOAD_MEDIA") {
    downloadMedia(message.product, message.kind, message.urls, sendResponse);
    return true;
  }
});