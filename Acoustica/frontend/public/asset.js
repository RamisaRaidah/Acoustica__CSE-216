async function loadAssets() {
    const container = document.getElementById("assetList");

    try {
        // Fetching from the backend's asset route
        const res = await fetch("http://localhost:8000/assets");
        const assets = await res.json();

        if (assets.length === 0) {
            container.innerHTML = `<p>No assets found in the database.</p>`;
            return;
        }

        // Mapping through the data to create cards
        container.innerHTML = assets.map(item => `
            <div class="asset-card">
                <div style="font-size: 2rem; margin-bottom: 10px;">🎵</div>
                <h3 style="margin: 0; color: #38bdf8;">${item.type}</h3>
                <p style="color: #94a3b8; font-size: 0.8rem;">ID: ${item.id}</p>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error:", err);
        container.innerHTML = `<p style="color: #ef4444;">Failed to load assets. Ensure backend is running.</p>`;
    }
}

window.onload = loadAssets;