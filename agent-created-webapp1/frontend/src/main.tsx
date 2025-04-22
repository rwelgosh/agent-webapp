import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

// Create the React root and render the App
const root = document.getElementById('root');
if (root) {
  // Create the React root
  const reactRoot = ReactDOM.createRoot(root);
  
  // Render the main App component
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 