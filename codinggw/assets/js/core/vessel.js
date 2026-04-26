import { getVessels } from "./api.js"; //Mengambil data kapal dari API

let markers = {}; // Menyimpan marker per MMSI
let vesselHistory = {}; // Menyimpan history posisi per MMSI
let historyLines = {}; // Menyimpan polyline history untuk tiap MMSI
let lastVessels = []; // Menyimpan data kapal terakhir yang diterima
let dataProcessor = null; // Fungsi untuk memproses data sebelum render (untuk filter/search/dll)

// Fungsi untuk menghitung arah berdasarkan course
function calculateDirection(course) {
  if (course >= 0 && course < 45) return "North";
  if (course >= 45 && course < 135) return "East";
  if (course >= 135 && course < 225) return "South";
  if (course >= 225 && course < 315) return "West";
  return "North"; // Default jika nilai course tidak valid
}

// Fungsi untuk menyimpan history posisi kapal
function saveVesselHistory(mmsi, lat, lon, waktu) {
  if (!vesselHistory[mmsi]) {
    vesselHistory[mmsi] = []; // Buat array baru jika belum ada
  }
  vesselHistory[mmsi].push({ lat: lat, lon: lon, waktu: waktu });

  // Batasi jumlah history untuk menghindari penggunaan memori besar
  if (vesselHistory[mmsi].length > 50) {
    // Simpan hanya 50 koordinat terakhir
    vesselHistory[mmsi].shift();
  }
}

//Fungsi Icon kapal berdasarkan tipe dan owner
function getShipIconUrl(vessel) {
  let shipIconUrl;

  if (vessel.owner === "Ship") {
    switch (vessel["ship type"]) {
      case "Cargo Ship":
        shipIconUrl = "assets/images/cargo.svg";
        break;
      case "Tanker":
        shipIconUrl = "assets/images/tanker.svg";
        break;
      case "Passenger Ship":
        shipIconUrl = "assets/images/passenger.svg";
        break;
      case "Fishing Vessel":
        shipIconUrl = "assets/images/fishing.svg";
        break;
      default:
        shipIconUrl = "assets/images/sna.svg";
        break;
    }
  } else if (vessel.owner === "Coastal Station") {
    shipIconUrl = "assets/images/coastal.svg";
  } else if (vessel.owner === "Group of ships") {
    shipIconUrl = "assets/images/gos.svg";
  } else if (vessel.owner === "SAR — Search and Rescue Aircraft") {
    shipIconUrl = "assets/images/SAR.svg";
  } else if (vessel.owner === "Diver's radio") {
    shipIconUrl = "assets/images/diverradio.svg";
  } else if (vessel.owner === "Aids to navigation") {
    shipIconUrl = "assets/images/navigasi.svg";
  } else if (vessel.owner === "Auxiliary craft associated with parent ship") {
    shipIconUrl = "assets/images/auxiliary.svg";
  } else if (vessel.owner === "AIS SART — Search and Rescue Transmitter") {
    shipIconUrl = "assets/images/aissart.svg";
  } else if (vessel.owner === "MOB — Man Overboard Device") {
    shipIconUrl = "assets/images/mob.svg";
  } else if (
    vessel.owner === "EPIRB — Emergency Position Indicating Radio Beacon"
  ) {
    shipIconUrl = "assets/images/beacon.svg";
  } else {
    shipIconUrl = "assets/images/na.svg";
  }
  return shipIconUrl;
}

// Fungsi untuk membuat marker kapal
function createMarker(map, vessel) {
  const shipIconUrl = getShipIconUrl(vessel);

  const shipIcon = L.icon({
    iconUrl: shipIconUrl,
    iconSize: [26, 26], //Ukuran Ikon
    iconAnchor: [13, 13], //Titik anchar
    popupAnchor: [0, -12], //Posisi popup
  });

  return L.marker([vessel.lat, vessel.lon], {
    icon: shipIcon,
    rotationAngle: vessel.course || 0,
    rotationOrigin: "center",
  })
    .addTo(map)
    .bindPopup(
      "MMSI: " +
        vessel.mmsi +
        "<br>" +
        "Speed: " +
        vessel.speed +
        " km/h<br>" +
        "Course: " +
        vessel.course +
        "<br>" +
        "Waktu: " +
        vessel.waktu +
        "<br>" +
        "Status: " +
        vessel.status +
        "<br>" +
        "Direction: " +
        calculateDirection(vessel.course) +
        "<br>" +
        "Country: " +
        vessel.country +
        "<br>" +
        "Owner: " +
        vessel.owner +
        "<br>" +
        "Ship Type: " +
        vessel["ship type"],
    );
}

// Fungsi untuk memperbarui posisi marker kapal
function updateMarker(marker, vessel) {
  marker
    .setLatLng([vessel.lat, vessel.lon])
    .setRotationAngle(vessel.course || 0);
}

// Fungsi untuk memperbarui kapal di peta
function updateVesselsOnMap(map, vesselList) {
  const currentMMSI = new Set(vesselList.map((v) => v.mmsi));
  // Hapus marker kapal yang sudah tidak ada di data terbaru
  Object.keys(markers).forEach((mmsi) => {
    if (!currentMMSI.has(mmsi)) {
      map.removeLayer(markers[mmsi]);
      delete markers[mmsi];
    }
  });
  // Tambahkan atau perbarui marker kapal yang ada di data terbaru
  vesselList.forEach((vessel) => {
    if (!vessel.lat || !vessel.lon) return;

    saveVesselHistory(vessel.mmsi, vessel.lat, vessel.lon, vessel.waktu);

    if (markers[vessel.mmsi]) {
      updateMarker(markers[vessel.mmsi], vessel);
    } else {
      markers[vessel.mmsi] = createMarker(map, vessel);
    }
  });
}

// Fungsi untuk memproses data kapal dengan filter/search sebelum render
function processAndRender(map) {
  let vessels = lastVessels;

  if (typeof dataProcessor === "function") {
    vessels = dataProcessor(vessels);
  }

  updateVesselsOnMap(map, vessels);
}

// Fungsi untuk mengatur data processor (filter/search) dan langsung trigger render
export function setDataProcessor(fn, map) {
  dataProcessor = fn;
  processAndRender(map);
}

// Fungsi untuk menghapus data processor dan menampilkan semua kapal real-time
export function clearProcessor(map) {
  dataProcessor = null;
  processAndRender(map);
}

export function getLastVessels() {
  return lastVessels;
} 

// Fungsi untuk memulai polling kapal
export function startVesselPolling(map) {
  async function poll() {
    try {
      const data = await getVessels();

      if (data.vessels && Array.isArray(data.vessels)) {
        lastVessels = data.vessels;
        processAndRender(map);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }

    setTimeout(poll, 5000);
  }
  poll();
}