import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for process.env in browser environments
// If you are running this live/publicly without a build server, 
// you can paste your API key inside the quotes below.
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '' // PASTE YOUR GEMINI API KEY HERE
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);