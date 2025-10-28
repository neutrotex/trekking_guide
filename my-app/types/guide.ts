export interface Guide {
  _id?: string;
  userId: string;
  fullName: string;
  age: number;
  education: string;
  experienceYears: number;
  wagesPerDay: number;
  bio: string;
  photoUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

