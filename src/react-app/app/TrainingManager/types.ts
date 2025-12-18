// File: ./src/app/TrainingManager/types.ts
import { UserGymEquipment, UserGymExercise, UserGymSession, UserMuscleGroup, UserWorkoutPlan } from '../../../data/model/gym';

export type Equipment = UserGymEquipment;
export type MuscleGroup = UserMuscleGroup;
export type Exercise = UserGymExercise;
export type WorkoutPlan = UserWorkoutPlan;
export type GymSession = UserGymSession; 

// Re-introduced for legacy compatibility or flattened views
export interface TrainingSet {
   id: string;
   equipmentId: string;
   weight: number;
   reps: number;
   times: number;
   date: string; // ISO string
}

export interface Contribution {
   date: string | Date;
   id?: string; // Optional unique identifier for the contribution
   category?: string; // Optional category for different types of contributions
}
