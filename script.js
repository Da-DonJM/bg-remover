// ClearCut uses the open-source @imgly/background-removal browser library.
// The library and AI model are downloaded from a CDN the first time you use it.
const $ = (id) => document.getElementById(id);

const dropZone = $("dropZone");
const fileInput = $("fileInput");
const chooseBtn = $("chooseBtn");
const editor = $("editor");
const originalPreview = $("originalPreview");
const resultPreview = $("resultPreview");
const resultPlaceholder = $("resultPlaceholder");
const fileInfo = $("fileInfo");
const removeBtn = $("removeBtn");
const downloadBtn = $("downloadBtn");
const resetBtn = $("resetBtn");
const statusBox = $("status");
const progressTrack = $("progressTrack");

let currentFile = null;
let originalUrl = null;
let resultUrl = null;
let resultBlob = null;
let removeBackgroundFn = null;

function setStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`.trim();
}
function revokeUrl(url) {
  if (url) URL.revokeObjectURL(url);
}
function clearResult() {
  revokeUrl(resultUrl);
  resultUrl = null;
  resultBlob = null;
  resultPreview.removeAttribute("src");
  resultPreview.classList.add("hidden");
  resultPlaceholder.classList.remove("hidden");
  downloadBtn.disabled = true;
}
function openFile(file) {
  if (!file) return;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    setStatus("Please select a JPG, PNG, or WebP image.", "error");
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    setStatus("This starter app supports files up to 25 MB. Please choose a smaller image.", "error");
    return;
  }
  currentFile = file;
  revokeUrl(originalUrl);
  originalUrl = URL.createObjectURL(file);
  originalPreview.src = originalUrl;
  fileInfo.textContent = `${file.name} · ${formatBytes(file.size)}`;
  clearResult();
  dropZone.classList.add("hidden");
  editor.classList.remove("hidden");
  setStatus("Ready when you are.");
}
function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function safeFilename(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "_") || "image";
}

chooseBtn.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("click", (event) => {
  if (event.target !== chooseBtn) fileInput.click();
});
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener("change", (event) => {
  openFile(event.target.files?.[0]);
  fileInput.value = "";
});
["dragenter", "dragover"].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", (event) => openFile(event.dataTransfer?.files?.[0]));

resetBtn.addEventListener("click", () => {
  currentFile = null;
  clearResult();
  revokeUrl(originalUrl);
  originalUrl = null;
  editor.classList.add("hidden");
  dropZone.classList.remove("hidden");
  setStatus("");
});

removeBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  removeBtn.disabled = true;
  downloadBtn.disabled = true;
  progressTrack.classList.remove("hidden");
  setStatus("Loading the background-removal AI and processing your image. The first run can take a little longer.");
  try {
    if (!removeBackgroundFn) {
      const module = await import("https://esm.sh/@imgly/background-removal@1.5.5");
      removeBackgroundFn = module.removeBackground;
      if (typeof removeBackgroundFn !== "function") {
        throw new Error("The background-removal library did not load correctly.");
      }
    }
    const blob = await removeBackgroundFn(currentFile, {
      output: { format: "image/png", quality: 1 }
    });
    clearResult();
    resultBlob = blob;
    resultUrl = URL.createObjectURL(blob);
    resultPreview.src = resultUrl;
    resultPreview.classList.remove("hidden");
    resultPlaceholder.classList.add("hidden");
    downloadBtn.disabled = false;
    setStatus("Background removed. Check the edges, then download your transparent PNG.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Could not process this image. Check your internet connection, try a smaller image, or open the app using a local web server. Details: " + (error?.message || "unknown error"), "error");
  } finally {
    removeBtn.disabled = false;
    progressTrack.classList.add("hidden");
  }
});

downloadBtn.addEventListener("click", () => {
  if (!resultBlob || !currentFile) return;
  const link = document.createElement("a");
  link.href = resultUrl;
  link.download = `${safeFilename(currentFile.name)}_no_background.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
});
window.addEventListener("beforeunload", () => {
  revokeUrl(originalUrl);
  revokeUrl(resultUrl);
});
