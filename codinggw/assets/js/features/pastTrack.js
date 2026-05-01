import { getVesselHistory } from "../core/vessel.js";

let trackLayerGroup = null;
let activeTrackMMSI = null; // HANYA MENYIMPAN 1 KAPAL

export function initPastTrack(map) {
  trackLayerGroup = L.layerGroup().addTo(map);
  
  // Fungsi Global untuk atribut onclick di HTML
  window.toggleVesselTrack = function(mmsi) {
    const mmsiStr = String(mmsi);

    if (activeTrackMMSI === mmsiStr) {
      // Jika yang diklik adalah kapal yang SAMA -> MATIKAN TRACK
      activeTrackMMSI = null;
    } else {
      // Jika yang diklik kapal LAIN -> GANTI TRACK KE KAPAL BARU
      activeTrackMMSI = mmsiStr;
    }

    // TUTUP PANEL KAPAL OTOMATIS
    if (typeof window.closeVesselPanel === "function") {
      window.closeVesselPanel();
    }

    // GAMBAR ULANG (Otomatis menghapus yang lama dan menggambar yang baru)
    redrawActiveTracks();
  };
}

// Mengecek apakah sebuah kapal sedang aktif (Untuk merender warna tombol)
export function isPastTrackActive(mmsi) {
  return activeTrackMMSI === String(mmsi);
}

// Dipanggil dari vessel.js saat data di-update dari database
export function updateTracksIfActive() {
  if (activeTrackMMSI) {
    redrawActiveTracks();
  }
}

// Logika Menggambar Garis HD
function redrawActiveTracks() {
  trackLayerGroup.clearLayers(); // Selalu bersihkan peta terlebih dahulu
  
  if (!activeTrackMMSI) return; // Jika tidak ada yang aktif, berhenti di sini.

  const history = getVesselHistory();
  const points = history[activeTrackMMSI];

  if (points && points.length > 1) {
    const latlngs = points.map((p) => [p.lat, p.lon]);

    // A. Garis Glow/Shadow (Efek HD)
    L.polyline(latlngs, {
      color: "#000",
      weight: 6,
      opacity: 0.15,
      lineJoin: 'round'
    }).addTo(trackLayerGroup);

    // B. Garis Utama (Cyan)
    L.polyline(latlngs, {
      color: "#ee2236", 
      weight: 3,
      opacity: 1,
      lineJoin: 'round',
      dashArray: "1, 10", 
    }).addTo(trackLayerGroup);
    
    // Titik lokasi setiap kali database diupdate
    latlngs.forEach(coord => {
        L.circleMarker(coord, {
            radius: 3,
            fillColor: "#ee2236",
            color: "#fff",
            weight: 1.5,
            fillOpacity: 1
        }).addTo(trackLayerGroup);
    });
  }
}