// ==========================
// WEATHER MODULE (features/weather.js)
// ==========================

let windLayer = null;
let tempLayer = null;
let rainLayer = null;

// ==========================
// INIT WEATHER
// ==========================

export function initWeathers(map) {
  const apiKey = "ea5a726a363c40c1efdadacc743c32d7"; // ganti dengan API key OpenWeatherMap

  // ==========================
  // INIT LAYER
  // ==========================
  windLayer = L.OWM.wind({
    appId: apiKey,
    showLegend: false,
  });

  tempLayer = L.OWM.temperature({
    appId: apiKey,
    showLegend: false,
  });

  rainLayer = L.OWM.precipitation({
    appId: apiKey,
    showLegend: false,
  });

  // ==========================
  // RADIO BUTTON EVENT
  // ==========================
  const radios = document.querySelectorAll('input[name="weatherLayer"]');

  radios.forEach((radio) => {
    radio.addEventListener("change", function () {
      removeAllWeatherLayers(map);

      switch (this.value) {
        case "wind":
          map.addLayer(windLayer);
          break;

        case "temperature":
          map.addLayer(tempLayer);
          break;

        case "rain":
          map.addLayer(rainLayer);
          break;

        case "none":
        default:
          // tidak tampilkan layer
          break;
      }
    });
  });

  // ==========================
  // DEFAULT STATE
  // ==========================
  removeAllWeatherLayers(map);
}

// ==========================
// REMOVE ALL LAYERS
// ==========================

function removeAllWeatherLayers(map) {
  if (windLayer && map.hasLayer(windLayer)) {
    map.removeLayer(windLayer);
  }

  if (tempLayer && map.hasLayer(tempLayer)) {
    map.removeLayer(tempLayer);
  }

  if (rainLayer && map.hasLayer(rainLayer)) {
    map.removeLayer(rainLayer);
  }
}