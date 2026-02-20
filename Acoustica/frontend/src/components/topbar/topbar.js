export async function loadTopbar() {
    const topbar = document.getElementById('topbar');
    const result = await fetch('/src/components/topbar/topbar.html');
    topbar.innerHTML = await result.text();
    topbar.style.setProperty('display', 'block', 'important');
}

export async function removeTopbar() {
    const topbar = document.getElementById('topbar');
    topbar.innerHTML = '';
    topbar.style.setProperty('display', 'none', 'important');
}