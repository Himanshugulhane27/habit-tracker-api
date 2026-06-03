import { Response } from 'express';
import dayjs from 'dayjs';
import TrackingLog from '../models/TrackingLog';
import Habit from '../models/Habit';
import { AuthRequest } from '../middleware/auth.middleware';
import { apiResponse } from '../utils/ApiResponse';

export const trackHabit = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const habit = await Habit.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return apiResponse(res, 404, 'Habit not found');
    }

    const today = dayjs().format('YYYY-MM-DD');

    const log = await TrackingLog.create({
      habitId: habit._id,
      userId: habit.userId,
      date: today,
      completed: true,
    });

    return apiResponse(res, 201, 'Habit tracked successfully', { log });
  } catch (error: any) {
    if (error.code === 11000) {
      return apiResponse(res, 400, 'Habit already tracked for today');
    }
    return apiResponse(res, 500, 'Server error');
  }
};

export const getHabitHistory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const habit = await Habit.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return apiResponse(res, 404, 'Habit not found');
    }

    const last7Days = Array.from({ length: 7 }, (_, i) =>
      dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    );

    const logs = await TrackingLog.find({
      habitId: habit._id,
      date: { $in: last7Days },
    });

    const history = last7Days.map((date) => ({
      date,
      completed: logs.some((log) => log.date === date),
    }));

    let streak = 0;
    for (const day of history) {
      if (day.completed) {
        streak++;
      } else {
        break;
      }
    }

    return apiResponse(res, 200, 'Habit history retrieved successfully', {
      habit: habit.title,
      history,
      streak,
    });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};