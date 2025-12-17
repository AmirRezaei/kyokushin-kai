// File: ./src/app/Equipment/contexts/MuscleGroupContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

import {MuscleGroup} from '../types';

interface MuscleGroupContextProps {
   muscleGroups: MuscleGroup[];
   setMuscleGroups: React.Dispatch<React.SetStateAction<MuscleGroup[]>>;
   addMuscleGroup: (group: Omit<MuscleGroup, 'id'>) => void;
   updateMuscleGroup: (group: MuscleGroup) => void;
   deleteMuscleGroup: (id: string) => void;
}

export const MuscleGroupContext = createContext<MuscleGroupContextProps>({
   muscleGroups: [],
   setMuscleGroups: () => {},
   addMuscleGroup: () => {},
   updateMuscleGroup: () => {},
   deleteMuscleGroup: () => {},
});

interface MuscleGroupProviderProps {
   children: React.ReactNode;
}

export const MuscleGroupProvider: React.FC<MuscleGroupProviderProps> = ({children}) => {
   const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(() => {
      const storedMuscleGroups = getLocalStorageItem<MuscleGroup[]>('muscleGroups', []);
      if (storedMuscleGroups.length === 0) {
         const defaultMuscleGroups: MuscleGroup[] = [
            {id: '1', name: 'Chest'},
            {id: '2', name: 'Back'},
            // ... other default muscle groups ...
         ];
         setLocalStorageItem<MuscleGroup[]>('muscleGroups', defaultMuscleGroups);
         return defaultMuscleGroups;
      }
      return storedMuscleGroups;
   });

   useEffect(() => {
      setLocalStorageItem<MuscleGroup[]>('muscleGroups', muscleGroups);
   }, [muscleGroups]);

   const addMuscleGroup = (group: Omit<MuscleGroup, 'id'>) => {
      const newGroup: MuscleGroup = {id: uuidv4(), ...group};
      setMuscleGroups(prev => [...prev, newGroup]);
   };

   const updateMuscleGroup = (group: MuscleGroup) => {
      setMuscleGroups(prev => prev.map(mg => (mg.id === group.id ? group : mg)));
   };

   const deleteMuscleGroup = (id: string) => {
      setMuscleGroups(prev => prev.filter(mg => mg.id !== id));
   };

   return <MuscleGroupContext.Provider value={{muscleGroups, setMuscleGroups, addMuscleGroup, updateMuscleGroup, deleteMuscleGroup}}>{children}</MuscleGroupContext.Provider>;
};
