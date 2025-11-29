import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './keycloak';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Initialize Keycloak
keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false
}).then((authenticated) => {
  if (authenticated) {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  }
}).catch((error) => {
  console.error('Keycloak initialization failed:', error);
});
