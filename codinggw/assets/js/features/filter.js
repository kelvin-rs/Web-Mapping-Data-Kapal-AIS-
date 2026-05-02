import { setDataProcessor, clearProcessor } from "../core/vessel.js";
import { showToast } from "../core/utils.js";

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

    showToast("Filter dinonaktifkan. Menampilkan semua kapal.", "normal", "filter");
    return;
  }

  // 4. Jika filter digunakan, nyalakan indikator menyala
  if (indicator) indicator.classList.remove("hidden");
  if (filterBtn) filterBtn.classList.add("text-cyan-400", "bg-slate-800/50", "ring-2", "ring-cyan-400");

  showToast("Filter berhasil diterapkan!", "active", "filter");

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