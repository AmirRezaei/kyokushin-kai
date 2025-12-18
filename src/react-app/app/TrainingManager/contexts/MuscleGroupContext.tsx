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

import {useAuth} from '../../../components/context/AuthContext';

export const MuscleGroupProvider: React.FC<MuscleGroupProviderProps> = ({children}) => {
   const {token, isLoading} = useAuth();
   const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(() => {
      const storedMuscleGroups = getLocalStorageItem<MuscleGroup[]>('muscleGroups', []);
      if (storedMuscleGroups.length === 0) {
         const defaultMuscleGroups: MuscleGroup[] = [
            {id: '1', name: 'Chest'},
            {id: '2', name: 'Back'},
            {id: '3', name: 'Legs'},
            {id: '4', name: 'Shoulders'},
            {id: '5', name: 'Arms'},
            {id: '6', name: 'Abs'},
         ];
         setLocalStorageItem<MuscleGroup[]>('muscleGroups', defaultMuscleGroups);
         return defaultMuscleGroups;
      }
      return storedMuscleGroups;
   });

   useEffect(() => {
      if (isLoading) return;

      if (!token) {
         setMuscleGroups([]);
         localStorage.removeItem('muscleGroups');
         return;
      }

      const fetchData = async () => {
         try {
            const res = await fetch('/api/v1/gym/muscle-groups', {
               headers: {Authorization: `Bearer ${token}`},
            });
            if (res.ok) {
               const data = await res.json();
               if (data.muscleGroups && data.muscleGroups.length > 0) {
                  setMuscleGroups(data.muscleGroups);
                  setLocalStorageItem('muscleGroups', data.muscleGroups);
               } else {
                  // If empty, seed with defaults
                  const defaults: MuscleGroup[] = [
                     {id: uuidv4(), name: 'Chest'},
                     {id: uuidv4(), name: 'Back'},
                     {id: uuidv4(), name: 'Legs'},
                     {id: uuidv4(), name: 'Shoulders'},
                     {id: uuidv4(), name: 'Arms'},
                     {id: uuidv4(), name: 'Abs'},
                  ];
                  setMuscleGroups(defaults);
                  setLocalStorageItem('muscleGroups', defaults);

                  // Persist defaults to backend SEQUENTIALLY to avoid rate limiting/locking
                  for (const group of defaults) {
                     try {
                        await fetch('/api/v1/gym/muscle-groups', {
                           method: 'POST',
                           headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                           body: JSON.stringify(group),
                        });
                     } catch (seedError) {
                        console.error(`Failed to seed muscle group ${group.name}`, seedError);
                     }
                  }
               }
            }
         } catch (e) {
            console.error('Failed to fetch muscle groups', e);
         }
      };
      fetchData();
   }, [token, isLoading]);

   useEffect(() => {
      setLocalStorageItem<MuscleGroup[]>('muscleGroups', muscleGroups);
   }, [muscleGroups]);

   const addMuscleGroup = async (group: Omit<MuscleGroup, 'id'>) => {
      const newGroup: MuscleGroup = {id: uuidv4(), ...group};
      setMuscleGroups(prev => [...prev, newGroup]);
      if (token) {
         try {
            await fetch('/api/v1/gym/muscle-groups', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(newGroup),
            });
         } catch (e) {
            console.error('Failed to add muscle group', e);
         }
      }
   };

   const updateMuscleGroup = async (group: MuscleGroup) => {
      setMuscleGroups(prev => prev.map(mg => (mg.id === group.id ? group : mg)));
      if (token) {
         try {
            await fetch('/api/v1/gym/muscle-groups', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(group),
            });
         } catch (e) {
            console.error('Failed to update muscle group', e);
         }
      }
   };

   const deleteMuscleGroup = async (id: string) => {
      setMuscleGroups(prev => prev.filter(mg => mg.id !== id));
      if (token) {
         try {
            await fetch(`/api/v1/gym/muscle-groups/${id}`, {
               method: 'DELETE',
               headers: {Authorization: `Bearer ${token}`},
            });
         } catch (e) {
            console.error('Failed to delete muscle group', e);
         }
      }
   };

   return <MuscleGroupContext.Provider value={{muscleGroups, setMuscleGroups, addMuscleGroup, updateMuscleGroup, deleteMuscleGroup}}>{children}</MuscleGroupContext.Provider>;
};
