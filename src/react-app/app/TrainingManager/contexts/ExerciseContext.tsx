// File: ./src/app/Equipment/contexts/ExerciseContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

import {defaultExercises} from '../defaultExercises';
import {Exercise} from '../types';

import {EquipmentContext} from './EquipmentContext';
import {MuscleGroupContext} from './MuscleGroupContext';

interface ExerciseContextProps {
   exercises: Exercise[];
   setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
   addExercise: (exercise: Omit<Exercise, 'id'>) => void;
   updateExercise: (exercise: Exercise) => void;
   deleteExercise: (id: string) => void;
}

export const ExerciseContext = createContext<ExerciseContextProps>({
   exercises: [],
   setExercises: () => {},
   addExercise: () => {},
   updateExercise: () => {},
   deleteExercise: () => {},
});

interface ExerciseProviderProps {
   children: React.ReactNode;
}

import {useAuth} from '../../../components/context/AuthContext';

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({children}) => {
   const {token, isLoading} = useAuth();
   const [exercises, setExercises] = useState<Exercise[]>(() => {
      const stored = getLocalStorageItem<Exercise[]>('exercises', []);
      if (stored.length > 0) {
         return stored;
      }
      setLocalStorageItem('exercises', defaultExercises);
      return defaultExercises;
   });

   const {muscleGroups} = React.useContext(MuscleGroupContext);
   const {equipments} = React.useContext(EquipmentContext);
   const [shouldSeed, setShouldSeed] = useState(false);

   useEffect(() => {
      if (isLoading) return;

      if (!token) {
         setTimeout(() => setExercises([]), 0);
         localStorage.removeItem('exercises');
         return;
      }

      const fetchData = async () => {
         try {
            const res = await fetch('/api/v1/gym/exercises', {
               headers: {Authorization: `Bearer ${token}`},
            });
            if (res.ok) {
               const data = await res.json();
               if (data.exercises && data.exercises.length > 0) {
                  setExercises(data.exercises);
                  setLocalStorageItem('exercises', data.exercises);
               } else {
                 setShouldSeed(true);
               }
            }
         } catch (e) {
            console.error('Failed to fetch exercises', e);
         }
      };
      fetchData();
   }, [token, isLoading]);

   // Seeding Effect
   useEffect(() => {
      if (!shouldSeed || !token) return;
      
      // Wait for dependencies to be loaded
      if (muscleGroups.length === 0 || equipments.length === 0) return;

      const seedData = async () => {
         // Helper to find ID by name
         const getM = (name: string) => muscleGroups.find(m => m.name === name)?.id;
         const getE = (name: string) => equipments.find(e => e.name === name)?.id;

         const defaults: Exercise[] = [
            { id: uuidv4(), name: 'Bench Press', muscleGroupIds: [getM('Chest')!].filter(Boolean), equipmentIds: [getE('Barbell')!, getE('Bench Press')!].filter(Boolean), how: 'Lie on bench, press bar up.' },
            { id: uuidv4(), name: 'Dumbbell Fly', muscleGroupIds: [getM('Chest')!].filter(Boolean), equipmentIds: [getE('Dumbbell')!].filter(Boolean), how: 'Lie on bench, fly arms out.' },
            { id: uuidv4(), name: 'Squat', muscleGroupIds: [getM('Legs')!].filter(Boolean), equipmentIds: [getE('Barbell')!].filter(Boolean), how: 'Squat down with bar on back.' },
            { id: uuidv4(), name: 'Deadlift', muscleGroupIds: [getM('Back')!, getM('Legs')!].filter(Boolean), equipmentIds: [getE('Barbell')!].filter(Boolean), how: 'Lift bar from ground.' },
            { id: uuidv4(), name: 'Pull-up', muscleGroupIds: [getM('Back')!, getM('Arms')!].filter(Boolean), equipmentIds: [getE('Pull-up Bar')!].filter(Boolean), how: 'Pull body up to bar.' },
            { id: uuidv4(), name: 'Shoulder Press', muscleGroupIds: [getM('Shoulders')!].filter(Boolean), equipmentIds: [getE('Dumbbell')!].filter(Boolean), how: 'Press dumbbells overhead.' },
            { id: uuidv4(), name: 'Bicep Curl', muscleGroupIds: [getM('Arms')!].filter(Boolean), equipmentIds: [getE('Dumbbell')!].filter(Boolean), how: 'Curl dumbbells up.' },
            { id: uuidv4(), name: 'Tricep Extension', muscleGroupIds: [getM('Arms')!].filter(Boolean), equipmentIds: [getE('Dumbbell')!].filter(Boolean), how: 'Extend arm behind head.' },
            { id: uuidv4(), name: 'Crunches', muscleGroupIds: [getM('Abs')!].filter(Boolean), equipmentIds: [], how: 'Curl torso up.' },
         ];

         setExercises(defaults);
         setLocalStorageItem('exercises', defaults);
         setShouldSeed(false); // Done

         // Persist defaults sequentially
         for (const ex of defaults) {
            try {
               await fetch('/api/v1/gym/exercises', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                  body: JSON.stringify(ex),
               });
            } catch (seedError) {
               console.error(`Failed to seed exercise ${ex.name}`, seedError);
            }
         }
      };
      
      seedData();
   }, [shouldSeed, muscleGroups, equipments, token]);

   useEffect(() => {
      localStorage.setItem('exercises', JSON.stringify(exercises));
   }, [exercises]);

   const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
      const newExercise: Exercise = {id: uuidv4(), ...exercise};
      setExercises(prev => [...prev, newExercise]);
      if (token) {
         try {
            await fetch('/api/v1/gym/exercises', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(newExercise),
            });
         } catch (e) {
            console.error('Failed to add exercise', e);
         }
      }
   };

   const updateExercise = async (exercise: Exercise) => {
      setExercises(prev => prev.map(ex => (ex.id === exercise.id ? exercise : ex)));
      if (token) {
         try {
            await fetch('/api/v1/gym/exercises', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(exercise),
            });
         } catch (e) {
            console.error('Failed to update exercise', e);
         }
      }
   };

   const deleteExercise = async (id: string) => {
      setExercises(prev => prev.filter(ex => ex.id !== id));
      if (token) {
         try {
            await fetch(`/api/v1/gym/exercises/${id}`, {
               method: 'DELETE',
               headers: {Authorization: `Bearer ${token}`},
            });
         } catch (e) {
            console.error('Failed to delete exercise', e);
         }
      }
   };

   return <ExerciseContext.Provider value={{exercises, setExercises, addExercise, updateExercise, deleteExercise}}>{children}</ExerciseContext.Provider>;
};
