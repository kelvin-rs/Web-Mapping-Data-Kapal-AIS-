// ==========================
// WEATHER MODULE
// ==========================

let windLayer = null;
let tempLayer = null;
let rainLayer = null;

// ==========================
// INIT WEATHER
// ==========================
export async function initWeathers(map) {
  const owmApiKey = "ea5a726a363c40c1efdadacc743c32d7"; // API OpenWeatherMap

  // 1. SIAPKAN LAYER SUHU & HUJAN (OWM)
  tempLayer = L.OWM.temperature({ appId: owmApiKey, showLegend: false });
  rainLayer = L.OWM.precipitation({ appId: owmApiKey, showLegend: false });

  // 2. FETCH DATA ANGIN ANIMASI (Leaflet Velocity)
  try {
    const windRes = await fetch(
      "https://raw.githubusercontent.com/danwild/leaflet-velocity/master/demo/wind-global.json",
    );

    if (windRes.ok) {
      const windData = await windRes.json();
      windLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Global Wind",
          position: "bottomleft",
          emptyString: "Tidak ada data angin",
          angleConvention: "bearingCW",
          speedUnit: "kt", // Satuan maritim
        },
        data: windData,
        maxVelocity: 15,
        colorScale: ["#00ffff", "#00ff00", "#ffff00", "#ff0000"],
      });
    }
  } catch (error) {
    console.error("Gagal memuat data animasi angin:", error);
  }

  // ==========================
  // LOGIKA UI (Radio Buttons & Auto-Close)
  // ==========================
  const radios = document.querySelectorAll('input[name="weatherLayer"]');
  const weatherBtn = document.getElementById("weather-btn");
  const indicator = document.getElementById("weather-active-indicator");
  const weatherDropdown = document.getElementById("weather-legends");

  radios.forEach((radio) => {
    radio.addEventListener("change", function () {
      removeAllWeatherLayers(map);

      const selectedValue = this.value;

      // JIKA "NONE" DIPILIH
      if (selectedValue === "none") {
        if (indicator) indicator.classList.add("hidden");
        if (weatherBtn)
          weatherBtn.classList.remove(
            "text-sky-400",
            "bg-slate-800/50",
            "ring-2",
            "ring-sky-400",
          );

        // Auto-close Dropdown
        if (weatherDropdown) weatherDropdown.classList.add("hidden");

        showToastAlert("Semua layer cuaca dinonaktifkan.", "normal");
        return;
      }

      // JIKA LAYER AKTIF DIPILIH
      if (indicator) indicator.classList.remove("hidden");
      if (weatherBtn)
        weatherBtn.classList.add(
          "text-sky-400",
          "bg-slate-800/50",
          "ring-2",
          "ring-sky-400",
        );

      let layerName = "";

      switch (selectedValue) {
        case "wind":
          if (windLayer) map.addLayer(windLayer);
          layerName = "Angin Interaktif";
          break;
        case "temperature":
          if (tempLayer) map.addLayer(tempLayer);
          layerName = "Suhu Global";
          break;
        case "rain":
          if (rainLayer) map.addLayer(rainLayer);
          layerName = "Curah Hujan";
          break;
      }

      showToastAlert(`Peta ${layerName} Diaktifkan`, "active");
    });
  });

  // Bersihkan layar di awal
  removeAllWeatherLayers(map);
}

// ==========================
// REMOVE ALL LAYERS
// ==========================
function removeAllWeatherLayers(map) {
  if (windLayer && map.hasLayer(windLayer)) map.removeLayer(windLayer);
  if (tempLayer && map.hasLayer(tempLayer)) map.removeLayer(tempLayer);
  if (rainLayer && map.hasLayer(rainLayer)) map.removeLayer(rainLayer);
}

// ==========================
// TOAST ALERT
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
    bgColor = "bg-sky-600";
    iconHtml = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>`;
  }

  toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium transform translate-y-10 opacity-0 transition-all duration-300 flex items-center gap-3`;
  toast.innerHTML = `${iconHtml} <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
