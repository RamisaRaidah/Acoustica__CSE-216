export async function loadTopbar() {
    const topbar = document.getElementById('topbar');
    const result = await fetch('/src/components/topbar/topbar.html');
    topbar.innerHTML = await result.text();
    topbar.style.setProperty('display', 'block', 'important');

    document.getElementById('toggle_button').addEventListener('click', ()=>{
        toggleAppMode();
    });

    function toggleAppMode() {
        const theme = localStorage.getItem('theme');
        document.body.classList.toggle('dark');
        if (theme === 'light') {
            localStorage.setItem('theme', 'dark');
            document.body.classList.add('dark');
            document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica2.png');
        }
        else {
            localStorage.setItem('theme', 'light');
            document.body.classList.remove('dark');
            document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica1.png');
        }
    }
}

export async function removeTopbar() {
    const topbar = document.getElementById('topbar');
    topbar.innerHTML = '';
    topbar.style.setProperty('display', 'none', 'important');
}