// File: ./src/app/Equipment/contexts/EquipmentContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

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
   const [equipments, setEquipments] = useState<Equipment[]>(() => {
      const storedEquipments = getLocalStorageItem<Equipment[]>('equipments', []);
      if (storedEquipments.length === 0) {
         setLocalStorageItem<Equipment[]>('equipments', defaultEquipments);
         return defaultEquipments;
      }
      return storedEquipments;
   });

   useEffect(() => {
      setLocalStorageItem<Equipment[]>('equipments', equipments);
   }, [equipments]);

   const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
      const newEquipment: Equipment = {id: uuidv4(), ...equipment};
      setEquipments(prev => [...prev, newEquipment]);
   };

   const updateEquipment = (equipment: Equipment) => {
      setEquipments(prev => prev.map(eq => (eq.id === equipment.id ? equipment : eq)));
   };

   const deleteEquipment = (id: string) => {
      setEquipments(prev => prev.filter(eq => eq.id !== id));
   };

   return <EquipmentContext.Provider value={{equipments, setEquipments, addEquipment, updateEquipment, deleteEquipment}}>{children}</EquipmentContext.Provider>;
};
