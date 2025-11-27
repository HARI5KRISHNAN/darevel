import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: 'darevel',
  clientId: 'darevel-chat',
};

const keycloak = new Keycloak(keycloakConfig);
let initPromise: Promise<boolean> | null = null;

export const initKeycloak = async (): Promise<boolean> => {
  // If already initializing or initialized, return the same promise
  if (initPromise) {
    console.log('Keycloak init already in progress, returning existing promise');
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });
      console.log('Keycloak initialized successfully, authenticated:', authenticated);
      return authenticated;
    } catch (error) {
      console.error('Keycloak init error:', error);
      return false;
    }
  })();

  return initPromise;
};

export const keycloakLogin = () => {
  keycloak.login({
    redirectUri: window.location.origin,
  });
};

export const keycloakLogout = () => {
  keycloak.logout({
    redirectUri: window.location.origin,
  });
};

export const keycloakRegister = () => {
  keycloak.register({
    redirectUri: window.location.origin,
  });
};

export const getKeycloakToken = (): string | undefined => {
  const token = keycloak.token;
  if (!token) {
    console.warn('No Keycloak token available. Authenticated:', keycloak.authenticated);
  } else {
    console.log('Keycloak token retrieved, length:', token.length);
    console.log('Token claims:', keycloak.tokenParsed);
  }
  return token;
};

export const getKeycloakUserInfo = () => {
  if (!keycloak.authenticated) return null;

  return {
    id: keycloak.subject || '',
    email: keycloak.tokenParsed?.email || '',
    name: keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || '',
    firstName: keycloak.tokenParsed?.given_name || '',
    lastName: keycloak.tokenParsed?.family_name || '',
  };
};

export const isKeycloakAuthenticated = (): boolean => {
  return keycloak.authenticated || false;
};

export const refreshKeycloakToken = async (minValidity = 30): Promise<boolean> => {
  try {
    const refreshed = await keycloak.updateToken(minValidity);
    return refreshed;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export default keycloak;
