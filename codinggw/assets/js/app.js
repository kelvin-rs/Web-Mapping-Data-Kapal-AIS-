// Initialize the map
var map = L.map("map", {
  attributionControl: false,
  zoomControl: false,
  minZoom: 2,
  maxBounds: [
    [-90, -180],
    [90, 180],
  ],
}).setView([-7.2458, 112.7378], 10); // Surabaya, Indonesia

// Define different map themes

var realMap = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
  },
);

// var realMap = L.tileLayer(
//   "https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=emUo6vGrhbHupr8kapDdW1xAIhS2fOJNZZFCxTy1YmOZM8C9q3PzIY2YwYRtSsct",
//   {
//     maxZoom: 22,
//     attribution:
//       '<a href="https://www.jawg.io" target="_blank">&copy; Jawg</a> - ' +
//       '<a href="https://www.openstreetmap.org" target="_blank">&copy; OpenStreetMap</a> contributors',
//   },
// );

var lightMap = L.tileLayer(
  "https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}",
  {
    attribution:
      '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 22,
    accessToken:
      "emUo6vGrhbHupr8kapDdW1xAIhS2fOJNZZFCxTy1YmOZM8C9q3PzIY2YwYRtSsct",
  },
);

var darkMap = L.tileLayer(
  "https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}",
  {
    attribution:
      '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 22,
    accessToken:
      "emUo6vGrhbHupr8kapDdW1xAIhS2fOJNZZFCxTy1YmOZM8C9q3PzIY2YwYRtSsct",
  },
);

var Satellite_Map = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: -1,
    maxZoom: 20,
    attribution:
      '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "jpg",
  },
);

realMap.addTo(map); // Add the initial map layer

// Add custom zoom control in the bottom-right corner
L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);

// Add layer control to switch between map themes
var baseMaps = {
  "Base Map": realMap,
  "Light Map": lightMap,
  "Dark Map": darkMap,
  "Satellite Map": Satellite_Map,
};

L.control.layers(baseMaps).addTo(map);

var apiUrl = "http://localhost/Web%20AIS/codinggw/assets/php/get_vessels.php";
var markers = {}; // Menyimpan marker per MMSI
var vesselHistory = {}; // Menyimpan history posisi per MMSI
//var historyLines = {}; // Menyimpan polyline history untuk tiap MMSI

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

// Ambil data kapal secara berkala
setInterval(() => {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched Data:", data); // Debug data dari API
      if (data.vessels && Array.isArray(data.vessels)) {
        updateVesselsOnMap(data.vessels); // Perbarui kapal di peta
      } else {
        console.warn("Data vessels tidak valid:", data);
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
}, 5000); // Polling setiap 5 detik

// Fungsi untuk memperbarui kapal di peta
function updateVesselsOnMap(vesselList) {
  vesselList.forEach(function (vessel) {
    if (vessel.lat && vessel.lon) {
      // Pastikan koordinat valid
      // Simpan posisi terbaru dalam history
      saveVesselHistory(vessel.mmsi, vessel.lat, vessel.lon, vessel.waktu);

      // Jika marker sudah ada, update posisi dan rotasi
      if (markers[vessel.mmsi]) {
        markers[vessel.mmsi]
          .setLatLng([vessel.lat, vessel.lon])
          .setRotationAngle(vessel.course || 0); // Koreksi rotasi
      } else {
        // Pilih ikon berdasarkan kombinasi owner dan shipType
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
              shipIconUrl = "assets/images/sna.svg"; // Ikon default jika shipType tidak cocok
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
        } else if (
          vessel.owner === "Auxiliary craft associated with parent ship"
        ) {
          shipIconUrl = "assets/images/auxiliary.svg";
        } else if (
          vessel.owner === "AIS SART — Search and Rescue Transmitter"
        ) {
          shipIconUrl = "assets/images/aissart.svg";
        } else if (vessel.owner === "MOB — Man Overboard Device") {
          shipIconUrl = "assets/images/mob.svg";
        } else if (
          vessel.owner === "EPIRB — Emergency Position Indicating Radio Beacon"
        ) {
          shipIconUrl = "assets/images/beacon.svg";
        } else {
          shipIconUrl = "assets/images/na.svg"; // Ikon default
        }

        var shipIcon = L.icon({
          iconUrl: shipIconUrl,
          iconSize: [26, 26], // Ukuran ikon
          iconAnchor: [13, 13], // Titik anchor
          popupAnchor: [0, -12], // Posisi popup
        });

        // Tambahkan marker baru
        var marker = L.marker([vessel.lat, vessel.lon], {
          icon: shipIcon, // Gunakan objek L.icon
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
        markers[vessel.mmsi] = marker; // Simpan marker ke dalam markers
      }
    } else {
      console.log("Skipping invalid vessel:", vessel);
    }
  });
}

//untuk menutup opsi
function closeAllDropdowns(exceptId) {
  const dropdowns = document.querySelectorAll(
    ".dropdown-filter, .weather-legend, .dropdown-ship-types, .stats-section",
  );
  dropdowns.forEach((dropdown) => {
    if (dropdown.id !== exceptId) {
      dropdown.style.display = "none";
    }
  });
}

/*   opsi filter kapal   */
function toggleFilter() {
  closeAllDropdowns("dropdown-filter"); // Close other dropdowns
  const dropdown = document.getElementById("dropdown-filter");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Fungsi untuk menerapkan filter berdasarkan input pengguna
let activeFilter = null; // Menyimpan filter yang sedang aktif
function applyFilter() {
  const type = document.getElementById("shipType").value;
  const speed = document.getElementById("shipSpeed").value;
  const status = document.getElementById("shipStatus").value.toLowerCase();
  const country = document.getElementById("shipCountry").value.toLowerCase();
  const owner = document.getElementById("shipOwner").value;

  activeFilter = { type, speed, status, country, owner }; // Simpan filter aktif

  // Ambil data dari API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.vessels && Array.isArray(data.vessels)) {
        const filteredVessels = data.vessels.filter((ship) => {
          return (
            (type === "" || ship.type === type || ship["ship type"] === type) &&
            (speed === "" || (ship.speed && ship.speed >= parseInt(speed))) &&
            (status === "" ||
              (ship.status && ship.status.toLowerCase() === status)) &&
            (country === "" ||
              (ship.country && ship.country.toLowerCase().includes(country))) &&
            (owner === "" || (ship.owner && ship.owner === owner))
          );
        });
        console.log("Filtered Vessels:", filteredVessels);
        // Hapus marker lama dari peta
        Object.keys(markers).forEach((mmsi) => {
          map.removeLayer(markers[mmsi]);
          delete markers[mmsi];
        });

        // Tambahkan marker baru dari hasil filter
        updateVesselsOnMap(filteredVessels);
      } else {
        console.error("Data vessels tidak valid:", data);
      }
    })
    .catch((error) => console.error("Error filtering data:", error));
}

//buat search button
document.getElementById("search-btn").addEventListener("click", function () {
  var query = document.getElementById("search-bar").value.toLowerCase(); // Ambil input dari search bar
  // Ambil data kapal langsung dari API dan filter berdasarkan query
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.vessels && Array.isArray(data.vessels)) {
        // Filter data kapal berdasarkan query pencarian
        const filteredVessels = data.vessels.filter(function (vessel) {
          // Cek kecocokan pada semua atribut kapal
          return Object.keys(vessel).some((key) => {
            if (vessel[key] && typeof vessel[key] === "string") {
              return vessel[key].toLowerCase().includes(query);
            }
            return false;
          });
        });

        console.log("Filtered Vessels (Search):", filteredVessels);

        // Hapus marker lama dari peta
        Object.keys(markers).forEach((mmsi) => {
          map.removeLayer(markers[mmsi]);
          delete markers[mmsi];
        });

        // Tambahkan marker kapal yang terfilter ke peta
        updateVesselsOnMap(filteredVessels);
      } else {
        console.error("Invalid API response:", data);
      }
    })
    .catch((error) => console.error("Error fetching data for search:", error));
});

// Menginisialisasi layer cuaca dari OpenWeatherMap
var apiKey = "ea5a726a363c40c1efdadacc743c32d7"; // Ganti dengan API Key Anda
var windLayer = L.OWM.wind({ appId: apiKey, showLegend: false });
var tempLayer = L.OWM.temperature({ appId: apiKey, showLegend: false });
var rainLayer = L.OWM.precipitation({ appId: apiKey, showLegend: false });

// Fungsi untuk menghapus semua layer cuaca dari peta
function removeAllWeatherLayers() {
  map.removeLayer(windLayer);
  map.removeLayer(tempLayer);
  map.removeLayer(rainLayer);
}

// Menambahkan event listener untuk setiap radio button cuaca
document.querySelectorAll('input[name="weatherLayer"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    removeAllWeatherLayers(); // Hapus semua layer saat radio button berubah

    // Tambahkan layer berdasarkan radio button yang dipilih
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
        // Tidak ada layer yang ditampilkan
        break;
    }
  });
});

// Saat halaman dimuat, pastikan tidak ada layer yang tertumpuk
window.addEventListener("load", () => {
  removeAllWeatherLayers();
});

function toggleWeather() {
  closeAllDropdowns("weather-legends");
  const dropdown = document.getElementById("weather-legends");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function toggleShipTypes() {
  closeAllDropdowns("dropdown-ship-types");
  const dropdown = document.getElementById("dropdown-ship-types");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Panggil fungsi untuk memperbarui statistik
window.onload = updateStats;

function toggleStats() {
  closeAllDropdowns("stats-section");
  const dropdown = document.getElementById("stats-section");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

/* untuk jarak */
var distanceMeasureActive = false;
var distanceControl = new L.Draw.Polyline(map, { metric: true });

function toggleDistanceMeasure() {
  if (!distanceMeasureActive) {
    // Aktifkan pengukuran jarak
    distanceControl.enable();
    distanceMeasureActive = true;
  } else {
    // Nonaktifkan pengukuran jarak
    distanceControl.disable();
    distanceMeasureActive = false;
  }
}

// Event handler untuk menyelesaikan pengukuran dan menghitung jarak
map.on(L.Draw.Event.CREATED, function (event) {
  var layer = event.layer;
  map.addLayer(layer);

  var latlngs = layer.getLatLngs();
  var distance = 0;

  for (var i = 0; i < latlngs.length - 1; i++) {
    distance += latlngs[i].distanceTo(latlngs[i + 1]);
  }

  alert("Total distance: " + (distance / 1000).toFixed(2) + " km");
});

//gambar didropdown
document.getElementById("shipType").addEventListener("change", function () {
  const shipType = this.value;
  const iconDisplay = document.getElementById("selectedIconDisplay");
  let iconPath = "";

  switch (shipType) {
    case "cargo":
      iconPath = "cargo.svg";
      break;
    case "tanker":
      iconPath = "tanker.svg";
      break;
    case "passenger":
      iconPath = "passenger.svg";
      break;
    case "fishing":
      iconPath = "fishing.svg";
      break;
  }

  if (iconPath) {
    iconDisplay.innerHTML = `<img src="${iconPath}" alt="Ship Icon" style="width:40px; height:40px;">`;
  } else {
    iconDisplay.innerHTML = ""; // Kosongkan jika opsi 'Semua' dipilih
  }
});
