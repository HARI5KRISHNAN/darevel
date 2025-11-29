import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180/',
  realm: 'darevel',
  clientId: 'darevel-mail',
});

keycloak
  .init({
    onLoad: 'login-required',
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (!authenticated) {
      window.location.reload();
      return;
    }

    // Token refresh
    setInterval(() => {
      keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed');
          }
        })
        .catch(() => {
          console.error('Failed to refresh token');
          keycloak.login();
        });
    }, 60000);

    // Render app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize Keycloak:', error);
  });

// Make keycloak available globally
(window as any).keycloak = keycloak;
