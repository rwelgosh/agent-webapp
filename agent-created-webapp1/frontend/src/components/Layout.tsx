import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthProvider';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.navigate('/login');
  };

  return (
    <div className="app-container">
      <header>
        <h1>Simple Web Application</h1>
        <nav>
          <ul>
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/items" className="nav-link">Items</a></li>
            {state.isAuthenticated ? (
              <>
                <li><a href="/profile" className="nav-link">Profile</a></li>
                <li><a href="#" className="nav-link" onClick={handleLogout}>Logout</a></li>
              </>
            ) : (
              <>
                <li><a href="/login" className="nav-link">Login</a></li>
                <li><a href="/register" className="nav-link">Register</a></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer>
        <p>&copy; {new Date().getFullYear()} Simple Web App</p>
      </footer>
    </div>
  );
};

export default Layout; 