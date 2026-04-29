let activeVessel = null;

export function showVesselPanel(vessel) {
  updatePanel(vessel);

  const panel = document.getElementById("vessel-panel");
  panel.classList.remove("right-[-320px]");
  panel.classList.add("right-0");
}

export function updatePanel(vessel) {
  set("vp-title", vessel.name || vessel.mmsi);
  set("vp-speed", vessel.speed || 0);
  set("vp-status", vessel.status);
  set("vp-mmsi", vessel.mmsi);
  set("vp-course", vessel.course);
  set("vp-country", vessel.country);
  set("vp-type", vessel["ship type"]);
}

export function initPanel() {
  document.getElementById("close-panel")?.addEventListener("click", () => {
    const panel = document.getElementById("vessel-panel");
    panel.classList.remove("right-0");
    panel.classList.add("right-[-320px]");
  });
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "-";
}

export function getActiveVessel() {
  return activeVessel;
}
