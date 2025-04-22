import React from 'react';
import { useAuth } from '../contexts/AuthProvider';

const Home: React.FC = () => {
  const { state } = useAuth();

  return (
    <div className="home-container">
      <h2>Welcome to the Simple Web Application</h2>
      
      <section className="info-section">
        {state.isAuthenticated ? (
          <>
            <h3>Hello, {state.user?.username || 'User'}!</h3>
            <p>You are currently logged in to your account.</p>
            <p>Use the navigation above to explore the available features.</p>
          </>
        ) : (
          <>
            <h3>Hello, Guest!</h3>
            <p>Please login or register to access all features of the application.</p>
          </>
        )}
      </section>
      
      <section className="features-section">
        <h3>Available Features</h3>
        <ul className="features-list">
          <li>
            <strong>Data Management</strong>
            <p>Access and manage your data items</p>
          </li>
          <li>
            <strong>Search Functionality</strong>
            <p>Search for specific items in the database</p>
          </li>
          <li>
            <strong>User Profile</strong>
            <p>View and update your profile information</p>
          </li>
          <li>
            <strong>Real-time Updates</strong>
            <p>Receive instant notifications for new items</p>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Home; 