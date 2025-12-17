// File: ./src/app/Equipment/contexts/TrainingSetContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

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

export const TrainingSetProvider: React.FC<TrainingSetProviderProps> = ({children}) => {
   const [trainingSets, setTrainingSets] = useState<TrainingSet[]>(() => {
      const storedTrainingSets = getLocalStorageItem<TrainingSet[]>('trainingSets', []);
      return storedTrainingSets;
   });

   useEffect(() => {
      setLocalStorageItem<TrainingSet[]>('trainingSets', trainingSets);
   }, [trainingSets]);

   const addTrainingSet = (set: Omit<TrainingSet, 'id'>) => {
      const newSet: TrainingSet = {id: uuidv4(), ...set};
      setTrainingSets(prev => [...prev, newSet]);
   };

   const updateTrainingSet = (set: TrainingSet) => {
      setTrainingSets(prev => prev.map(ts => (ts.id === set.id ? set : ts)));
   };

   const deleteTrainingSet = (id: string) => {
      setTrainingSets(prev => prev.filter(ts => ts.id !== id));
   };

   return <TrainingSetContext.Provider value={{trainingSets, setTrainingSets, addTrainingSet, updateTrainingSet, deleteTrainingSet}}>{children}</TrainingSetContext.Provider>;
};
