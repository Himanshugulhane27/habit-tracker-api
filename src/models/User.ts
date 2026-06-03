import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// this defines what a User object looks like in TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true, // name is compulsory
      trim: true,     // removes extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,   // no two users can have same email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,   // minimum 6 characters
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt fields
  }
);

// THIS RUNS AUTOMATICALLY BEFORE SAVING USER TO DATABASE
// It hashes the password so plain text is never stored
UserSchema.pre('save', async function () {
  // only hash if password was changed or is new
  if (!this.isModified('password')) return;

  // bcrypt turns "mypassword123" into "$2a$10$xyz..." 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// this method is used during login to check if entered password is correct
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);