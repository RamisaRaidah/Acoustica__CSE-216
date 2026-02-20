export async function loadTopbar() {
  const result = await fetch('/src/components/topbar/topbar.html');
  const html = await result.text();

  document.getElementById('topbar').innerHTML = html;
}

export async function removeTopbar() {
  document.getElementById('topbar').innerHTML = "";
}