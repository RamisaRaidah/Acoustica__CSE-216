import { getUser } from "/src/services/user.js";

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
  register(path, handler,options = {}) {
    const keys = [];

    const pattern = this.normalize(path).replace(/\{([^}]+)\}/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });

    const regex = new RegExp("^" + pattern + "$");

    this.routes.push({ regex, keys, handler, options });
  }

  isAuthenticated(){
    return !!localStorage.getItem("token");
  }

  hasCompletedOnboarding(){
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.onboarding_completed === true;
  }

  resolve(path, push = false) {
    const normalizedPath = this.normalize(path);
    const user = getUser();

    for (const route of this.routes) {
      const match = normalizedPath.match(route.regex);
      if (!match) continue;

      if(route.options.protected && !this.isAuthenticated()){
        history.pushState({}, "", "/sign-in");  
        this.resolve("/sign-in");
        return;
      }

      if (route.options.requiresOnboarding && !this.hasCompletedOnboarding()) {
        history.pushState({}, "", "/onboarding");
        this.resolve("/onboarding");
        return;
      }

      if (normalizedPath === "/onboarding" && this.hasCompletedOnboarding()) {
        history.pushState({}, "", "/dashboard");
        this.resolve("/dashboard");
        return;
      }

      if (route.options.publicOnly && this.isAuthenticated()) {
        history.pushState({}, "", "/dashboard");
        this.resolve("/dashboard");
        return;
      }

      if (route.options.allowedRoles) {
        if (!user || !route.options.allowedRoles.includes(user.user_type)) {
          history.pushState({}, "", "/unauthorized");
          this.resolve("/unauthorized");
          return;
        }
      }

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