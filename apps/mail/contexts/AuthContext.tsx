import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../keycloak';

interface User {
  email?: string;
  name?: string;
  username?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (keycloak.authenticated) {
      setIsAuthenticated(true);
      setUser({
        email: keycloak.tokenParsed?.email,
        name: keycloak.tokenParsed?.name,
        username: keycloak.tokenParsed?.preferred_username,
        roles: keycloak.tokenParsed?.realm_access?.roles || []
      });
    }
  }, []);

  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
  };

  const getToken = () => {
    return keycloak.token;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
