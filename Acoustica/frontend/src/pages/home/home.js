import api from '../../services/api.js';
import { createNavbar } from '../../components/index.js';

export async function renderHome() {
  const navbarContainer = document.getElementById('navbar');
  const contentContainer = document.getElementById('content');
  
  navbarContainer.innerHTML = createNavbar('home');
  contentContainer.innerHTML = '<p class="loading">Loading Acoustica Engine...</p>';

  try {
    const response = await fetch('/src/pages/home/home.html');
    const htmlTemplate = await response.text();

 
    const data = await api.getHome();
    
    contentContainer.innerHTML = htmlTemplate;

    document.getElementById('server-text').innerText = data.message;

    document.getElementById('refreshBtn').addEventListener('click', () => {
      renderHome();
    });
    
  } catch (err) {
    console.error("Connection failed:", err);
    contentContainer.innerHTML = `
      <div class="error-container">
        <strong>Connection Error:</strong> Could not reach the backend at port 8000.
        <br>Ensure your Docker container is running!
      </div>
    `;
  }
}