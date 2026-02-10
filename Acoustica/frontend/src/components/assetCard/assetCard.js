export function createAssetCard(asset) {
  const title = asset.asset_type || asset.type || 'Unknown Track';
  
  return `
    <div class="asset-card">
      <div class="asset-icon">🎵</div>
      <div class="asset-details">
        <h3 class="asset-title">${title}</h3>
        <p class="asset-id">ID: ${asset.id}</p>
      </div>
    </div>
  `;
}