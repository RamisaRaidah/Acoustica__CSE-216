export async function loadListenerSidebar() {
    const sidebar = document.getElementById('sidebar');
    const response = await fetch('/src/components/sidebar/listener_sidebar/listener_sidebar.html');
    sidebar.innerHTML = await response.text();
    sidebar.style.setProperty('display', 'block', 'important');
}