// ==========================
// STATS MODULE
// ==========================

import { getVessels } from "../core/api.js";

// ==========================
// INIT STATS
// ==========================

export function initStats() {
  updateStats();

  // update otomatis setiap 5 detik (opsional real-time)
  setInterval(updateStats, 5000);
}

// ==========================
// UPDATE STATS
// ==========================

async function updateStats() {
  try {
    const data = await getVessels();

    if (!data.vessels || !Array.isArray(data.vessels)) {
      console.warn("Data vessels tidak valid");
      return;
    }

    const vessels = data.vessels;

    // ==========================
    // HITUNG DATA
    // ==========================

    let total = vessels.length;
    let cargo = 0;
    let tanker = 0;
    let passenger = 0;
    let fishing = 0;
    let other = 0;

    vessels.forEach((ship) => {
      const type = (ship["ship type"] || "").toLowerCase();

      if (type.includes("cargo")) cargo++;
      else if (type.includes("tanker")) tanker++;
      else if (type.includes("passenger")) passenger++;
      else if (type.includes("fishing")) fishing++;
      else other++;
    });

    // ==========================
    // UPDATE DOM
    // ==========================

    setText("total", total);
    setText("cargo", cargo);
    setText("tanker", tanker);
    setText("passenger", passenger);
    setText("fishing", fishing);
    setText("other", other);

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ==========================
// HELPER UPDATE DOM
// ==========================

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}