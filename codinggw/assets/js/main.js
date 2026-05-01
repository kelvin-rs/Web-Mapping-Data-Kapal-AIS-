import { initMap } from "./core/map.js";
import { startVesselPolling } from "./core/vessel.js";
import { initSidebar } from "./features/sidebar.js";
import { initFilter } from "./features/filter.js";
import { initSearch } from "./features/search.js";
import { initWeathers } from "./features/weathers.js";
import { initMeasure } from "./features/measure.js";
import { loadSidebar } from "./features/sidebarComponents.js";
import { initPastTrack } from "./features/pastTrack.js";
import { initStats } from "./features/stats.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Muat komponen HTML Sidebar (Keduanya butuh ini)
  await loadSidebar(); 

  // 2. Cek apakah halaman saat ini memiliki elemen Peta
  const mapContainer = document.getElementById("map");

  if (mapContainer) {
    // ==========================================
    // HALAMAN UTAMA
    // ==========================================
    const map = initMap();
    initSidebar(map);
    
    startVesselPolling(map);
    initFilter(map);
    initSearch(map);
    initWeathers(map);
    initMeasure(map);
    initPastTrack(map);

  } else {
    // ==========================================
    // HALAMAN STATISTIK
    // ==========================================
    initSidebar(null); 
    initStats(); 
  }
});
