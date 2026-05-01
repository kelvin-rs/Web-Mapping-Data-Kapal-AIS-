// ==========================
// MEASURE MODULE
// ==========================

let distanceControl = null;
let measureActive = false;
let drawnItems = null; // Wadah untuk menyimpan garis & popup agar bisa dihapus bersamaan

// ==========================
// INIT MEASURE
// ==========================
export function initMeasure(map) {
  // Buat wadah layer untuk garis ukur dan popup-nya
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // Init draw control dengan desain garis modern (Hijau Putus-putus)
  distanceControl = new L.Draw.Polyline(map, {
    metric: true,
    shapeOptions: {
      color: "#10b981", // Warna Emerald
      weight: 3,
      dashArray: "5, 8",
      lineCap: "round",
      lineJoin: "round",
      opacity: 0.9,
    },
  });

  // ==========================
  // EVENT: SELESAI GAMBAR GARIS
  // ==========================
  map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    drawnItems.addLayer(layer); // Simpan garis ke dalam wadah

    const latlngs = layer.getLatLngs();
    let distance = 0;

    // Hitung total jarak
    for (let i = 0; i < latlngs.length - 1; i++) {
      distance += latlngs[i].distanceTo(latlngs[i + 1]);
    }

    const distKm = (distance / 1000).toFixed(2);
    const distNm = (distance / 1852).toFixed(2);

    // Ambil koordinat terakhir (titik akhir klik)
    const lastPoint = latlngs[latlngs.length - 1];

    // ==========================
    // POPUP LABEL PERMANEN DI PETA
    // ==========================
    L.tooltip({
      permanent: true, // Tidak akan hilang kalau tidak disuruh
      direction: "right", // Muncul di sebelah kanan titik
      // Class di bawah ini menghapus background putih bawaan Leaflet
      className: "bg-transparent border-none shadow-none p-0",
    })
      .setLatLng(lastPoint)
      .setContent(
        `
      <div class="bg-slate-900/95 backdrop-blur border border-emerald-500/50 text-emerald-400 font-bold px-3 py-1.5 rounded-lg shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)] text-xs whitespace-nowrap ml-2">
        <span class="text-white mr-1">🏁 Jarak:</span> ${distKm} km <span class="text-slate-400 font-normal ml-1">(${distNm} NM)</span>
      </div>
    `,
      )
      .addTo(drawnItems); // Masukkan ke dalam wadah yang sama dengan garis
  });
}

// ==========================
// TOGGLE MEASURE (Dipanggil dari sidebar)
// ==========================
export function toggleMeasure(map) {
  if (!distanceControl) {
    console.error("Measure belum di-init");
    return;
  }

  const measureBtn = document.getElementById("distance-btn");
  const indicator = document.getElementById("measure-active-indicator");

  if (!measureActive) {
    // === AKTIFKAN ===
    distanceControl.enable();
    measureActive = true;

    if (indicator) indicator.classList.remove("hidden");
    if (measureBtn)
      measureBtn.classList.add(
        "text-emerald-400",
        "bg-slate-800/50",
        "ring-2",
        "ring-emerald-400",
      );

    showToastAlert("Mode ukur aktif. Klik titik di peta.", "active");
  } else {
    // === MATIKAN ===
    distanceControl.disable();
    measureActive = false;

    // MENGHAPUS SEMUA GARIS & POPUP JARAK DARI PETA SECARA BERSAMAAN
    if (drawnItems) drawnItems.clearLayers();

    if (indicator) indicator.classList.add("hidden");
    if (measureBtn)
      measureBtn.classList.remove(
        "text-emerald-400",
        "bg-slate-800/50",
        "ring-2",
        "ring-emerald-400",
      );

    showToastAlert("Mode ukur dimatikan.", "normal");
  }
}

// ==========================
// TOAST ALERT (Untuk status mode saja)
// ==========================
function showToastAlert(message, state) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className =
      "fixed bottom-20 right-3 z-[9999] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  let bgColor = "bg-slate-800 border border-slate-700";
  let iconHtml = `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  if (state === "active") {
    bgColor = "bg-emerald-600";
    iconHtml = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>`;
  }

  toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium transform translate-y-10 opacity-0 transition-all duration-300 flex items-center gap-3`;
  toast.innerHTML = `${iconHtml} <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
