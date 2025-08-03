// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async'; // ایمپورت کردن

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider> {/* باز کردن تگ در اینجا */}
      <App />
    </HelmetProvider> {/* بستن تگ در اینجا */}
  </React.StrictMode>
);