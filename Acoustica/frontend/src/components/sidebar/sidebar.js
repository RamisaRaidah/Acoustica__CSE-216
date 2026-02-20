export async function loadSidebar() {
  const result = await fetch('/src/components/sidebar/sidebar.html');
  const html = await result.text();

  document.getElementById('sidebar').innerHTML = html;
}

export async function removeSidebar() {
  document.getElementById('sidebar').innerHTML = "";
}
