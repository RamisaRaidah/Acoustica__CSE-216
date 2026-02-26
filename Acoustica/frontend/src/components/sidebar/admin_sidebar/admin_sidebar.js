export async function loadAdminSidebar() {
    const sidebar = document.getElementById('sidebar');
    const response = await fetch('/src/components/sidebar/admin_sidebar/admin_sidebar.html');
    sidebar.innerHTML = await response.text();
    sidebar.style.setProperty('display', 'block', 'important');
}