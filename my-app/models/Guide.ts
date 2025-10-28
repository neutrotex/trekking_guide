import mongoose, { Schema, Model } from 'mongoose';
import { Guide } from '@/types/guide';

const guideSchema = new Schema<Guide>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    wagesPerDay: {
      type: Number,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const GuideModel: Model<Guide> = mongoose.models.Guide || mongoose.model<Guide>('Guide', guideSchema);

export default GuideModel;

