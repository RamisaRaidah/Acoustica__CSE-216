export function createNavbar(activePage) {
  return `
    <nav class="navbar">
      <div class="nav-brand">Acoustica</div>
      <div class="nav-links">
        <a href="/home" class="nav-btn ${activePage === 'home' ? 'active' : ''}" data-link>
          Home
        </a>
        <a href="/assets" class="nav-btn ${activePage === 'assets' ? 'active' : ''}" data-link>
          View Assets
        </a>
      </div>
    </nav>
  `;
}