import { showVesselPanels } from "./vesselPanel.js";
import {
  ASSETS_PATH_ICON,
  ASSETS_PATH_IMG,
  SHIP_TYPES,
  OWNER_TYPES,
} from "../core/constants.js";
import { getTooltipTemplate } from "../ui/templates.js";
import { updateTracksIfActive } from "./pastTrack.js";
import { updatePlaybackIfActive } from "./routePlayback.js";

let markers = {};
let activeMarker = null;
let activeOriginalIcon = null;
let isZoomConfigured = false;

export function getShipAssets(vessel) {
  let iconFile = "cargoship.svg";
  let imgFile = "CargoShip.jpg";

  if (vessel.owner === "Ship") {
    const type = SHIP_TYPES[vessel["ship type"]];
    iconFile = type ? type.icon : "cargoship.svg";
    imgFile = type ? type.img : "CargoShip.jpg";
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

export function renderVesselsToMap(map, vesselList) {
  if (!isZoomConfigured) {
    const updateScale = () => {
      const zoom = map.getZoom();
      const scale = Math.max(0.4, Math.min(2.5, zoom / 12));
      map.getContainer().style.setProperty("--vessel-scale", scale);
    };

    map.on("zoom", updateScale);
    updateScale();
    isZoomConfigured = true;
  }

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
      const marker = markers[vessel.mmsi];
      glideTo(markers[vessel.mmsi], vessel.lat, vessel.lon, 4800);

      const shipImg = document.getElementById(`ship-img-${vessel.mmsi}`);
      if (shipImg) {
        shipImg.style.transform = `rotate(${vessel.course || 0}deg)`;
      }

      const assets = getShipAssets(vessel);
      const isMoving = vessel.speed > 0.5;
      if (marker.isTooltipOpen()) {
        const tooltipStatus = document.getElementById(
          `live-tooltip-status-${vessel.mmsi}`,
        );
        const tooltipDot = document.getElementById(
          `live-tooltip-dot-${vessel.mmsi}`,
        );

        if (tooltipStatus)
          tooltipStatus.innerText =
            vessel.status || (isMoving ? "UNDER WAY" : "MOORED");
        if (tooltipDot) {
          tooltipDot.className = `w-1.5 h-1.5 rounded-full shadow-sm shrink-0 mt-1 ${isMoving ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`;
        }
      } else {
        const assets = getShipAssets(vessel);
        const dotColor = isMoving
          ? "bg-emerald-500 animate-pulse"
          : "bg-amber-400";
        const newTooltipHtml = getTooltipTemplate(
          vessel,
          assets.iconUrl,
          dotColor,
        );
        marker.setTooltipContent(newTooltipHtml);
      }
      if (activeMarker === marker) {
        const panelStatus = document.getElementById("live-panel-status");
        if (panelStatus)
          panelStatus.innerText =
            vessel.status || (isMoving ? "UNDER WAY" : "MOORED");

        const panelSpeedCourse = document.getElementById(
          "live-panel-speed-course",
        );
        if (panelSpeedCourse)
          panelSpeedCourse.innerText = `${vessel.speed} kn / ${vessel.course}°`;

        const panelDraught = document.getElementById("live-panel-draught");
        if (panelDraught) panelDraught.innerText = `${vessel.jarak || "0"} m`;
        const panelTime = document.getElementById("live-panel-time");
        if (panelTime) {
          const now = new Date();
          panelTime.innerText = `Received: ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        }
      }
      updateTracksIfActive(vessel.mmsi, vessel.lat, vessel.lon);
      updatePlaybackIfActive(
        vessel.mmsi,
        vessel.lat,
        vessel.lon,
        vessel.course,
      );
    } else {
      markers[vessel.mmsi] = createMarker(map, vessel);
    }
  });
}

function createMarker(map, vessel) {
  const assets = getShipAssets(vessel);

  const shipIcon = L.divIcon({
    className: "group bg-transparent border-none",
    html: `
      <div class="relative flex items-center justify-center w-[26px] h-[26px] transition-transform duration-200" style="transform: scale(var(--vessel-scale, 1));">
        <div class="absolute -inset-1.5 rounded-full border-2 border-sky-400/60 bg-sky-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_0_10px_rgba(148,163,184,0.5)]"></div>
        <img id="ship-img-${vessel.mmsi}" src="${assets.iconUrl}" 
             class="relative z-10 w-full h-full object-contain drop-shadow-sm group-hover:scale-110" 
             style="transform: rotate(${vessel.course || 0}deg); transition: transform 1.5s ease-out;" />
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

  const marker = L.marker([vessel.lat, vessel.lon], {
    icon: shipIcon,
  }).addTo(map);

  marker.on("mouseover", function () {
    this.setZIndexOffset(9999); // Bawa ikon ke lapisan paling atas
  });

  marker.on("mouseout", function () {
    this.setZIndexOffset(0); // Kembalikan ke lapisan normal
  });

  const isMoving = vessel.speed > 0.5;
  const dotColor = isMoving ? "bg-emerald-500 animate-pulse" : "bg-amber-400";

  const tooltipHtml = getTooltipTemplate(vessel, assets.iconUrl, dotColor);

  marker.bindTooltip(tooltipHtml, {
    direction: "top",
    offset: [0, -15],
    className: "custom-vessel-tooltip",
    opacity: 1,
  });

  marker.on("click", (e) => {
    L.DomEvent.stopPropagation(e);
    resetActiveMarker();
    marker.closeTooltip();

    activeMarker = marker;
    activeOriginalIcon = shipIcon;

    const activeIcon = L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative flex items-center justify-center w-[26px] h-[26px] transition-transform duration-200" style="transform: scale(var(--vessel-scale, 1));">
          <div class="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none"></div>
          <div class="absolute -inset-2 rounded-full border-2 border-cyan-500 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.8)] pointer-events-none"></div>
          
          <!-- PENAMBAHAN ID DAN TRANSITION CSS UNTUK ROTASI HALUS -->
          <img id="ship-img-${vessel.mmsi}" src="${assets.iconUrl}" 
               class="relative z-10 w-full h-full object-contain drop-shadow-md scale-110" 
               style="transform: rotate(${vessel.course || 0}deg); transition: transform 1.5s ease-out;" />
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

export function toggleMarkerVisibility(mmsi, isVisible) {
  if (markers[mmsi]) {
    markers[mmsi].setOpacity(isVisible ? 1 : 0);
  }
}

// =========================================================
// THE GLIDE ENGINE: Animasi Meluncur Presisi (Interpolasi 60 FPS)
// =========================================================
function glideTo(marker, targetLat, targetLon, durationMs) {
  if (marker._glideFrame) {
    cancelAnimationFrame(marker._glideFrame);
  }

  const startLatLng = marker.getLatLng();
  const startLat = startLatLng.lat;
  const startLon = startLatLng.lng;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsedTime = currentTime - startTime;
    let progress = elapsedTime / durationMs;

    if (progress > 1) progress = 1;

    const currentLat = startLat + (targetLat - startLat) * progress;
    const currentLon = startLon + (targetLon - startLon) * progress;

    marker.setLatLng([currentLat, currentLon]);

    if (progress < 1) {
      marker._glideFrame = requestAnimationFrame(animate);
    }
  }

  marker._glideFrame = requestAnimationFrame(animate);
}
