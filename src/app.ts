import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';

dotenv.config(); // reads your .env file
const app = express();

app.use(express.json()); // allows Express to read JSON from request body

// all auth routes will start with /api/auth
app.use('/api/auth', authRoutes);

// all habit routes will start with /api/habits
app.use('/api/habits', habitRoutes);

// just a test route to confirm server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Habit Tracker API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || '';

// first connect to MongoDB, then start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

export default app;