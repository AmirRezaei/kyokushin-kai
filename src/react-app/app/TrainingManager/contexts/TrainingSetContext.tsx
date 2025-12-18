import React, {createContext} from 'react';

import {TrainingSet} from '../types';


interface TrainingSetContextProps {
   trainingSets: TrainingSet[];
   setTrainingSets: React.Dispatch<React.SetStateAction<TrainingSet[]>>;
   addTrainingSet: (set: Omit<TrainingSet, 'id'>) => void;
   updateTrainingSet: (set: TrainingSet) => void;
   deleteTrainingSet: (id: string) => void;
}

export const TrainingSetContext = createContext<TrainingSetContextProps>({
   trainingSets: [],
   setTrainingSets: () => {},
   addTrainingSet: () => {},
   updateTrainingSet: () => {},
   deleteTrainingSet: () => {},
});

interface TrainingSetProviderProps {
   children: React.ReactNode;
}

import {GymSessionContext} from './GymSessionContext';
import {ExerciseContext} from './ExerciseContext';

export const TrainingSetProvider: React.FC<TrainingSetProviderProps> = ({children}) => {
   const {gymSessions} = React.useContext(GymSessionContext);
   const {exercises} = React.useContext(ExerciseContext);

   // Derive training sets from gym sessions and exercises
   const trainingSets = React.useMemo(() => {
      return gymSessions.flatMap(session => 
         session.exercises.flatMap((exData, idx) => {
            const exercise = exercises.find(e => e.id === exData.exerciseId);
            if (!exercise || !exercise.equipmentIds) return [];

            return exercise.equipmentIds.map(eqId => ({
               id: `${session.id}-${idx}-${eqId}`, // Synthetic ID
               equipmentId: eqId,
               weight: exData.weight,
               reps: exData.reps,
               times: exData.times,
               date: session.date
            }));
         })
      );
   }, [gymSessions, exercises]);

   // Deprecated/No-op functions as we shouldn't manipulate sets directly anymore
   const addTrainingSet = () => console.warn('addTrainingSet is deprecated. Use GymSessionContext.');
   const updateTrainingSet = () => console.warn('updateTrainingSet is deprecated. Use GymSessionContext.');
   const deleteTrainingSet = () => console.warn('deleteTrainingSet is deprecated. Use GymSessionContext.');

   return <TrainingSetContext.Provider value={{trainingSets, setTrainingSets: () => {}, addTrainingSet, updateTrainingSet, deleteTrainingSet}}>{children}</TrainingSetContext.Provider>;
};
