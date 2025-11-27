import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Keycloak from 'keycloak-js';
import { createKeycloak, defaultInitOptions, loginRequiredOptions, AppName } from './keycloak';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles: string[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  keycloak: Keycloak | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  app: AppName;
  keycloakUrl?: string;
  loginRequired?: boolean;
  onAuthSuccess?: (user: User, token: string) => void;
  onAuthError?: (error: Error) => void;
}

export function AuthProvider({
  children,
  app,
  keycloakUrl = 'http://localhost:8080',
  loginRequired = false,
  onAuthSuccess,
  onAuthError,
}: AuthProviderProps) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Extract user info from Keycloak token
  const extractUser = useCallback((kc: Keycloak): User | null => {
    if (!kc.authenticated || !kc.tokenParsed) {
      return null;
    }

    const tokenParsed = kc.tokenParsed as Record<string, unknown>;

    return {
      id: (tokenParsed.sub as string) || '',
      username: (tokenParsed.preferred_username as string) || '',
      email: (tokenParsed.email as string) || '',
      firstName: (tokenParsed.given_name as string) || undefined,
      lastName: (tokenParsed.family_name as string) || undefined,
      fullName: (tokenParsed.name as string) || undefined,
      roles: (tokenParsed.realm_access as { roles?: string[] })?.roles || [],
    };
  }, []);

  // Initialize Keycloak
  useEffect(() => {
    const kc = createKeycloak(app, keycloakUrl);
    const initOptions = loginRequired ? loginRequiredOptions : defaultInitOptions;

    kc.init(initOptions)
      .then((authenticated) => {
        setKeycloak(kc);
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const userData = extractUser(kc);
          setUser(userData);
          setToken(kc.token || null);

          if (userData && kc.token && onAuthSuccess) {
            onAuthSuccess(userData, kc.token);
          }
        }

        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Keycloak initialization failed:', error);
        setIsLoading(false);

        if (onAuthError) {
          onAuthError(error);
        }
      });

    // Token refresh
    const refreshInterval = setInterval(() => {
      if (kc.authenticated) {
        kc.updateToken(70)
          .then((refreshed) => {
            if (refreshed) {
              setToken(kc.token || null);
            }
          })
          .catch(() => {
            console.warn('Token refresh failed');
          });
      }
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [app, keycloakUrl, loginRequired, extractUser, onAuthSuccess, onAuthError]);

  // Auth actions
  const login = useCallback(() => {
    keycloak?.login();
  }, [keycloak]);

  const logout = useCallback(() => {
    keycloak?.logout({
      redirectUri: window.location.origin,
    });
  }, [keycloak]);

  const register = useCallback(() => {
    keycloak?.register();
  }, [keycloak]);

  const updateToken = useCallback(
    async (minValidity = 30): Promise<boolean> => {
      if (!keycloak) return false;
      try {
        const refreshed = await keycloak.updateToken(minValidity);
        if (refreshed) {
          setToken(keycloak.token || null);
        }
        return refreshed;
      } catch {
        return false;
      }
    },
    [keycloak]
  );

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    keycloak,
    login,
    logout,
    register,
    updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
