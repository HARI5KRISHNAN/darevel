import Keycloak from 'keycloak-js';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export type AppName = 'chat' | 'mail' | 'sheet' | 'slides' | 'suite';

const CLIENT_IDS: Record<AppName, string> = {
  chat: 'darevel-chat',
  mail: 'darevel-mail',
  sheet: 'darevel-sheet',
  slides: 'darevel-slides',
  suite: 'darevel-suite',
};

/**
 * Create a Keycloak instance for the specified app
 */
export function createKeycloak(app: AppName, keycloakUrl = 'http://localhost:8180'): Keycloak {
  const config: KeycloakConfig = {
    url: keycloakUrl,
    realm: 'darevel',
    clientId: CLIENT_IDS[app],
  };

  return new Keycloak(config);
}

/**
 * Get the client ID for an app
 */
export function getClientId(app: AppName): string {
  return CLIENT_IDS[app];
}

/**
 * Default Keycloak initialization options
 */
export const defaultInitOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: typeof window !== 'undefined'
    ? `${window.location.origin}/silent-check-sso.html`
    : undefined,
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
};

/**
 * Login required initialization options
 */
export const loginRequiredOptions = {
  onLoad: 'login-required' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
};
