async function loadHomePage() {
  const container = document.getElementById("homePage");
  
  try {
    const res = await fetch("http://localhost:8000/");
    const data = await res.json();

   
    container.innerHTML = `
      <div style="background: #252525; padding: 2rem; border-radius: 12px; border: 1px solid #444;">
        <h2 style="color: #1e90ff; margin-top: 0;">Dashboard</h2>
        <p style="color: #ccc;">Welcome to the Acoustica Control Panel.</p>
        <div style="background: #333; padding: 10px; border-radius: 6px; margin: 20px 0;">
          <strong style="color: #00ff88;">Server Message:</strong> 
          <span style="font-family: monospace;">${data.message}</span>
        </div>
        <button onclick="location.reload()" style="background: #1e90ff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          Refresh Data
        </button>
      </div>
    `;
  } catch (err) {
    console.error("Connection failed:", err);
    container.innerHTML = `
      <div style="color: #ff4d4d; border: 1px solid #ff4d4d; padding: 1rem; border-radius: 8px;">
        <strong>Connection Error:</strong> Could not reach the backend at port 8000. 
        Ensure your Docker container is running!
      </div>
    `;
  }
}

window.onload = loadHomePage;

