export async function loadAdminSidebar() {
    const sidebar = document.getElementById('sidebar');
    const response = await fetch('/src/components/sidebar/admin_sidebar/admin_sidebar.html');

    sidebar.innerHTML = await response.text();
    sidebar.style.setProperty('display', 'block', 'important');

    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica1.png');
    }
    else {
        document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica2.png');
    }
}