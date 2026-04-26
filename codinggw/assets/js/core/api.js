const BASE_URL = "http://localhost/Web%20AIS/codinggw/assets/php";

// helper untuk fetch + error handling
async function request(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`);

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return { vessels: [] }; // fallback aman
  }
}

// ==========================
// ENDPOINT UTAMA
// ==========================

// ambil semua kapal
export async function getVessels() {
  return await request("get_vessels.php");
}