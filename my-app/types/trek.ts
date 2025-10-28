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
  createdAt?: Date;
  updatedAt?: Date;
}

