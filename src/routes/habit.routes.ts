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
import validate from '../middleware/validate.middleware';
import { createHabitSchema, updateHabitSchema } from '../validators/habit.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createHabitSchema), createHabit);
router.get('/', getHabits);
router.get('/:id', getHabitById);
router.put('/:id', validate(updateHabitSchema), updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/track', trackHabit);
router.get('/:id/history', getHabitHistory);

export default router;