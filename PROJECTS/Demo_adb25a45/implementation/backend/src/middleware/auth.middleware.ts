import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { Types } from 'mongoose';

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: Types.ObjectId;
        username: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @throws {401} If no token is provided
 * @throws {403} If token is invalid or user not found
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Check if user exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(403).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ 
        success: false, 
        message: 'Token expired.' 
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    });
  }
};