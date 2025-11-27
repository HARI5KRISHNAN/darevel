// Keycloak configuration
export {
  createKeycloak,
  getClientId,
  defaultInitOptions,
  loginRequiredOptions,
  type KeycloakConfig,
  type AppName,
} from './keycloak';

// Auth Provider and hook
export {
  AuthProvider,
  useAuth,
  type AuthContextType,
  type AuthProviderProps,
  type User,
} from './AuthProvider';

// Protected route component
export { ProtectedRoute, type ProtectedRouteProps } from './ProtectedRoute';

// Authenticated fetch utilities
export { createAuthFetch, useAuthFetch, authJsonRequest } from './authFetch';

// Re-export Keycloak type for convenience
export type { default as Keycloak } from 'keycloak-js';
