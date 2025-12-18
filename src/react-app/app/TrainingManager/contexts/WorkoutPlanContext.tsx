// File: ./src/app/Equipment/contexts/WorkoutPlanContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

import {WorkoutPlan} from '../types';

import {ExerciseContext} from './ExerciseContext';

interface WorkoutPlanContextProps {
   plans: WorkoutPlan[];
   setPlans: React.Dispatch<React.SetStateAction<WorkoutPlan[]>>;
   addPlan: (plan: Omit<WorkoutPlan, 'id'>) => void;
   updatePlan: (plan: WorkoutPlan) => void;
   deletePlan: (id: string) => void;
}

export const WorkoutPlanContext = createContext<WorkoutPlanContextProps>({
   plans: [],
   setPlans: () => {},
   addPlan: () => {},
   updatePlan: () => {},
   deletePlan: () => {},
});

import {useAuth} from '../../../components/context/AuthContext';

export const WorkoutPlanProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
   const {token, isLoading} = useAuth();
   const [plans, setPlans] = useState<WorkoutPlan[]>(() => {
      return getLocalStorageItem<WorkoutPlan[]>('workoutPlans', []);
   });

   const {exercises} = React.useContext(ExerciseContext);
   const [shouldSeed, setShouldSeed] = useState(false);

   useEffect(() => {
      if (isLoading) return;

      if (!token) {
         setTimeout(() => setPlans([]), 0);
         localStorage.removeItem('workoutPlans');
         return;
      }

      const fetchData = async () => {
         try {
            const res = await fetch('/api/v1/gym/plans', {
               headers: {Authorization: `Bearer ${token}`},
            });
            if (res.ok) {
               const data = await res.json();
               if (data.plans && data.plans.length > 0) {
                  setPlans(data.plans);
                  setLocalStorageItem('workoutPlans', data.plans);
               } else {
                  setShouldSeed(true);
               }
            }
         } catch (e) {
            console.error('Failed to fetch workout plans', e);
         }
      };
      fetchData();
   }, [token, isLoading]);

   useEffect(() => {
      if (!shouldSeed || !token) return;
      if (exercises.length === 0) return;

      const seedData = async () => {
         const getEx = (name: string) => exercises.find(e => e.name === name)?.id;
         
         const createPlanExercises = (list: {name: string, sets: number, reps: number, rest: number}[]) => {
            return list.map(item => ({
               exerciseId: getEx(item.name)!,
               sets: item.sets,
               reps: item.reps,
               rest: item.rest
            })).filter(ex => ex.exerciseId);
         };

         const defaults: WorkoutPlan[] = [
            {
               id: uuidv4(),
               name: 'Full Body A',
               exercises: createPlanExercises([
                  { name: 'Squat', sets: 3, reps: 5, rest: 120 },
                  { name: 'Bench Press', sets: 3, reps: 5, rest: 120 },
                  { name: 'Deadlift', sets: 1, reps: 5, rest: 180 },
                  { name: 'Pull-up', sets: 3, reps: 8, rest: 90 },
               ])
            },
            {
               id: uuidv4(),
               name: 'Upper Body Power',
               exercises: createPlanExercises([
                  { name: 'Bench Press', sets: 4, reps: 6, rest: 120 },
                  { name: 'Pull-up', sets: 4, reps: 6, rest: 120 },
                  { name: 'Shoulder Press', sets: 3, reps: 8, rest: 90 },
                  { name: 'Bicep Curl', sets: 3, reps: 10, rest: 60 },
               ])
            },
            {
               id: uuidv4(),
               name: 'Lower Body Power',
               exercises: createPlanExercises([
                  { name: 'Squat', sets: 4, reps: 6, rest: 120 },
                  { name: 'Deadlift', sets: 3, reps: 5, rest: 180 },
               ])
            }
         ];

         setPlans(defaults);
         setLocalStorageItem('workoutPlans', defaults);
         setShouldSeed(false);

         for (const plan of defaults) {
            try {
               await fetch('/api/v1/gym/plans', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                  body: JSON.stringify(plan),
               });
            } catch (seedError) {
               console.error(`Failed to seed plan ${plan.name}`, seedError);
            }
         }
      };
      seedData();
   }, [shouldSeed, exercises, token]);

   useEffect(() => {
      localStorage.setItem('workoutPlans', JSON.stringify(plans));
   }, [plans]);

   const addPlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
      const newPlan: WorkoutPlan = {id: uuidv4(), ...plan};
      setPlans(prev => [...prev, newPlan]);
      if (token) {
         try {
            await fetch('/api/v1/gym/plans', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(newPlan),
            });
         } catch (e) {
            console.error('Failed to add workout plan', e);
         }
      }
   };

   const updatePlan = async (plan: WorkoutPlan) => {
      setPlans(prev => prev.map(p => (p.id === plan.id ? plan : p)));
      if (token) {
         try {
            await fetch('/api/v1/gym/plans', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(plan),
            });
         } catch (e) {
            console.error('Failed to update workout plan', e);
         }
      }
   };

   const deletePlan = async (id: string) => {
      setPlans(prev => prev.filter(p => p.id !== id));
      if (token) {
         try {
            await fetch(`/api/v1/gym/plans/${id}`, {
               method: 'DELETE',
               headers: {Authorization: `Bearer ${token}`},
            });
         } catch (e) {
            console.error('Failed to delete workout plan', e);
         }
      }
   };

   return <WorkoutPlanContext.Provider value={{plans, setPlans, addPlan, updatePlan, deletePlan}}>{children}</WorkoutPlanContext.Provider>;
};
