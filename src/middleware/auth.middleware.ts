import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { config } from "../config";

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (!res.headersSent) {
        res.status(401).json({ message: 'Authentication required' });
      }
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (!res.headersSent) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
};

export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      if (!res.headersSent) {
        res.status(401).json({ message: 'Authentication required' });
      }
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      if (!res.headersSent) {
        res.status(403).json({ message: 'Not authorized to access this resource' });
      }
      return;
    }

    next();
  };
};