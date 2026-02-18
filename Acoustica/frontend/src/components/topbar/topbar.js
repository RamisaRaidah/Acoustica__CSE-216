const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "/src/components/topbar/topbar.css";
document.head.appendChild(link);

export async function loadTopbar() {
  const result = await fetch('/src/components/topbar/topbar.html');
  const html = await result.text();

  document.getElementById('topbar').innerHTML = html;
}