// File: ./src/app/TrainingManager/types.ts
import {
  UserEquipmentCategory,
  UserGymEquipment,
  UserGymExercise,
  UserGymSession,
  UserMuscleGroup,
  UserWorkoutPlan,
} from '../../../data/model/gym';

export type EquipmentCategory = UserEquipmentCategory;
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
