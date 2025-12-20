// file: src/data/model/trainingSession.ts
import { ISODateTimeString, UserId } from './common';

export type TrainingSessionId = string;

export interface UserTrainingSession {
  id: TrainingSessionId;
  userId?: UserId; // Optional on frontend before save, required on backend

  date: ISODateTimeString;
  type: string; // e.g. "Kihon", "Kata", "Sparring"
  duration: number; // minutes
  intensity: string; // "Low", "Medium", "High"
  notes: string;

  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  version?: number;
}
