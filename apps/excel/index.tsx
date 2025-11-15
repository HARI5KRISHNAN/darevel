import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext'; // ADD THIS LINE
import keycloak from './src/keycloak';

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

    localStorage.setItem('kc_token', keycloak.token || '');
    localStorage.setItem('kc_refreshToken', keycloak.refreshToken || '');

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

    // Mount app with AuthProvider wrapper
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
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