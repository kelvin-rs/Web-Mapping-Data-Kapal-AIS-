import { initMap } from "./core/map.js";
import { startVesselPolling } from "./core/vessel.js";
import { initSidebar } from "./features/sidebar.js";
import { initFilter } from "./features/filter.js";
import { initSearch } from "./features/search.js";
import { initWeathers } from "./features/weathers.js";
import { initMeasure } from "./features/measure.js";
import { loadSidebar } from "./features/sidebarComponents.js";
import { initPastTrack } from "./features/pastTrack.js";

document.addEventListener("DOMContentLoaded", async () => {
  const map = initMap();
  await loadSidebar();
  initSidebar(map);
  // FITUR LAIN
  startVesselPolling(map);
  initFilter(map);
  initSearch(map);
  initWeathers(map);
  initMeasure(map);
  initPastTrack(map);
});
