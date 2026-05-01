import { getVessels } from "./api.js";
import { updateTracksIfActive } from "../features/pastTrack.js";
import { renderVesselsToMap } from "../features/vesselMarker.js"; // Memanggil fungsi gambar

// ==========================================
// 1. STATE & GLOBAL VARIABLES
// ==========================================
let vesselHistory = {};
let lastVessels = [];
let dataProcessor = null;

// ==========================================
// 2. LOGIKA HISTORY DATA
// ==========================================
function saveVesselHistory(mmsi, lat, lon, waktu) {
  if (!vesselHistory[mmsi]) vesselHistory[mmsi] = [];
  vesselHistory[mmsi].push({ lat, lon, waktu });

  if (vesselHistory[mmsi].length > 50) {
    vesselHistory[mmsi].shift();
  }
}

// ==========================================
// 3. PIPELINE PEMROSESAN DATA
// ==========================================
function processAndRender(map) {
  // Lakukan filter jika processor aktif, jika tidak, pakai semua data
  let vessels =
    typeof dataProcessor === "function"
      ? dataProcessor(lastVessels)
      : lastVessels;

  // Simpan history sebelum dikirim ke UI
  vessels.forEach((v) => {
    if (v.lat && v.lon) saveVesselHistory(v.mmsi, v.lat, v.lon, v.waktu);
  });

  // Kirim data ke File UI Marker
  renderVesselsToMap(map, vessels);

  // Perbarui garis jejak masa lalu
  updateTracksIfActive();
}

// ==========================================
// 4. FUNGSI EKSPOR UNTUK KOMPONEN LAIN
// ==========================================
export function setDataProcessor(fn, map) {
  dataProcessor = fn;
  processAndRender(map);
}

export function clearProcessor(map) {
  dataProcessor = null;
  processAndRender(map);
}

export function getLastVessels() {
  return lastVessels;
}

export function getVesselHistory() {
  return vesselHistory;
}

export function startVesselPolling(map) {
  async function poll() {
    try {
      const data = await getVessels();
      if (data.vessels && Array.isArray(data.vessels)) {
        lastVessels = data.vessels;
        processAndRender(map);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
    setTimeout(poll, 5000);
  }
  poll();
}