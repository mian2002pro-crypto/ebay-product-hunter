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

function sendTabMessage(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ok: false, error: chrome.runtime.lastError.message});
        return;
      }
      resolve(response || {ok: false, error: "No response from the page."});
    });
  });
}

function isAliExpressProduct(tab) {
  return Boolean(tab?.url && /^https:\/\/www\.aliexpress\.com\/item\//i.test(tab.url));
}

async function captureEbay(tab) {
  status.textContent = "Reading the currently selected eBay picture…";
  const response = await sendTabMessage(tab.id, {type: "MIAN_EXTRACT_LISTING"});
  if (!response?.ok) {
    status.textContent = "Open an eBay listing page first.";
    return;
  }
  render(response.listing);
  chrome.runtime.sendMessage({type: "MIAN_SAVE_PRODUCT", product: response.listing}, (saved) => {
    status.textContent = saved?.ok ? "eBay listing captured with the selected picture." : "Captured, but save failed.";
  });
}

async function captureAliExpress(tab) {
  status.textContent = "Reading all product pictures and videos…";
  const response = await sendTabMessage(tab.id, {type: "MIAN_EXTRACT_ALI_PRODUCT"});
  if (!response?.ok) {
    status.textContent = response?.error || "Could not read this AliExpress product.";
    return;
  }
  render(response.product);
  chrome.runtime.sendMessage({type: "MIAN_SAVE_PRODUCT", product: response.product}, (saved) => {
    status.textContent = saved?.ok
      ? "AliExpress product captured: all product pictures and detected videos are ready."
      : "Captured, but save failed.";
  });
}

(async () => {
  const tab = await getActiveTab();
  if (isAliExpressProduct(tab)) {
    status.textContent = "AliExpress product detected. You can download pictures or video directly — no capture or sourcing required.";
    downloadPictures.textContent = "Download All Product Pictures";
    downloadVideo.textContent = "Download Product Video";
  }
})();

document.getElementById("hunt").addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  if (isAliExpressProduct(tab)) {
    captureAliExpress(tab);
    return;
  }
  captureEbay(tab);
});

async function prepareDirectMediaProduct(tab) {
  if (!tab?.id) return null;

  const ali = isAliExpressProduct(tab);
  const messageType = ali ? "MIAN_EXTRACT_ALI_PRODUCT" : "MIAN_EXTRACT_LISTING";
  mediaStatus.textContent = ali
    ? "Reading AliExpress product media directly…"
    : "Reading eBay listing media directly…";

  const response = await sendTabMessage(tab.id, {type: messageType});
  if (!response?.ok) {
    mediaStatus.textContent = response?.error || "Could not read media from this page.";
    return null;
  }

  const product = ali ? response.product : response.listing;
  current = product;
  render(product);
  return product;
}

downloadPictures.addEventListener("click", async () => {
  const tab = await getActiveTab();
  const pageUrl = tab?.url ? tab.url.split("?")[0] : "";
  let product = current;
  const samePage = Boolean(product?.url && pageUrl && product.url === pageUrl);

  if (!samePage) {
    product = await prepareDirectMediaProduct(tab);
  }

  if (isAliProduct(product)) {
    if (product.images?.length) {
      requestDownload("picture", product.images);
    } else {
      mediaStatus.textContent = "No AliExpress product pictures were detected.";
    }
    return;
  }

  const direct = product?.image ? product : await prepareDirectMediaProduct(tab);
  if (!direct?.image) {
    mediaStatus.textContent = "No eBay product picture was detected.";
    return;
  }

  current = {...direct, image: direct.image, images: [direct.image]};
  render(current);
  requestDownload("picture", [direct.image]);
});

downloadVideo.addEventListener("click", async () => {
  const tab = await getActiveTab();
  const pageUrl = tab?.url ? tab.url.split("?")[0] : "";
  let product = current;
  const samePage = Boolean(product?.url && pageUrl && product.url === pageUrl);

  if (!samePage) {
    product = await prepareDirectMediaProduct(tab);
  }

  if (!product?.videos?.length) {
    mediaStatus.textContent = "No downloadable product video was detected on this page.";
    return;
  }

  requestDownload("video", product.videos);
});

function openAliExpress() {
  if (!current?.title) return;
  const url = "https://www.aliexpress.com/w/wholesale-" + encodeURIComponent(current.title.trim().replace(/\s+/g, "-")) + ".html";
  chrome.tabs.create({url});
}

source.addEventListener("click", () => { setView("sourcer"); });
openSupplier.addEventListener("click", openAliExpress);
hunterTab.addEventListener("click", () => setView("hunter"));
sourcerTab.addEventListener("click", () => setView("sourcer"));