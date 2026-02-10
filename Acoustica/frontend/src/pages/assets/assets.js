import api from '../../services/api.js';
import { createNavbar, createAssetCard } from '../../components/index.js';

export async function renderAssets() {
  const navbarContainer = document.getElementById('navbar');
  const contentContainer = document.getElementById('content');
  
  navbarContainer.innerHTML = createNavbar('assets');

  try {
    const response=await fetch('/src/pages/assets/assets.html');
    const htmlTemplate=await response.text();
    contentContainer.innerHTML = htmlTemplate;

    const assetList = document.getElementById('assetList');
    const assets = await api.getAssets();

    if (assets.length === 0) {
      assetList.innerHTML = `<p class="no-data">No assets found in the database.</p>`;
      return;
    }

    assetList.innerHTML = assets.map(asset => createAssetCard(asset)).join('');

  } catch (err) {
    console.error("Error loading assets:", err);
    contentContainer.innerHTML = `
      <div class="error-container">
        <p class="error-message">Failed to load assets. Ensure backend is running at port 8000.</p>
      </div>
    `;
  }
}