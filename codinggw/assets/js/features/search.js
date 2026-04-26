import { setDataProcessor, clearProcessor } from "../core/vessel.js";

// ==========================
// INIT SEARCH
// ==========================

export function initSearch(map) {
  const input = document.getElementById("search-input");
  const btn = document.getElementById("search-btn");

  if (!input || !btn) {
    console.error("Search input / button tidak ditemukan");
    return;
  }

  // ==========================
  // EVENT: BUTTON CLICK
  // ==========================

  btn.addEventListener("click", () => {
    applySearch(map, input.value);
  });

  // ==========================
  // EVENT: ENTER KEY
  // ==========================

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch(map, input.value);
    }
  });
}

// ==========================
// APPLY SEARCH
// ==========================

function applySearch(map, keyword) {
  const query = (keyword || "").toLowerCase().trim();

  // kosong → reset ke semua data
  if (query === "") {
    clearProcessor(map);
    return;
  }

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