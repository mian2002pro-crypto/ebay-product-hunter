let current = null;
const status = document.getElementById("status");
const preview = document.getElementById("preview");
const source = document.getElementById("source");
const downloadPictures = document.getElementById("download-pictures");
const downloadVideo = document.getElementById("download-video");
const mediaStatus = document.getElementById("media-status");
const supplierSearch = document.getElementById("supplier-search");
const openSupplier = document.getElementById("open-supplier");
const hunterTab = document.getElementById("hunter-tab");
const sourcerTab = document.getElementById("sourcer-tab");
const hunterView = document.getElementById("hunter-view");
const sourcerView = document.getElementById("sourcer-view");

function setView(view) {
  const hunter = view === "hunter";
  hunterView.hidden = !hunter;
  sourcerView.hidden = hunter;
  hunterTab.classList.toggle("active", hunter);
  sourcerTab.classList.toggle("active", !hunter);
}

function isAliProduct(product) {
  return product?.source === "AliExpress" || product?.market === "aliexpress.com";
}

function render(product) {
  current = product;
  const images = product.images || (product.image ? [product.image] : []);
  const videos = product.videos || [];
  const ali = isAliProduct(product);
  const pictureText = ali
    ? images.length + " product/gallery/variation picture(s) ready"
    : "Selected picture ready";
  preview.innerHTML = product.image
    ? '<img class="thumb" src="' + product.image.replace(/"/g, "&quot;") + '"><div class="meta"><b>' + (product.title || "Untitled") + '</b><span>' + (product.priceText || "") + '</span><small>' + pictureText + ' · ' + videos.length + ' video(s) found</small></div>'
    : '<div class="meta"><b>' + (product.title || "Untitled") + '</b><span>' + (product.priceText || "") + '</span><small>' + pictureText + ' · ' + videos.length + ' video(s) found</small></div>';

  source.disabled = !product.title;
  downloadPictures.disabled = images.length === 0;
  downloadVideo.disabled = videos.length === 0;
  downloadPictures.textContent = ali ? "Download All Product Pictures" : "Download Selected Picture";
  supplierSearch.innerHTML = product.title
    ? '<div class="supplier-card"><b>' + product.title.replace(/</g, "&lt;") + '</b><span>AliExpress Web Search</span><small>Supplier price not verified</small></div>'
    : '<div class="supplier-card"><span>Capture an eBay or AliExpress product first.</span></div>';
  openSupplier.disabled = !product.title;
}

function requestDownload(kind, urls) {
  if (!current || !urls?.length) {
    mediaStatus.textContent = "No " + kind + " media is available for this product.";
    return;
  }
  mediaStatus.textContent = "Starting " + kind + " download…";
  chrome.runtime.sendMessage({type: "MIAN_DOWNLOAD_MEDIA", product: current, kind, urls}, (result) => {
    if (chrome.runtime.lastError || !result?.ok) {
      mediaStatus.textContent = result?.error || "Some media could not be downloaded.";
      return;
    }
    mediaStatus.textContent = result.count + " " + kind + " file(s) sent to your Downloads folder.";
  });
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  return tab;
}

function isAliExpressProduct(tab) {
  return Boolean(tab?.url && /^https:\/\/www\.aliexpress\.com\/item\//i.test(tab.url));
}

async function captureEbay(tab) {
  status.textContent = "Reading the currently selected eBay picture…";
  chrome.tabs.sendMessage(tab.id, {type: "MIAN_EXTRACT_LISTING"}, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      status.textContent = "Open an eBay listing page first.";
      return;
    }
    render(response.listing);
    chrome.runtime.sendMessage({type: "MIAN_SAVE_PRODUCT", product: response.listing}, (saved) => {
      status.textContent = saved?.ok ? "eBay listing captured with the selected picture." : "Captured, but save failed.";
    });
  });
}

async function captureAliExpress(tab) {
  status.textContent = "Reading all pictures and videos for this AliExpress product…";
  chrome.tabs.sendMessage(tab.id, {type: "MIAN_EXTRACT_ALI_PRODUCT"}, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      status.textContent = response?.error || "Could not read this AliExpress product.";
      return;
    }
    render(response.product);
    chrome.runtime.sendMessage({type: "MIAN_SAVE_PRODUCT", product: response.product}, (saved) => {
      status.textContent = saved?.ok
        ? "AliExpress product captured: all product pictures and detected videos are ready."
        : "Captured, but save failed.";
    });
  });
}

document.getElementById("hunt").addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  if (isAliExpressProduct(tab)) {
    captureAliExpress(tab);
    return;
  }
  captureEbay(tab);
});

downloadPictures.addEventListener("click", async () => {
  if (isAliProduct(current)) {
    requestDownload("picture", current.images || []);
    return;
  }

  const tab = await getActiveTab();
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, {type: "MIAN_GET_SELECTED_IMAGE"}, (response) => {
    if (chrome.runtime.lastError || !response?.ok || !response.image) {
      mediaStatus.textContent = "Select/open a picture on eBay first.";
      return;
    }
    current = {...current, image: response.image, images: [response.image]};
    render(current);
    requestDownload("picture", [response.image]);
  });
});

downloadVideo.addEventListener("click", () => requestDownload("video", current?.videos || []));

function openAliExpress() {
  if (!current?.title) return;
  const url = "https://www.aliexpress.com/w/wholesale-" + encodeURIComponent(current.title.trim().replace(/\s+/g, "-")) + ".html";
  chrome.tabs.create({url});
}

source.addEventListener("click", () => { setView("sourcer"); });
openSupplier.addEventListener("click", openAliExpress);
hunterTab.addEventListener("click", () => setView("hunter"));
sourcerTab.addEventListener("click", () => setView("sourcer"));