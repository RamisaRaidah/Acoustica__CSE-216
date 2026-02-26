export async function loadArtistSidebar() {
    const sidebar = document.getElementById('sidebar');
    const response = await fetch('/src/components/sidebar/artist_sidebar/artist_sidebar.html');
    sidebar.innerHTML = await response.text();
    sidebar.style.setProperty('display', 'block', 'important');
}