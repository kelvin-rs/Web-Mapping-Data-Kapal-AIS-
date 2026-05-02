import { getVesselHistory } from "../core/vessel.js";
import { getShipAssets } from "./vesselMarker.js";
import { showToast, calculateBearing } from "../core/utils.js";
import { getPlayerUITemplate } from "../ui/templates.js";

let playbackLayerGroup = null;
let movingMarker = null;
let pathLine = null;
let playInterval = null;

let routeData = [];
let currentIndex = 0;
let isPlaying = false;
let currentMap = null;
let lastValidBearing = 0;

// ==========================================
// 1. INISIALISASI & MUNCULKAN PLAYER UI
// ==========================================
export function startRoutePlayback(map, vessel) {
  const history = getVesselHistory()[vessel.mmsi];

  if (!history || history.length < 2) {
    showToast("Data riwayat (Past Track) belum cukup untuk memutar animasi.");
    return;
  }

  currentMap = map;
  routeData = history;
  currentIndex = 0;
  isPlaying = false;

  if (playbackLayerGroup) currentMap.removeLayer(playbackLayerGroup);
  playbackLayerGroup = L.layerGroup().addTo(currentMap);

  // GAMBAR GARIS RUTE (WARNA MERAH ROSE)
  const latlngs = routeData.map((p) => [p.lat, p.lon]);
  pathLine = L.polyline(latlngs, {
    color: "#e11d48", // Rose 600 (Merah)
    weight: 4,
    dashArray: "8, 8",
    opacity: 0.9,
    lineCap: "round",
  }).addTo(playbackLayerGroup);

  currentMap.fitBounds(pathLine.getBounds(), { padding: [50, 50] });

  lastValidBearing = calculateBearing(
    routeData[0].lat,
    routeData[0].lon,
    routeData[1].lat,
    routeData[1].lon,
  );

  const assets = getShipAssets(vessel);
  const ghostIcon = L.divIcon({
    className: "bg-transparent border-none moving-vessel-anim",
    html: `
      <div class="relative flex items-center justify-center w-[30px] h-[30px]">
        <!-- Efek Glow Merah -->
        <div class="absolute inset-0 rounded-full bg-rose-500/30 animate-pulse blur-sm pointer-events-none"></div>
        <img src="${assets.iconUrl}" class="relative z-10 w-full h-full object-contain drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" style="transform: rotate(${lastValidBearing}deg)" />
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  movingMarker = L.marker([routeData[0].lat, routeData[0].lon], {
    icon: ghostIcon,
    zIndexOffset: 1000,
  }).addTo(playbackLayerGroup);

  renderPlayerUI(vessel);
}

// ==========================================
// 2. LOGIKA ANIMASI & KONTROL
// ==========================================
function togglePlay() {
  isPlaying = !isPlaying;
  const playBtnIco = document.getElementById("rp-play-icon");

  if (isPlaying) {
    playBtnIco.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />`;

    playInterval = setInterval(() => {
      if (currentIndex >= routeData.length - 1) {
        togglePlay();
        return;
      }
      currentIndex++;
      updateMarkerPosition();
    }, 1000);
  } else {
    playBtnIco.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />`;
    clearInterval(playInterval);
  }
}

function updateMarkerPosition() {
  const currentPoint = routeData[currentIndex];
  const nextPoint = routeData[currentIndex + 1];

  movingMarker.setLatLng([currentPoint.lat, currentPoint.lon]);

  if (nextPoint) {
    if (
      currentPoint.lat !== nextPoint.lat ||
      currentPoint.lon !== nextPoint.lon
    ) {
      lastValidBearing = calculateBearing(
        currentPoint.lat,
        currentPoint.lon,
        nextPoint.lat,
        nextPoint.lon,
      );
    }

    const iconElement = movingMarker.getElement();
    if (iconElement) {
      const img = iconElement.querySelector("img");
      if (img) {
        img.style.transition = "transform 0.6s ease-in-out";
        img.style.transform = `rotate(${lastValidBearing}deg)`;
      }
    }
  }

  document.getElementById("rp-timeline").value = currentIndex;
  const timeText = new Date(currentPoint.waktu).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("rp-time-display").innerText = timeText;
}

function closePlayback() {
  isPlaying = false;
  clearInterval(playInterval);
  if (playbackLayerGroup && currentMap) {
    currentMap.removeLayer(playbackLayerGroup);
  }

  const ui = document.getElementById("route-player-ui");
  if (ui) {
    ui.classList.add("translate-y-24", "opacity-0");
    setTimeout(() => ui.remove(), 300);
  }
}

// ==========================================
// 3. RENDER FLOATING PLAYER UI (HTML)
// ==========================================
function renderPlayerUI(vessel) {
  // 1. Cek apakah UI lama masih ada, jika ada hapus
  let ui = document.getElementById("route-player-ui");
  if (ui) ui.remove();

  // 2. Buat elemen (wadah) baru
  ui = document.createElement("div");
  ui.id = "route-player-ui";
  ui.className =
    "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-6 py-3 flex items-center gap-5 translate-y-24 opacity-0 transition-all duration-500 ease-out min-w-[400px]";

  // 3. Format jam dan ambil HTML dari template
  const startTimeText = new Date(routeData[0].waktu).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  ui.innerHTML = getPlayerUITemplate(
    vessel,
    startTimeText,
    routeData.length - 1,
  );

  // 4. Masukkan ke dalam layar browser (DOM)
  document.body.appendChild(ui);

  // 5. Pasang Event Listener ke tombol-tombol
  document.getElementById("rp-play-btn").addEventListener("click", togglePlay);
  document
    .getElementById("rp-close-btn")
    .addEventListener("click", closePlayback);

  document
    .getElementById("rp-timeline")
    .addEventListener("input", function (e) {
      currentIndex = parseInt(e.target.value);
      updateMarkerPosition();
    });

  // 6. Animasi masuk (Muncul dari bawah secara halus)
  setTimeout(() => {
    ui.classList.remove("translate-y-24", "opacity-0");
  }, 50);
}
