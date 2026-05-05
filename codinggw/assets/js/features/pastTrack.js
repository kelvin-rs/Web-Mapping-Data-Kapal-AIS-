import { fetchVesselHistory } from "../core/api.js";
import { showToast } from "../core/utils.js";

let trackLayerGroup = null;
let activeTrackMMSI = null; // HANYA MENYIMPAN 1 KAPAL

export function initPastTrack(map) {
  trackLayerGroup = L.layerGroup().addTo(map);

  // Fungsi Global untuk atribut onclick di HTML
  window.toggleVesselTrack = async function (mmsi) {
    const mmsiStr = String(mmsi);

    if (activeTrackMMSI === mmsiStr) {
      activeTrackMMSI = null;
      trackLayerGroup.clearLayers();
      showToast("Lintasan pelayaran ditutup.", "normal", "info");
    } else {
      activeTrackMMSI = mmsiStr;
      showToast("Menampilkan jejak pelayaran kapal...", "info", "info");
      await redrawActiveTracks();
    }

    if (typeof window.closeVesselPanel === "function") {
      window.closeVesselPanel();
    }
  };
}

// Mengecek apakah sebuah kapal sedang aktif (Untuk merender warna tombol)
export function isPastTrackActive(mmsi) {
  return activeTrackMMSI === String(mmsi);
}

export async function updateTracksIfActive(mmsi, newLat, newLon) {
  if (activeTrackMMSI === String(mmsi)) {
    addPointToActiveTrack(newLat, newLon);
  }
}

async function redrawActiveTracks() {
  trackLayerGroup.clearLayers(); 
  if (!activeTrackMMSI) return;

  const historyData = await fetchVesselHistory(activeTrackMMSI);

  if (historyData && historyData.length > 1) {
    const latlngs = historyData.map((p) => [p.lat, p.lon]);

    // A. Garis Glow/Shadow (Efek HD)
    L.polyline(latlngs, {
      color: "#000",
      weight: 6,
      opacity: 0.15,
      lineJoin: "round",
      className: "track-glow", // Tambahkan class agar mudah di-update
    }).addTo(trackLayerGroup);

    // B. Garis Utama (Cyan/Merah)
    L.polyline(latlngs, {
      color: "#ee2236",
      weight: 3,
      opacity: 1,
      lineJoin: "round",
      dashArray: "1, 10",
      className: "track-main", // Tambahkan class agar mudah di-update
    }).addTo(trackLayerGroup);

    // Titik lokasi (History Circle)
    latlngs.forEach((coord) => {
      L.circleMarker(coord, {
        radius: 3,
        fillColor: "#ee2236",
        color: "#fff",
        weight: 1.5,
        fillOpacity: 1,
        className: "track-circle", // Tambahkan class
      }).addTo(trackLayerGroup);
    });
  } else {
    showToast("Jejak pelayaran belum cukup untuk ditampilkan.", "warning", "info");
    activeTrackMMSI = null;
  }
}

function addPointToActiveTrack(lat, lon) {
  if (!trackLayerGroup) return;

  const newCoord = [lat, lon];

  // 1. Tambah Lingkaran Titik Baru
  L.circleMarker(newCoord, {
    radius: 3,
    fillColor: "#ee2236",
    color: "#fff",
    weight: 1.5,
    fillOpacity: 1,
    className: "track-circle",
  }).addTo(trackLayerGroup);

  // 2. Tambah titik baru ke garis glow dan garis utama
  trackLayerGroup.eachLayer((layer) => {
    if (layer instanceof L.Polyline) {
      layer.addLatLng(newCoord);
    }
  });
}
