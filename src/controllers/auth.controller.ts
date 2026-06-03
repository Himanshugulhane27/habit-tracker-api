import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { apiResponse } from '../utils/ApiResponse';

// =====================
// REGISTER
// =====================
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return apiResponse(res, 400, 'Please provide name, email and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponse(res, 400, 'Email already registered');
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return apiResponse(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};

// =====================
// LOGIN
// =====================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return apiResponse(res, 401, 'Invalid email or password');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return apiResponse(res, 401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return apiResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    return apiResponse(res, 500, 'Server error');
  }
};