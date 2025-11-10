import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/pilot180/protocol/openid-connect/certs',
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
});

interface DecodedToken {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  exp: number;
  iat: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Keycloak public key
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: process.env.KEYCLOAK_ISSUER,
    }, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }

      req.user = decoded as DecodedToken;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user has specific role
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRoles = req.user.realm_access?.roles || [];

    if (!userRoles.includes(role)) {
      res.status(403).json({ error: `Requires ${role} role` });
      return;
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole('admin');
