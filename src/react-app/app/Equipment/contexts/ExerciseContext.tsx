// File: ./src/app/Equipment/contexts/ExerciseContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {defaultExercises} from '../defaultExercises';
import {Exercise} from '../types';

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

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({children}) => {
   const [exercises, setExercises] = useState<Exercise[]>(() => {
      const stored = localStorage.getItem('exercises');
      if (stored) {
         try {
            return JSON.parse(stored) as Exercise[];
         } catch {
            return defaultExercises;
         }
      }
      localStorage.setItem('exercises', JSON.stringify(defaultExercises));
      return defaultExercises;
   });

   useEffect(() => {
      localStorage.setItem('exercises', JSON.stringify(exercises));
   }, [exercises]);

   const addExercise = (exercise: Omit<Exercise, 'id'>) => {
      const newExercise: Exercise = {id: uuidv4(), ...exercise};
      setExercises(prev => [...prev, newExercise]);
   };

   const updateExercise = (exercise: Exercise) => {
      setExercises(prev => prev.map(ex => (ex.id === exercise.id ? exercise : ex)));
   };

   const deleteExercise = (id: string) => {
      setExercises(prev => prev.filter(ex => ex.id !== id));
   };

   return <ExerciseContext.Provider value={{exercises, setExercises, addExercise, updateExercise, deleteExercise}}>{children}</ExerciseContext.Provider>;
};
