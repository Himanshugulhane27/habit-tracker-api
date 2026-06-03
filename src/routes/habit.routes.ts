import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// authMiddleware protects ALL routes in this file
// every request to /api/habits must have valid JWT token
router.use(authMiddleware);

export default router;