import { toggleMeasure } from "./measure.js";

export function initSidebar(map) {
  // FILTER BUTTON
  const filterBtn = document.getElementById("filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", toggleFilter);
  }

  // WEATHER BUTTON
  const weatherBtn = document.getElementById("weather-btn");
  if (weatherBtn) {
    weatherBtn.addEventListener("click", toggleWeather);
  }

  // MEASURE DISTANCE BUTTON
  const distanceBtn = document.getElementById("distance-btn");
  if (distanceBtn) {
    distanceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMeasure(map);
    });
  }
}

// DROPDOWN LOGIC
function closeAllDropdowns(exceptId) {
  const dropdowns = document.querySelectorAll(
    ".dropdown-filter, .weather-legend, .dropdown-ship-types, .stats-section",
  );

  dropdowns.forEach((dropdown) => {
    if (dropdown.id !== exceptId) {
      dropdown.style.display = "none";
    }
  });
}

// FILTER DROPDOWN
export function toggleFilter() {
  closeAllDropdowns("dropdown-filter");

  const dropdown = document.getElementById("dropdown-filter");
  if (!dropdown) return;

  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// WEATHER DROPDOWN
export function toggleWeather() {
  closeAllDropdowns("weather-legends");

  const dropdown = document.getElementById("weather-legends");
  if (!dropdown) return;

  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}
