import { Response } from 'express';
import Habit from '../models/Habit';
import { AuthRequest } from '../middleware/auth.middleware';

// =====================
// CREATE HABIT
// =====================
export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    // title and frequency are required
    if (!title || !frequency) {
      return res.status(400).json({ message: 'Title and frequency are required' });
    }

    // create habit and link it to logged in user
    const habit = await Habit.create({
      title,
      description,
      frequency,
      tags: tags || [],
      reminderTime: reminderTime || '',
      userId: req.user?.userId, // comes from JWT middleware
    });

    res.status(201).json({ message: 'Habit created successfully', habit });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// =====================
// GET ALL HABITS
// =====================
export const getHabits = async (req: AuthRequest, res: Response) => {
  try {
    // get tag filter from query string e.g. /habits?tag=health
    const { tag, page = '1', limit = '10' } = req.query;

    // build filter - only get habits belonging to logged in user
    const filter: any = { userId: req.user?.userId };

    // if tag is provided, filter by tag
    if (tag) {
      filter.tags = { $in: [tag] };
    }

    // pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const habits = await Habit.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // newest first

    const total = await Habit.countDocuments(filter);

    res.status(200).json({
      habits,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// =====================
// GET SINGLE HABIT
// =====================
export const getHabitById = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user?.userId, // make sure habit belongs to logged in user
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.status(200).json({ habit });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// =====================
// UPDATE HABIT
// =====================
export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user?.userId, // make sure habit belongs to logged in user
      },
      req.body, // update with whatever fields are sent
      { new: true } // return updated document
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.status(200).json({ message: 'Habit updated successfully', habit });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// =====================
// DELETE HABIT
// =====================
export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId, // make sure habit belongs to logged in user
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};