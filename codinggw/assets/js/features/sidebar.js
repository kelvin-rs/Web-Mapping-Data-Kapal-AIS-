import { toggleMeasure } from "./measure.js";

export function initSidebar(map) {
  // 1. AMBIL ELEMEN TOMBOL & PANEL
  const filterBtn = document.getElementById("filter-btn");
  const weatherBtn = document.getElementById("weather-btn");
  const distanceBtn = document.getElementById("distance-btn");
  const filterDropdown = document.getElementById("dropdown-filter");
  const weatherDropdown = document.getElementById("weather-legends");

  // 2. AMBIL ELEMEN PEMBUNGKUS LI UNTUK MANAJEMEN VISIBILITAS
  const menuPeta = document.getElementById("menu-peta");
  const menuDashboard = document.getElementById("menu-dashboard");
  const menuFilter = document.getElementById("menu-filter");
  const menuWeather = document.getElementById("menu-weather");
  const menuMeasure = document.getElementById("menu-measure");

  // ==========================================
  // LOGIKA CONTEXT-AWARE (Deteksi Halaman)
  // ==========================================
  if (map) {
    // ---- MODE HALAMAN PETA (index.html) ----
    menuPeta?.classList.add("hidden"); // Sembunyikan tombol Peta
    menuDashboard?.classList.remove("hidden"); // Tampilkan tombol Dashboard
    menuFilter?.classList.remove("hidden"); // Tampilkan fitur Map
    menuWeather?.classList.remove("hidden"); // Tampilkan fitur Map
    menuMeasure?.classList.remove("hidden"); // Tampilkan fitur Map
  } else {
    // ---- MODE HALAMAN DASHBOARD (dashboard.html) ----
    menuPeta?.classList.remove("hidden"); // Tampilkan tombol kembali ke Peta
    menuDashboard?.classList.add("hidden"); // Sembunyikan tombol Dashboard
    menuFilter?.classList.add("hidden"); // Sembunyikan fitur Map
    menuWeather?.classList.add("hidden"); // Sembunyikan fitur Map
    menuMeasure?.classList.add("hidden"); // Sembunyikan fitur Map
  }

  // ==========================================
  // EVENT LISTENERS BAWAAN SIDEBAR
  // ==========================================

  function closeAll() {
    filterDropdown?.classList.add("hidden");
    weatherDropdown?.classList.add("hidden");
  }

  // Hanya jalankan event listener jika tombolnya memang ada (untuk mencegah error di dashboard)
  if (filterBtn) {
    filterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = !filterDropdown.classList.contains("hidden");
      closeAll();
      if (!isOpen) filterDropdown.classList.remove("hidden");
    });
  }

  if (weatherBtn) {
    weatherBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = !weatherDropdown.classList.contains("hidden");
      closeAll();
      if (!isOpen) weatherDropdown.classList.remove("hidden");
    });
  }

  if (distanceBtn && map) {
    distanceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMeasure(map);
    });
  }

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest("#filter-btn") &&
      !e.target.closest("#dropdown-filter") &&
      !e.target.closest("#weather-btn") &&
      !e.target.closest("#weather-legends")
    ) {
      closeAll();
    }
  });
}