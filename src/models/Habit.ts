import mongoose, { Document, Schema } from 'mongoose';

// this defines what a Habit object looks like in TypeScript
export interface IHabit extends Document {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly'; // only these two values allowed
  tags: string[];
  reminderTime: string;
  userId: mongoose.Types.ObjectId;
}

const HabitSchema = new Schema<IHabit>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '', // optional field
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'], // only accepts these two values
      default: 'daily',
    },
    tags: {
      type: [String], // array of strings like ["health", "fitness"]
      default: [],
    },
    reminderTime: {
      type: String,
      default: '', // e.g. "08:00 AM" - just stored, no actual notification
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',   // links this habit to a User
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IHabit>('Habit', HabitSchema);