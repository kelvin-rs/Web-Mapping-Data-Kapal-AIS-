import { showVesselPanels } from "./vesselPanel.js";
import {
  ASSETS_PATH_ICON,
  ASSETS_PATH_IMG,
  SHIP_TYPES,
  OWNER_TYPES,
} from "../core/constants.js";
import { getTooltipTemplate } from "../ui/templates.js";

// ==========================================
// 1. STATE & VARIABLES
// ==========================================
let markers = {};
let activeMarker = null;
let activeOriginalIcon = null;

// ==========================================
// 2. HELPER ASSET & RESET
// ==========================================
export function getShipAssets(vessel) {
  let iconFile = "na.svg";
  let imgFile = "na.jpg";

  if (vessel.owner === "Ship") {
    const type = SHIP_TYPES[vessel["ship type"]];
    iconFile = type ? type.icon : "sna.svg";
    imgFile = type ? type.img : "sna.jpg";
  } else if (OWNER_TYPES[vessel.owner]) {
    iconFile = OWNER_TYPES[vessel.owner].icon;
    imgFile = OWNER_TYPES[vessel.owner].img;
  }

  return {
    iconUrl: ASSETS_PATH_ICON + iconFile,
    imgUrl: ASSETS_PATH_IMG + imgFile,
  };
}

export function resetActiveMarker() {
  if (activeMarker) {
    activeMarker.setIcon(activeOriginalIcon);
    activeMarker = null;
    activeOriginalIcon = null;
  }
}

// ==========================================
// 3. LOGIKA RENDER KE PETA LEAFLET
// ==========================================
export function renderVesselsToMap(map, vesselList) {
  const currentMMSI = new Set(vesselList.map((v) => v.mmsi));

  Object.keys(markers).forEach((mmsi) => {
    if (!currentMMSI.has(mmsi)) {
      map.removeLayer(markers[mmsi]);
      delete markers[mmsi];
    }
  });

  vesselList.forEach((vessel) => {
    if (!vessel.lat || !vessel.lon) return;

    if (markers[vessel.mmsi]) {
      // Perbarui posisi
      markers[vessel.mmsi].setLatLng([vessel.lat, vessel.lon]);

      // Update arah putaran ikon jika memakai DivIcon
      const iconElement = markers[vessel.mmsi].getElement();
      if (iconElement) {
        const img = iconElement.querySelector("img");
        if (img) img.style.transform = `rotate(${vessel.course || 0}deg)`;
      }
    } else {
      markers[vessel.mmsi] = createMarker(map, vessel);
    }
  });
}

function createMarker(map, vessel) {
  const assets = getShipAssets(vessel);

  // 1. IKON DEFAULT (DENGAN EFEK HOVER OTOMATIS)
  const shipIcon = L.divIcon({
    className: "group bg-transparent border-none",
    html: `
      <div class="relative flex items-center justify-center w-[26px] h-[26px]">
        <div class="absolute -inset-1.5 rounded-full border-2 border-sky-400/60 bg-sky-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_0_10px_rgba(148,163,184,0.5)]"></div>
        <img src="${assets.iconUrl}" class="relative z-10 w-full h-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110" style="transform: rotate(${vessel.course || 0}deg)" />
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

  const marker = L.marker([vessel.lat, vessel.lon], {
    icon: shipIcon,
  }).addTo(map);

  // 2. TOOLTIP MODERN (WHITE GLASSMORPHISM)
  const isMoving = vessel.speed > 0.5;
  const dotColor = isMoving ? "bg-emerald-500 animate-pulse" : "bg-amber-400";

  const tooltipHtml = getTooltipTemplate(vessel, assets.iconUrl, dotColor);

  marker.bindTooltip(tooltipHtml, {
    direction: "top",
    offset: [0, -15],
    className: "custom-vessel-tooltip",
    opacity: 1,
  });

  // 3. EVENT KLIK (MUNCULKAN PANEL)
  marker.on("click", (e) => {
    L.DomEvent.stopPropagation(e);
    resetActiveMarker();
    marker.closeTooltip();

    activeMarker = marker;
    activeOriginalIcon = shipIcon;

    // Ikon Aktif (Klik) menggunakan warna Biru Cyan/Neon
    const activeIcon = L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative flex items-center justify-center w-[26px] h-[26px]">
          <div class="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none"></div>
          <div class="absolute -inset-2 rounded-full border-2 border-cyan-500 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.8)] pointer-events-none"></div>
          <img src="${assets.iconUrl}" class="relative z-10 w-full h-full object-contain drop-shadow-md scale-110" style="transform: rotate(${vessel.course || 0}deg)" />
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    marker.setIcon(activeIcon);
    showVesselPanels(vessel, marker, map, assets.imgUrl);
  });

  return marker;
}
