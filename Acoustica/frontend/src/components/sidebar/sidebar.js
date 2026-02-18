const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "/src/components/sidebar/sidebar.css";
document.head.appendChild(link);

export async function loadSidebar() {
  const result = await fetch('/src/components/sidebar/sidebar.html');
  const html = await result.text();

  document.getElementById('sidebar').innerHTML = html;
}