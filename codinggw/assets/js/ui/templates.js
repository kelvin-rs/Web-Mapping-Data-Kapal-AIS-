// ==========================================
// 1. TEMPLATE: HOVER TOOLTIP (MAP)
// ==========================================
export function getTooltipTemplate(vessel, iconUrl, dotColor) {
  return `
    <div class="bg-white/95 backdrop-blur-md border border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.25)] rounded-2xl p-3 flex flex-col gap-3 w-max min-w-[210px] max-w-[320px]">
      <div class="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
        <img src="assets/resource/Flag/${vessel.country}.JPG" 
             class="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-slate-200 shrink-0" 
             alt="flag" onerror="this.src='https://flagcdn.com/w20/xx.png'">
        <div class="flex flex-col min-w-0">
          <span class="font-extrabold text-slate-800 text-[13px] uppercase tracking-tight leading-snug break-words">
            ${vessel.name || vessel.owner || vessel.mmsi}
          </span>
          <span class="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">MMSI: ${vessel.mmsi || "-"}</span>
        </div>
      </div>
      <div class="flex items-start gap-3">
         <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-inner mt-1">
           <img src="${iconUrl}" class="w-6 h-6 object-contain opacity-70" style="transform: rotate(${vessel.course || 0}deg)">
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
}

// ==========================================
// 2. TEMPLATE: VESSEL DETAIL PANEL
// ==========================================
export function getVesselPanelTemplate(v, imgUrl, isActive) {
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
            <button id="btn-play-route" class="flex-1 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-600 border border-slate-200 hover:border-cyan-200 text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>
                Play Route
            </button>
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

// ==========================================
// 3. TEMPLATE: ROUTE PLAYBACK UI
// ==========================================
export function getPlayerUITemplate(vessel, startTime, maxRange) {
  return `
    <button id="rp-play-btn" class="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform active:scale-95 shrink-0">
      <svg id="rp-play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>
    </button>
    <div class="flex-1 flex flex-col gap-1.5">
      <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span class="truncate max-w-[100px] text-rose-500">${vessel.name || vessel.mmsi}</span>
        <span id="rp-time-display">${startTime}</span>
      </div>
      <input type="range" id="rp-timeline" class="modern-slider" min="0" max="${maxRange}" value="0">
    </div>
    <div class="w-px h-8 bg-slate-700 shrink-0"></div>
    <button id="rp-close-btn" class="text-slate-400 hover:text-rose-500 transition-colors p-1 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  `;
}

// ==========================================
// 4. TEMPLATE: STATS TABLE ROW
// ==========================================
export function getStatsTableRowTemplate(v, statusBadge) {
  return `
    <td class="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">${v.mmsi || "-"}</td>
    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${v["ship type"] || "N/A"}</td>
    <td class="py-3 px-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
      <img src="assets/resource/Flag/${v.country}.JPG" class="w-4 h-3 rounded-sm opacity-90 shadow-sm" alt="flag">
      ${v.country || "-"}
    </td>
    <td class="py-3 px-4 text-center">${statusBadge}</td>
    <td class="py-3 px-4 font-mono text-cyan-600 dark:text-cyan-400 text-right">${v.speed || "0.0"} kn</td>
  `;
}

// ==========================================
// 5. TEMPLATE: MEASURE TOOLTIP
// ==========================================
export function getMeasureTooltipTemplate(distKm, distNm) {
  return `
    <div class="bg-slate-900/95 backdrop-blur border border-emerald-500/50 text-emerald-400 font-bold px-3 py-1.5 rounded-lg shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)] text-xs whitespace-nowrap ml-2">
      <span class="text-white mr-1">🏁 Jarak:</span> ${distKm} km <span class="text-slate-400 font-normal ml-1">(${distNm} NM)</span>
    </div>
  `;
}
