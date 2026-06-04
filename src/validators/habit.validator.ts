import Joi from 'joi';

// schema for POST /api/habits
export const createHabitSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(500).optional().allow(''),
  frequency: Joi.string().valid('daily', 'weekly').required().messages({
    'any.only': 'Frequency must be daily or weekly',
    'any.required': 'Frequency is required',
  }),
  tags: Joi.array().items(Joi.string()).optional(),
  reminderTime: Joi.string().optional().allow(''),
});

// schema for PUT /api/habits/:id
export const updateHabitSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  frequency: Joi.string().valid('daily', 'weekly').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  reminderTime: Joi.string().optional().allow(''),
});