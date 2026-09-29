chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "MIAN_SAVE_PRODUCT") {
    chrome.storage.local.get({products: []}, (state) => {
      const products = state.products.filter((item) => item.url !== message.product.url);
      products.unshift({...message.product, savedAt: new Date().toISOString()});
      chrome.storage.local.set({products}, () => sendResponse({ok: true, count: products.length}));
    });
    return true;
  }
});