import { loadArtistSidebar } from '/src/components/sidebar/artist_sidebar/artist_sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';

export async function renderArtistDashboard() {
    await Promise.all([
      loadArtistSidebar(),
      loadTopbar()
    ]);

    const response = await fetch('src/pages/user/artist/artist_dashboard/artist_dashboard.html');
    document.getElementById('content').innerHTML = await response.text();
}