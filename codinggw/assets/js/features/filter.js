import { setDataProcessor, clearProcessor } from "../core/vessel.js";

// ==========================
// INIT FILTER
// ==========================

export function initFilter(map) {
  const applyBtn = document.getElementById("apply-filter-btn");

  if (!applyBtn) {
    console.error("apply-filter-btn tidak ditemukan");
    return;
  }

  // klik tombol APPLY
  applyBtn.addEventListener("click", () => {
    applyFilter(map);
  });
}

// ==========================
// APPLY FILTER
// ==========================

export function applyFilter(map) {
  // ambil nilai dari input HTML
  const type = document.getElementById("shipType")?.value || "";
  const speed = document.getElementById("shipSpeed")?.value || "";
  const status = (document.getElementById("shipStatus")?.value || "").toLowerCase();
  const country = (document.getElementById("shipCountry")?.value || "").toLowerCase();
  const owner = document.getElementById("shipOwner")?.value || "";

  // cek apakah semua kosong → reset
  const isEmpty =
    type === "" &&
    speed === "" &&
    status === "" &&
    country === "" &&
    owner === "";

  if (isEmpty) {
    clearProcessor(map);
    return;
  }

  // ==========================
  // SET DATA PROCESSOR (PIPELINE)
  // ==========================

  setDataProcessor((vessels) => {
    return vessels.filter((ship) => {
      // normalisasi data kapal
      const shipType = (ship["ship type"] || "").toLowerCase().trim();
      const shipStatus = (ship.status || "").toLowerCase().trim();
      const shipCountry = (ship.country || "").toLowerCase().trim();
      const shipSpeed = parseFloat(ship.speed) || 0;

      // ==========================
      // KONDISI FILTER
      // ==========================

      return (
        // filter tipe kapal
        (type === "" || shipType === type.toLowerCase()) &&

        // filter status kapal
        (status === "" || shipStatus === status) &&

        // filter negara
        (country === "" || shipCountry.includes(country)) &&

        // filter kecepatan minimum
        (speed === "" || shipSpeed >= parseFloat(speed)) &&

        // filter owner
        (owner === "" || ship.owner === owner)
      );
    });
  }, map);
}