// src/data/model/gym.ts
import { ISODateTimeString, UserId } from './common';

export interface UserEquipmentCategory {
  id: string;
  userId?: UserId;
  name: string;
  description?: string;
  color?: string; // Hex color code for UI display
}

export interface UserGymEquipment {
  id: string;
  userId?: UserId;
  name: string;
  description?: string;
  categoryId?: string; // Reference to UserEquipmentCategory
}

export interface UserMuscleGroup {
  id: string; // "chest", "back", or uuid for custom? Usually static but user might add? Let's use string.
  userId?: UserId; // If custom
  name: string;
}

export interface UserGymExercise {
  id: string;
  userId?: UserId;
  name: string;
  muscleGroupIds: string[];
  equipmentIds: string[];
  how?: string;
}

export interface UserWorkoutPlan {
  id: string;
  userId?: UserId;
  name: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    rest: number; // seconds
  }[];
}

export interface UserGymSession {
  id: string;
  userId?: UserId;
  workoutPlanId?: string; // If derived from a plan
  date: ISODateTimeString;

  // We flatten the sets here? Or structured?
  // The types.ts had: exercises: { exerciseId, weight, reps, times }[]
  // "times" usually means "sets"?
  // Let's align with the existing FE structure but map to DB.
  // DB usually stores this as a JSON blob or separate table.
  // Given D1 and low complexity, JSON blob in `exercises` column is fine.

  exercises: {
    exerciseId: string;
    weight: number;
    reps: number;
    times: number; // sets?
  }[];

  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}
