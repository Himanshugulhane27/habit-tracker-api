import { Response } from 'express';
import Habit from '../models/Habit';
import { AuthRequest } from '../middleware/auth.middleware';
import { apiResponse } from '../utils/ApiResponse';

export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    if (!title || !frequency) {
      return apiResponse(res, 400, 'Title and frequency are required');
    }

    const habit = await Habit.create({
      title,
      description,
      frequency,
      tags: tags || [],
      reminderTime: reminderTime || '',
      userId: req.user?.userId,
    });

    return apiResponse(res, 201, 'Habit created successfully', { habit });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};

export const getHabits = async (req: AuthRequest, res: Response) => {
  try {
    const { tag, page = '1', limit = '10' } = req.query;

    const filter: any = { userId: req.user?.userId };

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const habits = await Habit.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Habit.countDocuments(filter);

    return apiResponse(res, 200, 'Habits retrieved successfully', {
      habits,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};

export const getHabitById = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return apiResponse(res, 404, 'Habit not found');
    }

    return apiResponse(res, 200, 'Habit retrieved successfully', { habit });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user?.userId,
      },
      req.body,
      { new: true }
    );

    if (!habit) {
      return apiResponse(res, 404, 'Habit not found');
    }

    return apiResponse(res, 200, 'Habit updated successfully', { habit });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!habit) {
      return apiResponse(res, 404, 'Habit not found');
    }

    return apiResponse(res, 200, 'Habit deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};