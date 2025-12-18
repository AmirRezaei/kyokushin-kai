// File: ./src/app/Equipment/contexts/EquipmentContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';
import {useAuth} from '../../../components/context/AuthContext';

import {Equipment} from '../types';

interface EquipmentContextProps {
   equipments: Equipment[];
   setEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
   addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
   updateEquipment: (equipment: Equipment) => void;
   deleteEquipment: (id: string) => void;
}

export const EquipmentContext = createContext<EquipmentContextProps>({
   equipments: [],
   setEquipments: () => {},
   addEquipment: () => {},
   updateEquipment: () => {},
   deleteEquipment: () => {},
});

interface EquipmentProviderProps {
   children: React.ReactNode;
}

const defaultEquipments: Equipment[] = [
   {
      id: '1',
      name: 'Dumbbell',
      description: 'Adjustable dumbbells for various exercises.',
   },
];

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({children}) => {
   const {token, isLoading} = useAuth();
   const [equipments, setEquipments] = useState<Equipment[]>(() => {
      const storedEquipments = getLocalStorageItem<Equipment[]>('equipments', []);
      if (storedEquipments.length === 0) {
         setLocalStorageItem<Equipment[]>('equipments', defaultEquipments);
         return defaultEquipments;
      }
      return storedEquipments;
   });

   useEffect(() => {
      if (isLoading) return;

      if (!token) {
         setTimeout(() => setEquipments([]), 0);
         localStorage.removeItem('equipments');
         return;
      }

      const fetchData = async () => {
         try {
            const res = await fetch('/api/v1/gym/equipment', {
               headers: {Authorization: `Bearer ${token}`},
            });
            if (res.ok) {
               const data = await res.json();
               if (data.equipment && data.equipment.length > 0) {
                  setEquipments(data.equipment);
                  setLocalStorageItem('equipments', data.equipment);
               } else {
                  // Seed defaults
                  const defaults: Equipment[] = [
                     { id: uuidv4(), name: 'Dumbbell', description: 'Free weight for isolation exercises.' },
                     { id: uuidv4(), name: 'Barbell', description: 'Long bar for compound lifts like Squats/Deadlifts.' },
                     { id: uuidv4(), name: 'Kettlebell', description: 'Ball-shaped weight with a handle.' },
                     { id: uuidv4(), name: 'Bench Press', description: 'Flat or inclined bench for pressing.' },
                     { id: uuidv4(), name: 'Pull-up Bar', description: 'Bar for upper body pulling exercises.' },
                     { id: uuidv4(), name: 'Treadmill', description: 'Cardio machine for running/walking.' },
                  ];
                  setEquipments(defaults);
                  setLocalStorageItem('equipments', defaults);

                  // Persist defaults to backend SEQUENTIALLY
                  for (const eq of defaults) {
                     try {
                        await fetch('/api/v1/gym/equipment', {
                           method: 'POST',
                           headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                           body: JSON.stringify(eq),
                        });
                     } catch (seedError) {
                        console.error(`Failed to seed equipment ${eq.name}`, seedError);
                     }
                  }
               }
            }
         } catch (e) {
            console.error('Failed to fetch equipment', e);
         }
      };
      fetchData();
   }, [token, isLoading]);

   useEffect(() => {
      setLocalStorageItem<Equipment[]>('equipments', equipments);
   }, [equipments]);

   const addEquipment = async (equipment: Omit<Equipment, 'id'>) => {
      const newEquipment: Equipment = {id: uuidv4(), ...equipment};
      setEquipments(prev => [...prev, newEquipment]);
      if (token) {
         try {
            await fetch('/api/v1/gym/equipment', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(newEquipment),
            });
         } catch (e) {
            console.error('Failed to add equipment', e);
         }
      }
   };

   const updateEquipment = async (equipment: Equipment) => {
      setEquipments(prev => prev.map(eq => (eq.id === equipment.id ? equipment : eq)));
      if (token) {
         try {
            await fetch('/api/v1/gym/equipment', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(equipment),
            });
         } catch (e) {
            console.error('Failed to update equipment', e);
         }
      }
   };

   const deleteEquipment = async (id: string) => {
      setEquipments(prev => prev.filter(eq => eq.id !== id));
      if (token) {
         try {
            await fetch(`/api/v1/gym/equipment/${id}`, {
               method: 'DELETE',
               headers: {Authorization: `Bearer ${token}`},
            });
         } catch (e) {
            console.error('Failed to delete equipment', e);
         }
      }
   };

   return <EquipmentContext.Provider value={{equipments, setEquipments, addEquipment, updateEquipment, deleteEquipment}}>{children}</EquipmentContext.Provider>;
};
