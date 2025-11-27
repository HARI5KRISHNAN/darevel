import Keycloak from 'keycloak-js';

/**
 * Create an authenticated fetch function that automatically includes the Keycloak token
 */
export function createAuthFetch(keycloak: Keycloak | null) {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    // Get fresh token
    if (keycloak?.authenticated) {
      try {
        await keycloak.updateToken(30);
      } catch {
        console.warn('Token refresh failed');
      }
    }

    const token = keycloak?.token;

    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };
}

/**
 * Hook-friendly version for use with useAuth
 */
export function useAuthFetch() {
  // This will be used in conjunction with useAuth
  // Example: const authFetch = useAuthFetch(keycloak);
  return createAuthFetch;
}

/**
 * Helper to make JSON API requests with authentication
 */
export async function authJsonRequest<T>(
  keycloak: Keycloak | null,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const authFetch = createAuthFetch(keycloak);

  const response = await authFetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
