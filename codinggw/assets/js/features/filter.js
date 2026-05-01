import { setDataProcessor, clearProcessor } from "../core/vessel.js";

// ==========================
// INIT FILTER
// ==========================
export function initFilter(map) {
  const applyBtn = document.getElementById("apply-filter-btn");
  const dropdownPanel = document.getElementById("dropdown-filter");

  if (!applyBtn) {
    console.error("apply-filter-btn tidak ditemukan");
    return;
  }

  // Hanya urus tombol Apply
  applyBtn.addEventListener("click", () => {
    applyFilter(map);

    // Auto-close: Bantu sidebar.js menutup panel sesudah user selesai menekan apply
    if (dropdownPanel && !dropdownPanel.classList.contains("hidden")) {
      dropdownPanel.classList.add("hidden");
    }
  });
}

// ==========================
// APPLY FILTER (DATA LOGIC & UI FEEDBACK)
// ==========================
export function applyFilter(map) {
  // 1. Ambil nilai dari input HTML
  const type = document.getElementById("shipType")?.value || "";
  const speed = document.getElementById("shipSpeed")?.value || "";
  const status = (
    document.getElementById("shipStatus")?.value || ""
  ).toLowerCase();
  const country = (
    document.getElementById("shipCountry")?.value || ""
  ).toLowerCase();
  const owner = document.getElementById("shipOwner")?.value || "";

  // 2. Ambil elemen UI untuk Indikator Feedback
  const indicator = document.getElementById("filter-active-indicator");
  const filterBtn = document.getElementById("filter-btn");

  // 3. Cek apakah semua kosong (Artinya user me-reset filter / memilih "All")
  const isEmpty =
    type === "" &&
    speed === "" &&
    status === "" &&
    country === "" &&
    owner === "";

  if (isEmpty) {
    clearProcessor(map); // Kembalikan semua data kapal

    // Matikan indikator menyala pada tombol sidebar
    if (indicator) indicator.classList.add("hidden");
    if (filterBtn)
      filterBtn.classList.remove("text-cyan-400", "bg-slate-800/50", "ring-2", "ring-cyan-400");

    showToastAlert("Filter dinonaktifkan. Menampilkan semua kapal.", "normal");
    return;
  }

  // 4. Jika filter digunakan, nyalakan indikator menyala
  if (indicator) indicator.classList.remove("hidden");
  if (filterBtn) filterBtn.classList.add("text-cyan-400", "bg-slate-800/50", "ring-2", "ring-cyan-400");

  showToastAlert("Filter berhasil diterapkan!", "active");

  // ==========================
  // SET DATA PROCESSOR (PIPELINE)
  // ==========================
  setDataProcessor((vessels) => {
    return vessels.filter((ship) => {
      // Normalisasi data kapal
      const shipType = (ship["ship type"] || "").toLowerCase().trim();
      const shipStatus = (ship.status || "").toLowerCase().trim();
      const shipCountry = (ship.country || "").toLowerCase().trim();
      const shipSpeed = parseFloat(ship.speed) || 0;

      // Kondisi Filter
      return (
        (type === "" || shipType === type.toLowerCase()) &&
        (status === "" || shipStatus === status) &&
        (country === "" || shipCountry.includes(country)) &&
        (speed === "" || shipSpeed >= parseFloat(speed)) &&
        (owner === "" || ship.owner === owner)
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
  // Warna berbeda: Cyan untuk filter aktif, Slate untuk filter mati
  const bgColor =
    state === "active" ? "bg-cyan-600" : "bg-slate-800 border border-slate-700";

  toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium transform translate-y-10 opacity-0 transition-all duration-300 flex items-center gap-3`;

  const iconHtml =
    state === "active"
      ? `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>`
      : `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  toast.innerHTML = `${iconHtml} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Animasi masuk
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 10);

  // Animasi keluar otomatis setelah 3 detik
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}