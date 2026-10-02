let book = null;
let rendition = null;
let fontSize = 100;
let opening = false;

const $ = id => document.getElementById(id);
const state = $("readerState");

function showState(title, message) {
  state.style.display = "grid";
  state.innerHTML = `<div><strong>${title}</strong><p>${message}</p></div>`;
}
function hideState() { state.style.display = "none"; }

async function openBook() {
  if (opening) return;
  if (rendition) {
    $("reader").scrollIntoView({behavior:"smooth"});
    return;
  }

  opening = true;
  $("openBook").disabled = true;
  $("openBook").textContent = "Đang mở sách…";
  $("reader").scrollIntoView({behavior:"smooth"});
  showState("Đang mở sách…", "Ta đang chuẩn bị trang đọc.");

  try {
    if (typeof window.ePub !== "function") {
      throw new Error("Thư viện đọc EPUB chưa tải. Hãy kiểm tra kết nối mạng rồi thử lại.");
    }

    // Tải EPUB thành ArrayBuffer rồi mở bằng API open().
    // Cách này tương thích tốt hơn với Safari/iPhone so với truyền
    // ArrayBuffer trực tiếp vào constructor của epub.js.
    const response = await fetch("./phia-sau-buc-tuong.epub", {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error(`Không tải được EPUB (HTTP ${response.status})`);
    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength) throw new Error("Tệp EPUB rỗng.");

    book = window.ePub();
    await book.open(buffer, "epub");

    rendition = book.renderTo("viewer", {
      width: "100%",
      height: "100%",
      spread: "none",
      flow: "paginated",
      manager: "default"
    });

    rendition.themes.fontSize(fontSize + "%");
    rendition.on("relocated", updateLocation);

    await rendition.display();
    await loadToc();
    updateLocation();
    hideState();
    $("openBook").textContent = "✓ ĐANG ĐỌC";
  } catch (err) {
    console.error("Gò Cao EPUB error:", err);
    book = null;
    rendition = null;
    const detail = err && err.message ? err.message : String(err);
    showState("Chưa thể mở sách", `Có lỗi khi tải trình đọc: ${detail}`);
    $("openBook").disabled = false;
    $("openBook").textContent = "▣  ĐỌC SÁCH";
  } finally {
    opening = false;
  }
}

async function loadToc() {
  const toc = $("toc");
  toc.innerHTML = "";
  try {
    const nav = await book.loaded.navigation;
    const items = nav.toc || [];
    if (!items.length) {
      toc.innerHTML = '<div class="muted">Mục lục đang được tải.</div>';
      return;
    }
    renderToc(items, toc);
  } catch (e) {
    toc.innerHTML = '<div class="muted">Không tải được mục lục.</div>';
  }
}

function renderToc(items, parent) {
  items.forEach(item => {
    const a = document.createElement("a");
    a.textContent = item.label;
    a.href = "#";
    a.onclick = async e => {
      e.preventDefault();
      if (rendition) await rendition.display(item.href);
    };
    parent.appendChild(a);
    if (item.subitems && item.subitems.length) renderToc(item.subitems, parent);
  });
}

function updateLocation() {
  if (!rendition) return;
  const loc = rendition.currentLocation();
  const start = loc && loc.start;
  if (start && start.displayed) {
    $("location").textContent = `Trang ${start.displayed.page || "—"} / ${start.displayed.total || "—"}`;
  } else {
    $("location").textContent = "Đang đọc";
  }
}

async function jump(n) {
  if (!rendition) return;
  for (let i = 0; i < 10; i++) {
    if (n > 0) await rendition.next();
    else await rendition.prev();
  }
}

$("openBook").onclick = openBook;
$("next").onclick = () => rendition && rendition.next();
$("prev").onclick = () => rendition && rendition.prev();
$("forward10").onclick = () => jump(1);
$("back10").onclick = () => jump(-1);

$("fontPlus").onclick = () => {
  if (!rendition) return;
  fontSize = Math.min(160, fontSize + 10);
  rendition.themes.fontSize(fontSize + "%");
};
$("fontMinus").onclick = () => {
  if (!rendition) return;
  fontSize = Math.max(70, fontSize - 10);
  rendition.themes.fontSize(fontSize + "%");
};
