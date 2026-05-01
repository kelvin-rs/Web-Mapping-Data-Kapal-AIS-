import { showVesselPanels } from "./vesselPanel.js";

// ==========================================
// 1. KONFIGURASI ASSET & STATE
// ==========================================
const ASSETS_PATH_ICON = "assets/resource/v2/";
const ASSETS_PATH_IMG = "assets/resource/3D_Image_Vessel/";

const SHIP_TYPES = {
  "Cargo Ship": { icon: "cargoship.svg", img: "CargoShip.jpg" },
  Tanker: { icon: "tanker.svg", img: "Tanker.jpg" },
  "Passenger Ship": { icon: "passengership.svg", img: "PassengerShip.jpg" },
  "Fishing Vessel": { icon: "fishingvessel.svg", img: "FishingVessel.jpg" },
};

const OWNER_TYPES = {
  "Coastal Station": { icon: "Coastal Station.svg", img: "CoastalStation.jpg" },
  "Group of ships": { icon: "Group of ships.svg", img: "GroupOfShips.jpg" },
  "SAR — Search and Rescue Aircraft": {
    icon: "SAR Search and Rescue Aircraft.svg",
    img: "SAR.jpg",
  },
  "Diver's radio": { icon: "Diver_s radio.svg", img: "Diver_s radio.jpg" },
  "Aids to navigation": {
    icon: "Aids to navigation.svg",
    img: "AidsToNavigate.jpg",
  },
  "Auxiliary craft associated with parent ship": {
    icon: "Auxiliary craft Associated with parent ship.svg",
    img: "AuxilaryCraft.jpg",
  },
  "AIS SART — Search and Rescue Transmitter": {
    icon: "AIS SART search and rescue transmitter.svg",
    img: "AisSart.jpg",
  },
  "MOB — Man Overboard Device": {
    icon: "MOB man overboard device.svg",
    img: "MOB.jpg",
  },
  "EPIRB — Emergency Position Indicating Radio Beacon": {
    icon: "EPIRB emergency position indicating radio beacon.svg",
    img: "EPIRB.jpg",
  },
};

let markers = {};
let activeMarker = null;
let activeOriginalIcon = null;

// ==========================================
// 2. HELPER ASSET & RESET
// ==========================================
function getShipAssets(vessel) {
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

  const tooltipHtml = `
    <div class="bg-white/95 backdrop-blur-md border border-slate-400/60 shadow-[0_0_20px_rgba(56,189,248,0.25)] rounded-2xl p-3 flex flex-col gap-3 w-max min-w-[210px] max-w-[320px]">
      
      <div class="flex items-center gap-2.5 border-b border-slate-400 pb-2.5">
        <img src="assets/resource/Flag/${vessel.country}.JPG" 
             class="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-slate-200 shrink-0" 
             alt="flag" onerror="this.src='https://flagcdn.com/w20/xx.png'">
        <div class="flex flex-col min-w-0">
          <span class="font-extrabold text-slate-800 text-[13px] uppercase tracking-tight leading-snug break-words">
            ${vessel.name || vessel.owner || vessel.mmsi}
          </span>
          <span class="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">${vessel["ship type"]}</span>
        </div>
      </div>

      <div class="flex items-start gap-3">
         <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200 shrink-0 shadow-inner mt-1">
           <img src="${assets.iconUrl}" class="w-6 h-6 object-contain opacity-70" style="transform: rotate(${vessel.course || 0}deg)">
         </div>
         
         <div class="flex flex-col gap-1.5 flex-1 w-full">
           <div class="flex justify-between items-start gap-4 text-[10px]">
             <span class="text-slate-400 font-semibold uppercase tracking-wide shrink-0">Type</span>
             <span class="text-slate-700 font-bold uppercase text-right break-words leading-tight">
               ${vessel["ship type"] || "UNKNOWN"}
             </span>
           </div>
           
           <div class="flex justify-between items-start gap-4 text-[10px]">
             <span class="text-slate-400 font-semibold uppercase tracking-wide shrink-0">Status</span>
             <div class="flex items-start gap-1.5 justify-end text-right">
               <span class="w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm shrink-0 mt-1"></span>
               <span class="text-slate-700 font-bold uppercase break-words leading-tight">
                 ${vessel.status || "UNKNOWN"}
               </span>
             </div>
           </div>
         </div>
      </div>

    </div>
  `;

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
