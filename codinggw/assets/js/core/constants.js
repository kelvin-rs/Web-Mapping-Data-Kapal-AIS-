// ==========================================
// API CONFIGURATION
// ==========================================
export const BASE_URL = "http://localhost/Web%20AIS/codinggw/assets/php/get_vessels.php";

// ==========================================
// DIRECTORY PATHS
// ==========================================
export const ASSETS_PATH_ICON = "assets/resource/v2/";
export const ASSETS_PATH_IMG = "assets/resource/3D_Image_Vessel/";

// ==========================================
// VESSEL TYPES & ICONS MAPPING
// ==========================================
export const SHIP_TYPES = {
  "Cargo Ship": { icon: "cargoship.svg", img: "CargoShip.jpg" },
  Tanker: { icon: "tanker.svg", img: "Tanker.jpg" },
  "Passenger Ship": { icon: "passengership.svg", img: "PassengerShip.jpg" },
  "Fishing Vessel": { icon: "fishingvessel.svg", img: "FishingVessel.jpg" },
};

export const OWNER_TYPES = {
  "Coastal Station": { icon: "Coastal Station.svg", img: "CoastalStation.jpg" },
  "Group of ships": { icon: "Group of ships.svg", img: "GroupOfShips.jpg" },
  "SAR — Search and Rescue Aircraft": {
    icon: "SAR Search and Rescue Aircraft.svg",
    img: "SAR.jpg",
  },
  "Diver's radio": { icon: "Diver_s radio.svg", img: "Diver_s radio.jpg" },
  "Aids to navigation": {
    icon: "Aids to navigation.svg",
    img: "AidsToNavigate.jpg",
  },
  "Auxiliary craft associated with parent ship": {
    icon: "Auxiliary craft Associated with parent ship.svg",
    img: "AuxilaryCraft.jpg",
  },
  "AIS SART — Search and Rescue Transmitter": {
    icon: "AIS SART search and rescue transmitter.svg",
    img: "AisSart.jpg",
  },
  "MOB — Man Overboard Device": {
    icon: "MOB man overboard device.svg",
    img: "MOB.jpg",
  },
  "EPIRB — Emergency Position Indicating Radio Beacon": {
    icon: "EPIRB emergency position indicating radio beacon.svg",
    img: "EPIRB.jpg",
  },
};
