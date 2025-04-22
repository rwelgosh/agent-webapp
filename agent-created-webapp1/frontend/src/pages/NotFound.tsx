import React from 'react';

const NotFound: React.FC = () => {
  // Handle navigation to home page
  const goToHome = () => {
    window.navigate('/');
  };

  return (
    <div className="not-found-container">
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <button className="btn" onClick={goToHome}>
        Return to Home
      </button>
    </div>
  );
};

export default NotFound; 