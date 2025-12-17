// File: ./src/app/Equipment/types.ts

export interface Equipment {
   id: string;
   name: string;
   description?: string;
}

export interface MuscleGroup {
   id: string;
   name: string;
}
export interface Exercise {
   id: string;
   name: string;
   muscleGroupIds: string[];
   equipmentIds: string[];
   how: string;
}

export interface TrainingSet {
   id: string;
   equipmentId: string;
   weight: number;
   reps: number;
   times: number;
   date: string; // ISO string
}

export interface WorkoutPlan {
   id: string;
   name: string;
   exercises: {exerciseId: string; sets: number; reps: number; rest: number}[];
}

export interface TrainingSession {
   id: string;
   workoutPlanId?: string;
   date: string; // ISO string
   exercises: {
      exerciseId: string;
      weight: number;
      reps: number;
      times: number;
   }[];
}

export interface Contribution {
   date: string | Date;
   id?: string; // Optional unique identifier for the contribution
   category?: string; // Optional category for different types of contributions
}
