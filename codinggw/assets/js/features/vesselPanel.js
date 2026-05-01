import { isPastTrackActive } from "../features/pastTrack.js"; // Import fungsi untuk cek status past track
import { resetActiveMarker } from "./vesselMarker.js"; // Memanggil fungsi reset dari marker

// ==========================================
// 1. LOGIKA FLOATING PANEL & DRAG
// ==========================================
export function showVesselPanels(vessel, marker, map, imgUrl) {
  const panel = document.getElementById("vessel-detail-panel");
  const content = document.getElementById("panel-content");

  content.innerHTML = createVesselHTML(vessel, imgUrl);

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

// ==========================================
// 2. TEMPLATE HTML POPUP
// ==========================================
function createVesselHTML(v, imgUrl) {
  const isActive = isPastTrackActive(v.mmsi);
  const trackBtnColor = isActive
    ? "bg-rose-600 hover:bg-rose-700"
    : "bg-slate-800 hover:bg-slate-900";
  const trackBtnText = isActive ? "Hentikan Track" : "Past Track";

  return `
    <div class="px-3 py-2 border-b border-gray-100 flex items-start justify-between bg-white relative z-10">
        <div class="flex items-center gap-3">
            <img src="assets/resource/Flag/${v.country}.JPG" class="w-9 h-6 object-cover rounded-sm shadow-sm" alt="flag" onerror="this.src='https://flagcdn.com/w40/xx.png'">
            <div>
                <h3 class="font-bold text-gray-800 text-[14px] leading-tight uppercase tracking-tight truncate w-[160px]">${v.name || v.owner || v.mmsi}</h3>
                <span class="text-[10px] text-gray-500 font-medium uppercase leading-none block mt-0.5">${v["ship type"]}</span>
            </div>
        </div>
        <div class="flex items-center gap-0.5">
            <button id="drag-handle" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md cursor-move transition active:cursor-grabbing" title="Geser Panel">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
            </button>
            <div class="w-[1px] h-4 bg-gray-200 mx-0.5"></div>
            <button onclick="closeVesselPanel()" class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition" title="Tutup">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    </div>
    <div class="relative h-44 bg-gray-200">
        <img src="${imgUrl}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1541180219717-d2fb4a822db8?q=80&w=400&auto=format&fit=crop'" />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
            <p class="text-[10px] opacity-80">© Photo by PenlokPENS Community</p>
        </div>
    </div>
    <div class="p-4 bg-white">
        <div class="flex justify-between items-end mb-4">
            <div class="text-center flex-1">
                <div class="text-2xl font-bold text-gray-800 leading-tight">FPO</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase">Departure</div>
            </div>
            <div class="flex-[2] px-4 pb-2">
                <div class="relative flex items-center">
                    <div class="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden"><div class="bg-sky-400 h-full" style="width: 65%"></div></div>
                    <div class="absolute left-[65%] -translate-y-1/2 top-1/2">
                        <svg class="w-5 h-5 text-sky-500 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </div>
                </div>
            </div>
            <div class="text-center flex-1">
                <div class="text-2xl font-bold text-gray-800 leading-tight">BCN</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase">Destination</div>
            </div>
        </div>
        <div class="flex justify-between text-[11px] mb-4 text-gray-600 px-2">
            <div class="text-left"><span class="block text-gray-400 font-semibold uppercase text-[9px]">ATD</span>2024-04-20 06:12</div>
            <div class="text-right"><span class="block text-gray-400 font-semibold uppercase text-[9px]">Reported ETA</span>${v.waktu || "--/--"}</div>
        </div>
        <div class="flex gap-2 mb-4">
            <button onclick="toggleVesselTrack('${v.mmsi}')" class="flex-1 ${trackBtnColor} text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                ${trackBtnText}
            </button>
            <button class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-lg transition">Route Forecast</button>
        </div>
        <div class="grid grid-cols-3 gap-0 border-t border-gray-100">
            <div class="p-3 border-r border-gray-100"><div class="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-tight">Nav Status</div><div class="text-[11px] font-bold text-green-600 line-clamnp-2 uppercase">${v.status || "UNKNOWN"}</div></div>
            <div class="p-3 border-r border-gray-100 text-center"><div class="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-tight">Speed/Course</div><div class="text-[11px] font-bold text-gray-800">${v.speed} kn / ${v.course}°</div></div>
            <div class="p-3 text-right"><div class="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-tight">Draught</div><div class="text-[11px] font-bold text-gray-800">${v.jarak || "0"}m</div></div>
        </div>
    </div>
    <div class="bg-gray-50 px-4 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <span>Received: Just now</span>
        <span class="font-semibold text-sky-500 uppercase">AIS Source: Terrestrial</span>
    </div>
  `;
}
