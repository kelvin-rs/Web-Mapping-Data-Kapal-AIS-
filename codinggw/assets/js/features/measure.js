// ==========================
// MEASURE MODULE
// ==========================

let distanceControl = null;
let measureActive = false;

// ==========================
// INIT MEASURE
// ==========================

export function initMeasure(map) {
  // init draw control (polyline)
  distanceControl = new L.Draw.Polyline(map, {
    metric: true,
    shapeOptions: {
      color: "#ff0000",
      weight: 3,
    },
  });

  // ==========================
  // EVENT: SELESAI GAMBAR
  // ==========================
  map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    map.addLayer(layer);

    const latlngs = layer.getLatLngs();
    let distance = 0;

    for (let i = 0; i < latlngs.length - 1; i++) {
      distance += latlngs[i].distanceTo(latlngs[i + 1]);
    }

    // tampilkan hasil dalam km
    alert("Total distance: " + (distance / 1000).toFixed(2) + " km");
  });
}

// ==========================
// TOGGLE MEASURE (dipanggil dari sidebar)
// ==========================

export function toggleMeasure(map) {
  if (!distanceControl) {
    console.error("Measure belum di-init");
    return;
  }

  if (!measureActive) {
    distanceControl.enable();
    measureActive = true;
  } else {
    distanceControl.disable();
    measureActive = false;
  }
}