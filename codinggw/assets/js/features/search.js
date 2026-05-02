import { setDataProcessor, clearProcessor } from "../core/vessel.js";
import { showToast } from "../core/utils.js";

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
    showToast(
      "Pencarian dihapus. Menampilkan semua kapal.",
      "normal",
      "search",
    );
    return;
  }

  // Tampilkan Notifikasi Pencarian
  showToast(`Mencari kapal: "${query}"`, "active", "search");

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