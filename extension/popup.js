let current = null;
const status = document.getElementById("status");
const preview = document.getElementById("preview");
const source = document.getElementById("source");

function render(product) {
  current = product;
  preview.innerHTML = product.image
    ? '<img class="thumb" src="' + product.image.replace(/"/g, "&quot;") + '"><div class="meta"><b>' + (product.title || "Untitled") + '</b><span>' + (product.priceText || "") + '</span></div>'
    : '<div class="meta"><b>' + (product.title || "Untitled") + '</b><span>' + (product.priceText || "") + '</span></div>';
  source.disabled = !product.title;
}

document.getElementById("hunt").addEventListener("click", async () => {
  status.textContent = "Reading current eBay listing…";
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, {type: "MIAN_EXTRACT_LISTING"}, async (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      status.textContent = "Open an eBay listing page first.";
      return;
    }
    render(response.listing);
    chrome.runtime.sendMessage({type: "MIAN_SAVE_PRODUCT", product: response.listing}, (saved) => {
      status.textContent = saved?.ok ? "Listing captured and saved." : "Captured, but save failed.";
    });
  });
});

source.addEventListener("click", () => {
  if (!current?.title) return;
  const url = "https://www.aliexpress.com/w/wholesale-" + encodeURIComponent(current.title.trim().replace(/\s+/g, "-")) + ".html";
  chrome.tabs.create({url});
});