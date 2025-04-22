// Simple client-side router implementation
export type Route = {
  path: string;
  component: () => void;
  title?: string;
  requiresAuth?: boolean;
};

export type RouterOptions = {
  routes: Route[];
  rootElement?: HTMLElement | null;
  notFoundCallback?: () => void;
};

class Router {
  private routes: Route[] = [];
  private rootElement: HTMLElement | null = null;
  private notFoundCallback: (() => void) | null = null;
  private currentPath: string = '';

  constructor(options: RouterOptions) {
    this.routes = options.routes;
    this.rootElement = options.rootElement || document.getElementById('app');
    this.notFoundCallback = options.notFoundCallback || null;

    this.initializeRouter();
  }

  /**
   * Initialize the router
   */
  private initializeRouter(): void {
    // Handle initial route
    this.handleRouteChange();

    // Add event listeners for navigation
    window.addEventListener('popstate', () => this.handleRouteChange());

    // Intercept link clicks for client-side navigation
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest('a');
      
      if (closestLink && closestLink.href && closestLink.href.startsWith(window.location.origin)) {
        e.preventDefault();
        this.navigate(closestLink.pathname);
      }
    });
  }

  /**
   * Navigate to a specific path
   */
  public navigate(path: string): void {
    window.history.pushState(null, '', path);
    this.handleRouteChange();
  }

  /**
   * Handle route changes
   */
  private handleRouteChange(): void {
    const path = window.location.pathname;
    this.currentPath = path;

    // Find the matching route
    const route = this.findMatchingRoute(path);

    if (route) {
      // Update the document title if provided
      if (route.title) {
        document.title = route.title;
      }

      // Check if route requires authentication
      if (route.requiresAuth && !this.isAuthenticated()) {
        this.navigate('/login');
        return;
      }

      // Render the route component
      route.component();
    } else if (this.notFoundCallback) {
      this.notFoundCallback();
    }
  }

  /**
   * Find the route that matches the given path
   */
  private findMatchingRoute(path: string): Route | undefined {
    return this.routes.find(route => {
      // Exact match
      if (route.path === path) {
        return true;
      }

      // Path with parameters
      if (route.path.includes(':')) {
        const routeParts = route.path.split('/');
        const pathParts = path.split('/');

        if (routeParts.length !== pathParts.length) {
          return false;
        }

        return routeParts.every((part, i) => {
          return part.startsWith(':') || part === pathParts[i];
        });
      }

      return false;
    });
  }

  /**
   * Check if the user is authenticated
   */
  private isAuthenticated(): boolean {
    // Check if auth token exists in localStorage
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get the current path
   */
  public getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Get route parameters for the current path
   */
  public getParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const path = this.currentPath;
    const route = this.findMatchingRoute(path);

    if (route && route.path.includes(':')) {
      const routeParts = route.path.split('/');
      const pathParts = path.split('/');

      routeParts.forEach((part, i) => {
        if (part.startsWith(':')) {
          const paramName = part.substring(1);
          params[paramName] = pathParts[i];
        }
      });
    }

    return params;
  }
}

// Export a singleton instance
let routerInstance: Router | null = null;

export function initRouter(options: RouterOptions): Router {
  if (!routerInstance) {
    routerInstance = new Router(options);
  }
  return routerInstance;
}

export function getRouter(): Router | null {
  return routerInstance;
}

export function navigate(path: string): void {
  if (routerInstance) {
    routerInstance.navigate(path);
  } else {
    console.error('Router not initialized');
  }
} 