import { Response } from 'express';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import TrackingLog from '../models/TrackingLog';
import Habit from '../models/Habit';
import { AuthRequest } from '../middleware/auth.middleware';

// =====================
// TRACK HABIT
// =====================
export const trackHabit = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // check habit exists and belongs to logged in user
    const habit = await Habit.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // get today's date as "2024-06-03"
    const today = dayjs().format('YYYY-MM-DD');

    // create log - unique index will block if already tracked today
    const log = await TrackingLog.create({
      habitId: habit._id,
      userId: habit.userId,
      date: today,
      completed: true,
    });

    res.status(201).json({ message: 'Habit tracked successfully', log });
  } catch (error: any) {
    // 11000 = MongoDB duplicate key error = already tracked today
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
    const id = req.params.id as string;

    // check habit exists and belongs to logged in user
    const habit = await Habit.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // build last 7 days array
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    );

    // get logs for those 7 days
    const logs = await TrackingLog.find({
      habitId: habit._id,
      date: { $in: last7Days },
    });

    // map each day to completed true or false
    const history = last7Days.map((date) => ({
      date,
      completed: logs.some((log) => log.date === date),
    }));

    // streak - count consecutive days from today
    let streak = 0;
    for (const day of history) {
      if (day.completed) {
        streak++;
      } else {
        break;
      }
    }

    res.status(200).json({ habit: habit.title, history, streak });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};