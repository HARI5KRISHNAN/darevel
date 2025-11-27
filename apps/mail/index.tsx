
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './keycloak';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize Keycloak before mounting the app
keycloak.init({
  onLoad: "login-required",
  checkLoginIframe: false,
  pkceMethod: 'S256',
  redirectUri: window.location.origin + '/'
}).then((authenticated) => {
  if (authenticated) {
    console.log("Authenticated as:", keycloak.tokenParsed?.preferred_username);
    console.log("User email:", keycloak.tokenParsed?.email);

    // Setup token refresh
    setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
        keycloak.login();
      });
    }, 60000);

    // Mount app
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App keycloak={keycloak} />
      </React.StrictMode>
    );
  } else {
    console.log("Not authenticated - redirecting to login");
    keycloak.login();
  }
}).catch((err) => {
  console.error("Keycloak init failed", err);
  keycloak.login();
});
