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
    .on("click", function (e) {
      L.DomEvent.stopPropagation(e);
      showVesselPanels(vessel);
    });
  // .bindPopup(
  //   "MMSI: " +
  //     vessel.mmsi +
  //     "<br>" +
  //     "Speed: " +
  //     vessel.speed +
  //     " km/h<br>" +
  //     "Course: " +
  //     vessel.course +
  //     "<br>" +
  //     "Waktu: " +
  //     vessel.waktu +
  //     "<br>" +
  //     "Status: " +
  //     vessel.status +
  //     "<br>" +
  //     "Direction: " +
  //     calculateDirection(vessel.course) +
  //     "<br>" +
  //     "Country: " +
  //     vessel.country +
  //     "<br>" +
  //     "Owner: " +
  //     vessel.owner +
  //     "<br>" +
  //     "Ship Type: " +
  //     vessel["ship type"],
  // );
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

function showVesselPanels(v) {
  const panel = document.getElementById("vessel-detail-panel");
  const content = document.getElementById("panel-content");
  const direction = calculateDirection(v.course);
  content.innerHTML = createVesselHTML(v, direction);
  panel.classList.remove("opacity-0", "invisible");
  content.classList.remove("scale-95");
  content.classList.add("scale-100");
}

function closeVesselPanel() {
  const panel = document.getElementById("vessel-detail-panel");
  const content = document.getElementById("panel-content");

  if (panel && content) {
    panel.classList.add("opacity-0", "invisible");
    content.classList.remove("scale-100");
    content.classList.add("scale-95");
  }
}

window.closeVesselPanel = closeVesselPanel;

function createVesselHTML(v, direction) {
  return `
    <button onclick="closeVesselPanel()" class="absolute right-3 top-3 z-10 bg-white/80 backdrop-blur rounded-full p-1 shadow-md hover:bg-gray-100 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>

    <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <img src="https://flagcdn.com/w40/${v.country || "lr"}.png" class="w-6 h-4 object-cover rounded-sm shadow-sm" alt="flag">
        <div>
            <h3 class="font-bold text-gray-800 leading-none uppercase tracking-tight">${v.owner || v.mmsi}</h3>
            <span class="text-[11px] text-gray-500 font-medium uppercase">${v["ship type"] || "Container Ship"}</span>
        </div>
    </div>

    <div class="relative h-48 bg-gray-200">
        <img src="${v.image_url || "https://images.unsplash.com/photo-1544449553-3b1a8f331265?q=80&w=500"}" 
             class="w-full h-full object-cover" />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
            <p class="text-[10px] opacity-80">© Photo by MarineTraffic Community</p>
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
                    <div class="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
                        <div class="bg-sky-400 h-full" style="width: 65%"></div>
                    </div>
                    <div class="absolute left-[65%] -translate-y-1/2 top-1/2">
                        <svg class="w-5 h-5 text-sky-500 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="text-center flex-1">
                <div class="text-2xl font-bold text-gray-800 leading-tight">BCN</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase">Destination</div>
            </div>
        </div>

        <div class="flex justify-between text-[11px] mb-4 text-gray-600 px-2">
            <div class="text-left">
                <span class="block text-gray-400 font-semibold uppercase text-[9px]">ATD</span>
                2024-04-20 06:12
            </div>
            <div class="text-right">
                <span class="block text-gray-400 font-semibold uppercase text-[9px]">Reported ETA</span>
              ${v.waktu}
            </div>
        </div>

        <div class="flex gap-2 mb-4">
            <button class="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                Past Track
            </button>
            <button class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-lg transition">
                Route Forecast
            </button>
        </div>

        <div class="grid grid-cols-3 gap-0 border-t border-gray-100">
            <div class="p-3 border-r border-gray-100">
                <div class="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-tight">Nav Status</div>
                <div class="text-[11px] font-bold text-green-600 line-clamp-2 uppercase">${v.status}</div>
            </div>
            <div class="p-3 border-r border-gray-100 text-center">
                <div class="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-tight">Speed/Course</div>
                <div class="text-[11px] font-bold text-gray-800">${v.speed} kn / ${calculateDirection(v.course)} (${v.course}°)</div>
            </div>
            <div class="p-3 text-right">
                <div class="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-tight">Draught</div>
                <div class="text-[11px] font-bold text-gray-800">${v.draught || "14.6"}m</div>
            </div>
        </div>
    </div>

    <div class="bg-gray-50 px-4 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <span>Received: 57 minutes ago</span>
        <span class="font-semibold text-sky-500 uppercase">AIS Source: Roaming</span>
    </div>
    `;
}
