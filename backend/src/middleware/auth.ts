// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id:   string;
  role: string;
  iat:  number;
  exp:  number;
}

// Throw if no token or invalid
export function requireAuth(...allowedRoles: string[]) {
  return (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // If roles were specified, enforce them
    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    // Good to go!
    req.user = payload;
    next();
  };
}
