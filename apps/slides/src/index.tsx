import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import keycloak from './keycloak';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const mountApp = () => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
};

keycloak
  .init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    redirectUri: window.location.origin + '/'
  })
  .then((authenticated) => {
    if (!authenticated) {
      keycloak.login();
      return;
    }

    localStorage.setItem('kc_token', keycloak.token || '');
    localStorage.setItem('kc_refreshToken', keycloak.refreshToken || '');

    setInterval(() => {
      keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            localStorage.setItem('kc_token', keycloak.token || '');
          }
        })
        .catch(() => keycloak.login());
    }, 60000);

    mountApp();
  })
  .catch((err) => {
    console.error('Keycloak initialization failed', err);
    keycloak.login();
  });
