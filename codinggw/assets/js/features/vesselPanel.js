import { isPastTrackActive } from "../features/pastTrack.js"; // Import fungsi untuk cek status past track
import { resetActiveMarker } from "./vesselMarker.js"; // Memanggil fungsi reset dari marker
import { getLastVessels } from "../core/vessel.js";
import { getVesselPanelTemplate } from "../ui/templates.js";

// ==========================================
// 1. LOGIKA FLOATING PANEL & DRAG
// ==========================================
export function showVesselPanels(vessel, marker, map, imgUrl) {
  const panel = document.getElementById("vessel-detail-panel");
  const content = document.getElementById("panel-content");

  const isActive = isPastTrackActive(vessel.mmsi);
  content.innerHTML = getVesselPanelTemplate(vessel, imgUrl, isActive);

  const pt = map.latLngToContainerPoint(marker.getLatLng());
  const mapBounds = document.getElementById("map").getBoundingClientRect();
  const panelWidth = 340,
    estimatedHeight = 560;

  let targetLeft = pt.x + 30;
  let targetTop = pt.y - 120;

  // Collision Detection (Anti tertutup layar)
  if (targetTop < 80) targetTop = 80;
  if (targetTop + estimatedHeight > mapBounds.height)
    targetTop = mapBounds.height - estimatedHeight - 20;
  if (targetLeft + panelWidth > mapBounds.width)
    targetLeft = pt.x - panelWidth - 30;

  panel.style.left = targetLeft + "px";
  panel.style.top = targetTop + "px";
  panel.classList.remove("opacity-0", "invisible", "pointer-events-none");

  const dragHandle = document.getElementById("drag-handle");
  if (dragHandle) makeDraggable(dragHandle, panel);

  const playRouteBtn = document.getElementById("btn-play-route");
  if (playRouteBtn) {
    // Kita gunakan () => {} agar dia otomatis mengambil 'map' dan 'vessel' dari parameter fungsi ini!
    playRouteBtn.addEventListener("click", () => {
      closeVesselPanel(); // Tutup panel

      // Dynamic import modul playback
      import("../features/routePlayback.js")
        .then((module) => {
          // map dan vessel langsung dikirim ke fitur tanpa campur tangan window!
          module.startRoutePlayback(map, vessel);
        })
        .catch((err) => console.error("Gagal memuat modul Playback:", err));
    });
  }
}

// Fungsi untuk Mereset Kapal dan Menutup Panel
export function closeVesselPanel() {
  const panel = document.getElementById("vessel-detail-panel");
  if (panel)
    panel.classList.add("opacity-0", "invisible", "pointer-events-none");

  // Panggil fungsi reset lampu radar di file marker
  resetActiveMarker();
}
window.closeVesselPanel = closeVesselPanel;

// Fungsi Fitur Menggeser Panel
function makeDraggable(dragHandle, dragTarget) {
  let isDragging = false,
    startX,
    startY,
    initialLeft,
    initialTop;

  const dragStart = (e) => {
    if (e.type === "touchstart") e = e.touches[0];
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = dragTarget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    dragTarget.style.transition = "none";
  };

  const dragMove = (e) => {
    if (!isDragging) return;
    if (e.type === "touchmove") e = e.touches[0];
    e.preventDefault();
    dragTarget.style.left = initialLeft + (e.clientX - startX) + "px";
    dragTarget.style.top = initialTop + (e.clientY - startY) + "px";
  };

  const dragEnd = () => {
    isDragging = false;
  };

  dragHandle.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("mouseup", dragEnd);

  dragHandle.addEventListener("touchstart", dragStart, { passive: false });
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("touchend", dragEnd);
}