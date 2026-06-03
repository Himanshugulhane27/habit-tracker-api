import { Response } from 'express';
import dayjs from 'dayjs';
import TrackingLog from '../models/TrackingLog';
import Habit from '../models/Habit';
import { AuthRequest } from '../middleware/auth.middleware';

// =====================
// TRACK HABIT (mark as done today)
// =====================
export const trackHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // habitId

    // check habit exists and belongs to logged in user
    const habit = await Habit.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // get today's date as string e.g. "2024-06-03"
    const today = dayjs().format('YYYY-MM-DD');

    // try to create tracking log
    // if already tracked today, the unique index will throw an error
    const log = await TrackingLog.create({
      habitId: id,
      userId: req.user?.userId,
      date: today,
      completed: true,
    });

    res.status(201).json({
      message: 'Habit tracked successfully',
      log,
    });
  } catch (error: any) {
    // error code 11000 means duplicate key - already tracked today
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Habit already tracked for today' });
    }
    res.status(500).json({ message: 'Server error', error });
  }
};

// =====================
// GET LAST 7 DAYS HISTORY
// =====================
export const getHabitHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // check habit exists and belongs to logged in user
    const habit = await Habit.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // build array of last 7 days ["2024-06-03", "2024-06-02", ...]
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    );

    // get all logs for this habit in last 7 days
    const logs = await TrackingLog.find({
      habitId: id,
      date: { $in: last7Days },
    });

    // map each day to show completed or not
    const history = last7Days.map((date) => ({
      date,
      completed: logs.some((log) => log.date === date),
    }));

    // =====================
    // STREAK CALCULATION
    // =====================
    let streak = 0;
    for (const day of history) {
      if (day.completed) {
        streak++; // count consecutive completed days
      } else {
        break; // stop as soon as we hit a day not completed
      }
    }

    res.status(200).json({
      habit: habit.title,
      history,
      streak,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};