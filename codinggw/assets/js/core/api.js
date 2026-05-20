import { BASE_URL } from "./constants.js";
import { showToast } from "./utils.js";

export async function getVessels() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Server bermasalah");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);

    showToast("Koneksi ke server terputus!", "error");

    return { vessels: [] };
  }
}

export async function fetchVesselHistory(mmsi) {
  try {
    const url = `http://localhost/Web_AIS/codinggw/assets/php/get_vessel_history.php?mmsi=${mmsi}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Gagal menarik data sejarah:", error);
    return [];
  }
}
