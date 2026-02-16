class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
  }

  // Normalize path (remove trailing slash)
  normalize(path) {
    if (path.length > 1 && path.endsWith("/")) {
      return path.slice(0, -1);
    }
    return path;
  }

  // Register a route using /assets/{id}
  register(path, handler) {
    const keys = [];

    const pattern = this.normalize(path).replace(/\{([^}]+)\}/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });

    const regex = new RegExp("^" + pattern + "$");

    this.routes.push({ regex, keys, handler });
  }

  resolve(path, push = false) {
    const normalizedPath = this.normalize(path);

    for (const route of this.routes) {
      const match = normalizedPath.match(route.regex);
      if (!match) continue;

      const params = {};
      route.keys.forEach((k, i) => {
        params[k] = decodeURIComponent(match[i + 1]);
      });

      if (push) {
        history.pushState({}, "", normalizedPath);
      }

      this.currentRoute = normalizedPath;

      route.handler(params);
      return;
    }

    console.error("Route not found:", normalizedPath);
  }

  navigate(path) {
    this.resolve(path, true);
  }

  init() {
    const run = () => {
      this.resolve(window.location.pathname);
    };

    window.addEventListener("popstate", run);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    }
    else {
      run();
    }
  }
}

export default new Router();