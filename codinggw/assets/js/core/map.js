export function initMap() {
  // Initialize the map
  const map = L.map("map", {
    renderer: L.canvas(),
    attributionControl: false,
    zoomControl: false,
    minZoom: 2,
    maxBounds: [
      [-90, -180],
      [90, 180],
    ],
  }).setView([-7.2458, 112.7378], 10); // Surabaya, Indonesia

  const realMap = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  );

  const lightMap = L.tileLayer(
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

  const darkMap = L.tileLayer(
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

  const Satellite_Map = L.tileLayer(
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
  const baseMaps = {
    "Base Map": realMap,
    "Light Map": lightMap,
    "Dark Map": darkMap,
    "Satellite Map": Satellite_Map,
  };

  L.control.layers(baseMaps).addTo(map);
  return map;
}