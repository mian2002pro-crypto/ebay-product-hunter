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

function render(product) {
  current = product;
  const images = product.images || (product.image ? [product.image] : []);
  const videos = product.videos || [];
  preview.innerHTML = product.image
    ? '<img class="thumb" src="' + product.image.replace(/"/g, "&quot;") + '"><div class="meta"><b>' + (product.title || "Untitled") + '</b><span>' + (product.priceText || "") + '</span><small>' + images.length + ' picture(s) found · ' + videos.length + ' video(s) found</small></div>'
    : '<div class="meta"><b>' + (product.title || "Untitled") + '</b><span>' + (product.priceText || "") + '</span><small>' + images.length + ' picture(s) found · ' + videos.length + ' video(s) found</small></div>';
  source.disabled = !product.title;
  downloadPictures.disabled = !images.length;
  downloadVideo.disabled = !videos.length;
  supplierSearch.innerHTML = product.title
    ? '<div class="supplier-card"><b>' + product.title.replace(/</g, "&lt;") + '</b><span>AliExpress Web Search</span><small>Supplier price not verified</small></div>'
    : '<div class="supplier-card"><span>Capture an eBay listing first.</span></div>';
  openSupplier.disabled = !product.title;
}

function requestDownload(kind, urls) {
  if (!current || !urls?.length) return;
  mediaStatus.textContent = "Starting " + kind + " download…";
  chrome.runtime.sendMessage({type: "MIAN_DOWNLOAD_MEDIA", product: current, kind, urls}, (result) => {
    if (chrome.runtime.lastError || !result?.ok) {
      mediaStatus.textContent = result?.error || "Some media could not be downloaded.";
      return;
    }
    mediaStatus.textContent = result.count + " " + kind + " file(s) sent to your Downloads folder.";
  });
}

document.getElementById("hunt").addEventListener("click", async () => {
  status.textContent = "Reading current eBay listing…";
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, {type: "MIAN_EXTRACT_LISTING"}, (response) => {
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

downloadPictures.addEventListener("click", () => requestDownload("picture", current?.images || []));
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