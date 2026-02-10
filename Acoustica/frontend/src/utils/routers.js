class Router {
  constructor() {
    this.routes = {}; // Store all registered routes
    this.currentRoute = null;
  }

  // Register a route with its handler function
  register(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate to a route
  navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = path;
      window.history.pushState({}, '', path);
      this.routes[path](); // Call the page render function
    } else {
      console.error(`Route not found: ${path}`);
    }
  }

  // Initialize router
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const path = window.location.pathname;
      if (this.routes[path]) {
        this.routes[path]();
      }
    });

    // Handle initial page load
    const path = window.location.pathname === '/' ? '/' : window.location.pathname;
    if (this.routes[path]) {
      this.routes[path]();
    }
  }
}

export default new Router();