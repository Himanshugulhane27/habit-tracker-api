import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// =====================
// REGISTER
// =====================
export const register = async (req: Request, res: Response) => {
  try {
    // step 1 - get name, email, password from request body
    const { name, email, password } = req.body;

    // step 2 - check all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // step 3 - check if email already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // step 4 - create new user
    // password gets hashed automatically by pre save hook in User model
    const user = await User.create({ name, email, password });

    // step 5 - create JWT token
    const token = jwt.sign(
      { userId: user._id },           // payload - what we store in token
      process.env.JWT_SECRET as string, // secret key from .env
      { expiresIn: '7d' }             // token expires in 7 days
    );

    // step 6 - send back success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// =====================
// LOGIN
// =====================
export const login = async (req: Request, res: Response) => {
  try {
    // step 1 - get email and password from request body
    const { email, password } = req.body;

    // step 2 - check both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // step 3 - find user by email in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // step 4 - check if password is correct
    // comparePassword method is defined in User model
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // step 5 - create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // step 6 - send back success response with token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};