import { toggleMeasure } from "./measure.js";

export function initSidebar(map) {
  const filterBtn = document.getElementById("filter-btn");
  const weatherBtn = document.getElementById("weather-btn");
  const distanceBtn = document.getElementById("distance-btn");

  const filterDropdown = document.getElementById("dropdown-filter");
  const weatherDropdown = document.getElementById("weather-legends");

  // FUNCTION TUTUP SEMUA
  function closeAll() {
    filterDropdown?.classList.add("hidden");
    weatherDropdown?.classList.add("hidden");
  }

  // FILTER
  filterBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = !filterDropdown.classList.contains("hidden");
    closeAll();

    if (!isOpen) {
      filterDropdown.classList.remove("hidden");
    }
  });

  // WEATHER
  weatherBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = !weatherDropdown.classList.contains("hidden");
    closeAll();

    if (!isOpen) {
      weatherDropdown.classList.remove("hidden");
    }
  });

  // MEASURE
  distanceBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMeasure(map);
  });

  // CLICK DI LUAR → TUTUP
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