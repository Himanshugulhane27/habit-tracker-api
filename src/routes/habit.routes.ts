import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} from '../controllers/habit.controller';
import { trackHabit, getHabitHistory } from '../controllers/tracking.controller';

const router = Router();

// all routes below are protected by JWT middleware
router.use(authMiddleware);

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/track', trackHabit);
router.get('/:id/history', getHabitHistory);

export default router;