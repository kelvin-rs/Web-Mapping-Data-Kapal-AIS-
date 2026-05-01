import { setDataProcessor, clearProcessor } from "../core/vessel.js";

// ==========================
// INIT SEARCH
// ==========================
export function initSearch(map) {
  const input = document.getElementById("search-input");
  const btn = document.getElementById("search-btn");
  const clearBtn = document.getElementById("search-clear-btn");

  if (!input || !btn) {
    console.error("Search input / button tidak ditemukan");
    return;
  }

  // Timer untuk fitur Auto-Search (Debounce)
  let debounceTimer;

  // ==========================
  // EVENT: KETIKA PENGGUNA MENGETIK (REAL-TIME)
  // ==========================
  input.addEventListener("input", (e) => {
    const val = e.target.value.trim();

    // 1. Munculkan/Sembunyikan tombol "X"
    if (val.length > 0) {
      clearBtn?.classList.remove("hidden");
    } else {
      clearBtn?.classList.add("hidden");
    }

    // 2. Auto-Search cerdas (Tunggu 700ms setelah selesai ngetik baru cari)
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      applySearch(map, val);
    }, 700);
  });

  // ==========================
  // EVENT: TOMBOL CLEAR (X) DIKLIK
  // ==========================
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.classList.add("hidden");
      applySearch(map, ""); // Reset pencarian
      input.focus(); // Kembalikan kursor ke input
    });
  }

  // ==========================
  // EVENT: ENTER KEY & BUTTON CLICK (Pencarian Instan)
  // ==========================
  btn.addEventListener("click", () => {
    clearTimeout(debounceTimer);
    applySearch(map, input.value);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(debounceTimer);
      applySearch(map, input.value);
    }
  });
}

// ==========================
// APPLY SEARCH & NOTIFIKASI
// ==========================
function applySearch(map, keyword) {
  const query = (keyword || "").toLowerCase().trim();

  // JIKA INPUT KOSONG → Reset
  if (query === "") {
    clearProcessor(map);
    showToastAlert("Pencarian dihapus. Menampilkan semua kapal.", "normal");
    return;
  }

  // Tampilkan Notifikasi Pencarian
  showToastAlert(`Mencari kapal: "${query}"`, "active");

  // ==========================
  // SET PROCESSOR (PIPELINE)
  // ==========================
  setDataProcessor((vessels) => {
    return vessels.filter((ship) => {
      const mmsi = ship.mmsi ? ship.mmsi.toString() : "";
      const name = (ship.name || "").toLowerCase();
      const type = (ship["ship type"] || "").toLowerCase();
      const country = (ship.country || "").toLowerCase();
      const status = (ship.status || "").toLowerCase();
      const owner = (ship.owner || "").toLowerCase();

      // Cek apakah query ada di salah satu data
      return (
        mmsi.includes(query) ||
        name.includes(query) ||
        type.includes(query) ||
        country.includes(query) ||
        status.includes(query) ||
        owner.includes(query)
      );
    });
  }, map);
}

// ==========================
// TOAST ALERT NOTIFICATION
// ==========================
function showToastAlert(message, state) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className =
      "fixed bottom-20 right-3 z-[9999] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  const bgColor =
    state === "active" ? "bg-cyan-600" : "bg-slate-800 border border-slate-700";

  toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium transform translate-y-10 opacity-0 transition-all duration-300 flex items-center gap-3`;

  const iconHtml =
    state === "active"
      ? `<svg class="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`
      : `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;

  toast.innerHTML = `${iconHtml} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, 2500); // 2.5 detik agar tidak terlalu lama menumpuk
}