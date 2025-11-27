import React, { ReactNode } from 'react';
import { useAuth } from './AuthProvider';

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRoles?: string[];
  onUnauthorized?: () => void;
}

/**
 * Protects routes that require authentication
 */
export function ProtectedRoute({
  children,
  fallback,
  requiredRoles,
  onUnauthorized,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, login } = useAuth();

  // Show loading state
  if (isLoading) {
    return fallback ? <>{fallback}</> : <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    if (onUnauthorized) {
      onUnauthorized();
    } else {
      login();
    }
    return fallback ? <>{fallback}</> : <LoadingSpinner />;
  }

  // Check required roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => user?.roles.includes(role));
    if (!hasRequiredRole) {
      return <UnauthorizedMessage />;
    }
  }

  return <>{children}</>;
}

/**
 * Default loading spinner component
 */
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Unauthorized message component
 */
function UnauthorizedMessage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <h2 style={{ color: '#e74c3c', margin: 0 }}>Access Denied</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        You do not have permission to access this page.
      </p>
    </div>
  );
}
