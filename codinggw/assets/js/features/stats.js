import { getVessels } from "../core/api.js";
import { getStatsTableRowTemplate } from "../ui/templates.js";

// Global Variables
let chartInstances = {};
let currentVesselsData = []; // Menyimpan data terakhir untuk diekspor

// ==========================
// 1. INIT STATS
// ==========================
export function initStats() {
  setupThemeToggle();
  setupExportCSV();

  if (typeof Chart !== "undefined") {
    setGlobalChartDefaults();
  } else {
    console.error("Chart.js tidak dimuat!");
    return;
  }

  // Mulai tarik data
  updateStats();
  setInterval(updateStats, 5000);
}

// ==========================
// 2. FUNGSI PENGEMBANGAN: THEME TOGGLE
// ==========================
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const htmlEl = document.documentElement;

  // Cek LocalStorage untuk tema yang tersimpan
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    htmlEl.classList.add("dark");
  } else {
    htmlEl.classList.remove("dark");
  }

  toggleBtn?.addEventListener("click", () => {
    htmlEl.classList.toggle("dark");

    // Simpan ke LocalStorage dan render ulang chart agar warna teks mengikuti tema
    if (htmlEl.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }

    setGlobalChartDefaults();
    updateStats(); // Render ulang grafik
  });
}

// ==========================
// 3. FUNGSI PENGEMBANGAN: EXPORT CSV
// ==========================
function setupExportCSV() {
  const exportBtn = document.getElementById("export-csv-btn");

  exportBtn?.addEventListener("click", () => {
    if (currentVesselsData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // Header Kolom CSV
    const headers = [
      "MMSI",
      "Ship Type",
      "Owner",
      "Country",
      "Speed",
      "Course",
      "Latitude",
      "Longitude",
      "Status",
      "Jarak Dari Pelabuhan (km)",
      "Last Update",
    ];

    // Isi Baris CSV
    const csvRows = currentVesselsData.map((v) => {
      return [
        v.mmsi || "",
        v["ship type"] || "",
        v.owner || "",
        v.country || "",
        v.speed || 0,
        v.course || 0,
        v.lat || "",
        v.lon || "",
        v.status || "",
        v["jarak"] || "",
        v.waktu || "",
      ]
        .map((field) => `"${field}"`)
        .join(",");
    });

    // Gabungkan Header dan Baris
    const csvString = [headers.join(","), ...csvRows].join("\n");

    // Buat Blob dan Download File
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Vessel_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// ==========================
// 4. CHART DEFAULTS
// ==========================
function setGlobalChartDefaults() {
  const isDark = document.documentElement.classList.contains("dark");

  Chart.defaults.color = isDark ? "#94a3b8" : "#64748b"; // Text color
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.elements.bar.borderRadius = 4;
}

// ==========================
// 5. UPDATE DATA & RENDER
// ==========================
async function updateStats() {
  try {
    const data = await getVessels();
    const vessels = Array.isArray(data) ? data : data.vessels || [];

    currentVesselsData = vessels; // Simpan untuk fungsi export CSV

    if (vessels.length === 0) return;

    let total = vessels.length;
    let sailing = 0,
      anchored = 0,
      totalSpeed = 0;
    let typesCount = {},
      countryCount = {},
      speedDist = { "0-5": 0, "6-10": 0, "11-15": 0, "16+": 0 };

    vessels.forEach((v) => {
      const speed = parseFloat(v.speed) || 0;
      const type =
        v["ship type"] && v["ship type"] !== "N/A" ? v["ship type"] : "Other";
      const country = v.country || "Unknown";

      totalSpeed += speed;
      if (speed > 0) sailing++;
      else anchored++;

      typesCount[type] = (typesCount[type] || 0) + 1;
      countryCount[country] = (countryCount[country] || 0) + 1;

      if (speed <= 5) speedDist["0-5"]++;
      else if (speed <= 10) speedDist["6-10"]++;
      else if (speed <= 15) speedDist["11-15"]++;
      else speedDist["16+"]++;
    });

    const avgSpeed = total > 0 ? (totalSpeed / total).toFixed(1) : "0.0";

    // Update DOM Cards
    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-speed").textContent = avgSpeed;
    document.getElementById("stat-sailing").textContent = sailing;
    document.getElementById("stat-anchored").textContent = anchored;

    // Palet Warna
    const colorPalette = [
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
    ];

    // Render Charts
    renderChart(
      "chart-types",
      "doughnut",
      Object.keys(typesCount),
      Object.values(typesCount),
      colorPalette,
      {
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, padding: 20 },
          },
        },
      },
    );

    const sortedCountries = Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    renderChart(
      "chart-countries",
      "bar",
      sortedCountries.map((c) => c[0]),
      sortedCountries.map((c) => c[1]),
      ["#3b82f6"],
      {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false, grid: { display: false } },
          y: { grid: { display: false }, border: { display: false } },
        },
      },
    );

    renderChart(
      "chart-speed-dist",
      "bar",
      Object.keys(speedDist),
      Object.values(speedDist),
      ["#06b6d4"],
      {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { display: false, grid: { display: false } },
        },
      },
    );

    updateTable(vessels);
  } catch (err) {
    console.error("Stats Error:", err);
  }
}

// ==========================
// 6. HELPER RENDER CHART & TABEL
// ==========================
function renderChart(canvasId, type, labels, data, colors, extraOptions = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

  chartInstances[canvasId] = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: type === "doughnut" ? 4 : 0,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, ...extraOptions },
  });
}

function updateTable(vessels) {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const recentVessels = [...vessels]
    .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
    .slice(0, 10);

  recentVessels.forEach((v) => {
    const isSailing = parseFloat(v.speed) > 0;
    const statusBadge = isSailing
      ? `<span class="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase">Berlayar</span>`
      : `<span class="bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase">Berlabuh</span>`;

    const tr = document.createElement("tr");
    tr.className =
      "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors";
    tr.innerHTML = getStatsTableRowTemplate(v, statusBadge);
    tbody.appendChild(tr);
  });
}
