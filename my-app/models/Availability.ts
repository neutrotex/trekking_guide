import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability extends Document {
  guideId: mongoose.Schema.Types.ObjectId;
  date: string; // Format: 'YYYY-MM-DD'
  isAvailable: boolean;
  updatedAt: Date;
}

const AvailabilitySchema: Schema = new Schema({
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
  date: { type: String, required: true }, // Store as string for easier querying
  isAvailable: { type: Boolean, required: true, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for efficient querying
AvailabilitySchema.index({ guideId: 1, date: 1 }, { unique: true });

const AvailabilityModel = mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);

export default AvailabilityModel;
