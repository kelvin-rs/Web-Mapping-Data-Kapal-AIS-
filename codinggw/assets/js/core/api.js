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