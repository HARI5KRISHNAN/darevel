
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './src/keycloak';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize Keycloak before mounting the app
keycloak.init({
  onLoad: "login-required", // Require login for SSO
  checkLoginIframe: false, // Disable iframe for better compatibility
  pkceMethod: 'S256',
  redirectUri: window.location.origin + '/'
}).then((authenticated) => {
  if (authenticated) {
    console.log("Authenticated as:", keycloak.tokenParsed?.preferred_username);
    console.log("User email:", keycloak.tokenParsed?.email);

    // Store token for API calls
    localStorage.setItem('kc_token', keycloak.token || '');
    localStorage.setItem('kc_refreshToken', keycloak.refreshToken || '');

    // Setup token refresh - refresh token every 60 seconds if needed
    setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
          localStorage.setItem('kc_token', keycloak.token || '');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
        keycloak.login();
      });
    }, 60000);

    // Mount app after successful authentication
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.log("Not authenticated - redirecting to login");
    keycloak.login();
  }
}).catch((err) => {
  console.error("Keycloak init failed", err);
  // On failure, try to login
  keycloak.login();
});