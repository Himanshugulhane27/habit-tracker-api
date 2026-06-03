import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// we extend Request to add our own 'user' field
export interface AuthRequest extends Request {
  user?: { userId: string };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // step 1 - get token from request header
    // token is sent as: Authorization: Bearer eyJhbG...
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // step 2 - extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // step 3 - verify token using our secret key
    // if token is fake or expired, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    // step 4 - attach userId to request so controllers can use it
    req.user = { userId: decoded.userId };

    // step 5 - move on to the actual route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;