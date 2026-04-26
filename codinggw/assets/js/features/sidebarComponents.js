export async function loadSidebar() {
  const container = document.getElementById("sidebar-container");

  if (!container) {
    console.error("sidebar container tidak ditemukan");
    return;
  }

  try {
    const res = await fetch("assets/components/sidebar.html");
    const html = await res.text();

    container.innerHTML = html;

  } catch (err) {
    console.error("Gagal load sidebar:", err);
  }
}