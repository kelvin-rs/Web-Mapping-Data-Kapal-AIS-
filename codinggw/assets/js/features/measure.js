import { showToast } from "../core/utils.js";
import { getMeasureTooltipTemplate } from "../ui/templates.js";
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
      .setContent(getMeasureTooltipTemplate(distKm, distNm))
      .addTo(drawnItems);
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

    showToast("Mode ukur aktif. Klik titik di peta.", "active", "measure");
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

    showToast("Mode ukur dimatikan.", "normal", "measure");
  }
}
