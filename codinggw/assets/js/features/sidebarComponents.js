export async function loadSidebar() {
  const res = await fetch("assets/components/sidebar.html");
  const html = await res.text();

  const container = document.getElementById("sidebar-container");
  if (container) {
    container.innerHTML = html;
  }
}