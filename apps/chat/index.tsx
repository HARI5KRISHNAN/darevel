import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './src/keycloak';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

keycloak.init({
  onLoad: "login-required",
  checkLoginIframe: false,
  pkceMethod: false,   // PKCE DISABLED
  redirectUri: "http://chat.darevel.local:3003/"
})
.then((authenticated) => {
  if (!authenticated) {
    keycloak.login();
    return;
  }

  console.log("Logged in:", keycloak.tokenParsed?.preferred_username);

  localStorage.setItem("kc_token", keycloak.token || "");
  localStorage.setItem("kc_refreshToken", keycloak.refreshToken || "");

  setInterval(() => {
    keycloak.updateToken(70).then((refreshed) => {
      if (refreshed) {
        localStorage.setItem("kc_token", keycloak.token || "");
      }
    }).catch(() => {
      keycloak.login();
    });
  }, 60000);

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
})
.catch((err) => {
  console.error("Keycloak initialization failed", err);
  keycloak.login();
});
