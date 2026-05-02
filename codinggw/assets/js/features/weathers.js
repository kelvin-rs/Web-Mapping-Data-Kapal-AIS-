import { showToast } from "../core/utils.js";
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

        showToast("Semua layer cuaca dinonaktifkan.", "normal", "weather");
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

      showToast(`Peta ${layerName} Diaktifkan`, "active", "weather");
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