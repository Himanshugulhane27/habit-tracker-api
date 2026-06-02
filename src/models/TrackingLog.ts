import mongoose, { Document, Schema } from 'mongoose';

// this defines what a TrackingLog object looks like in TypeScript
export interface ITrackingLog extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // stored as "2024-06-03"
  completed: boolean;
}

const TrackingLogSchema = new Schema<ITrackingLog>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',  // links this log to a Habit
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',   // links this log to a User
      required: true,
    },
    date: {
      type: String,
      required: true, // stored as "2024-06-03"
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// THIS IS THE MOST IMPORTANT LINE IN THIS FILE
// It makes sure one habit can only be tracked ONCE per day
// If you try to track the same habit twice on same day, MongoDB will reject it
TrackingLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.model<ITrackingLog>('TrackingLog', TrackingLogSchema);