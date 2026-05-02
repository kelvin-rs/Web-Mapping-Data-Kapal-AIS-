// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
export function showToast(message, state = "normal", feature = "default") {
  let toastContainer = document.getElementById("toast-container");

  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className =
      "fixed bottom-20 right-3 z-[9999] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");

  // Konfigurasi Default (State Normal/Mati)
  let bgColor = "bg-slate-800 border border-slate-700";
  let iconHtml = `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  let timeoutDuration = 3000;

  // Konfigurasi Berdasarkan State "Error"
  if (state === "error") {
    bgColor = "bg-rose-600";
    iconHtml = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
  }
  // Konfigurasi Berdasarkan Fitur yang Aktif
  else if (state === "active") {
    if (feature === "filter") {
      bgColor = "bg-cyan-600";
      iconHtml = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>`;
      timeoutDuration = 5000;
    } else if (feature === "search") {
      bgColor = "bg-cyan-600";
      iconHtml = `<svg class="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`;
      timeoutDuration = 2500;
    } else if (feature === "weather") {
      bgColor = "bg-sky-600";
      iconHtml = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>`;
    } else if (feature === "measure") {
      bgColor = "bg-emerald-600";
      iconHtml = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>`;
      timeoutDuration = 5000;
    }
  }

  toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium transform translate-y-10 opacity-0 transition-all duration-300 flex items-center gap-3`;
  toast.innerHTML = `${iconHtml} <span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Animasi In/Out
  setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, timeoutDuration);
}

// ==========================================
// RUMUS MATEMATIKA: ARAH KAPAL (BEARING)
// ==========================================
export function calculateBearing(startLat, startLng, destLat, destLng) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const dLng = (destLng - startLng) * toRad;
  const y = Math.sin(dLng) * Math.cos(destLat * toRad);
  const x =
    Math.cos(startLat * toRad) * Math.sin(destLat * toRad) -
    Math.sin(startLat * toRad) * Math.cos(destLat * toRad) * Math.cos(dLng);

  const brng = Math.atan2(y, x) * toDeg;
  return (brng + 360) % 360;
}