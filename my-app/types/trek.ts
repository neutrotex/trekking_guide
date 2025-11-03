export interface Shop {
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface WastePoint {
  lat: number;
  lng: number;
  description?: string;
}

export interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  altitude: string;
}

export interface TrekPhoto {
  url: string;
  caption?: string;
  routePointIndex?: number; // Index of the route point this photo belongs to
  routePointName?: string; // Name of the route point
}

export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface Trek {
  _id?: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  duration?: string;
  maxAltitude?: string;
  bestSeason?: string;
  highlights?: string[];
  shops: Shop[];
  wastePoints: WastePoint[];
  route?: RoutePoint[];
  photos?: TrekPhoto[]; // Photos ordered from start to finish
  createdAt?: Date;
  updatedAt?: Date;
}

