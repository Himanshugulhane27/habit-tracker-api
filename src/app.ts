import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import rateLimit from 'express-rate-limit';

dotenv.config(); // reads your .env file
const app = express();

app.use(express.json()); // allows Express to read JSON from request body

// rate limiting - max 100 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 100, // max 100 requests per hour
  message: { message: 'Too many requests, please try again after an hour' },
});

app.use(limiter); // apply to all routes


// all auth routes will start with /api/auth
app.use('/api/auth', authRoutes);

// all habit routes will start with /api/habits
app.use('/api/habits', habitRoutes);

// just a test route to confirm server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Habit Tracker API is running' });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGODB_URI || '';

  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () =>
        console.log(`✅ Server running on port ${PORT}`)
      );
    })
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

export default app;