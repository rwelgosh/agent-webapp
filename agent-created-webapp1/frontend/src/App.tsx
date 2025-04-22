import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthProvider';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Items from './pages/Items';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));

  // Update path on navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleLocationChange);
    
    // Custom navigation function
    window.navigate = (path: string) => {
      window.history.pushState(null, '', path);
      handleLocationChange();
    };

    // Intercept link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        window.navigate(link.pathname);
      }
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Update authentication status when token changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('auth_token'));
    };
    
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Render the current page based on path
  const renderCurrentPage = () => {
    // Protected routes - redirect to login if not authenticated
    if (!isAuthenticated) {
      if (['/items', '/profile'].includes(currentPath)) {
        return <Login />;
      }
    }

    // Route mapping
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/items':
        return <Items />;
      case '/profile':
        return <Profile />;
      case '/login':
        return <Login />;
      case '/register':
        return <Register />;
      default:
        return <NotFound />;
    }
  };

  return (
    <AuthProvider>
      <Layout>
        {renderCurrentPage()}
      </Layout>
    </AuthProvider>
  );
};

// Add global navigation type
declare global {
  interface Window {
    navigate: (path: string) => void;
  }
}

export default App; 