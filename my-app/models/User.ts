import mongoose, { Schema, Model } from 'mongoose';
import { User, UserRole } from '@/types/user';

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['guide', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', userSchema);

export default UserModel;

