import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';

export async function renderArtistDashboard() {
  await Promise.all([
    loadSidebar(),
    loadTopbar()
  ]);

  const response = await fetch('src/pages/user/artist/artist_dashboard/artist_dashboard.html');
  document.getElementById('content').innerHTML = await response.text();
}