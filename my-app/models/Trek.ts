import mongoose, { Schema, Model } from 'mongoose';
import { Trek, Difficulty } from '@/types/trek';

const shopSchema = new Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String },
}, { _id: false });

const wastePointSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String },
}, { _id: false });

const routePointSchema = new Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  altitude: { type: String, required: true },
}, { _id: false });

const trekPhotoSchema = new Schema({
  url: { type: String, required: true },
  caption: { type: String },
  routePointIndex: { type: Number },
  routePointName: { type: String },
}, { _id: false });

const trekSchema = new Schema<Trek>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard'],
      required: true,
    },
    duration: {
      type: String,
    },
    maxAltitude: {
      type: String,
    },
    bestSeason: {
      type: String,
    },
    highlights: [{
      type: String,
    }],
    shops: [shopSchema],
    wastePoints: [wastePointSchema],
    route: [routePointSchema],
    photos: [trekPhotoSchema],
  },
  {
    timestamps: true,
  }
);

const TrekModel: Model<Trek> = mongoose.models.Trek || mongoose.model<Trek>('Trek', trekSchema);

export default TrekModel;

