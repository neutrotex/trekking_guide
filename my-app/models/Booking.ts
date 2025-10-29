import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  guideId: string;
  guideName: string;
  userId: string;
  userName: string;
  from: Date;
  to: Date;
  duration: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
}

const BookingSchema = new Schema<IBooking>({
  guideId: {
    type: String,
    required: true,
  },
  guideName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    },
  },
});

// Index for better query performance
BookingSchema.index({ guideId: 1, status: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ createdAt: -1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
