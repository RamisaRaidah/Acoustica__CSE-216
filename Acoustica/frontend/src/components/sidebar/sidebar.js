export async function loadSidebar() {
    const sidebar = document.getElementById('sidebar');
    const result = await fetch('/src/components/sidebar/sidebar.html');
    sidebar.innerHTML = await result.text();
    sidebar.style.setProperty('display', 'block', 'important');
}

export async function removeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    sidebar.style.setProperty('display', 'none', 'important');
}