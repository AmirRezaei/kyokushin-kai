// File: ./src/app/TrainingManager/contexts/EquipmentCategoryContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getLocalStorageItem, setLocalStorageItem } from '@/components/utils/localStorageUtils';
import { useAuth } from '../../../components/context/AuthContext';

import { EquipmentCategory } from '../types';

interface EquipmentCategoryContextProps {
  categories: EquipmentCategory[];
  setCategories: React.Dispatch<React.SetStateAction<EquipmentCategory[]>>;
  addCategory: (category: Omit<EquipmentCategory, 'id'>) => void;
  updateCategory: (category: EquipmentCategory) => void;
  deleteCategory: (id: string) => void;
}

export const EquipmentCategoryContext = createContext<EquipmentCategoryContextProps>({
  categories: [],
  setCategories: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  deleteCategory: () => {},
});

interface EquipmentCategoryProviderProps {
  children: React.ReactNode;
}

const defaultCategories: EquipmentCategory[] = [
  {
    id: 'cardio',
    name: 'Cardio',
    description: 'Cardiovascular equipment',
    color: '#FF6B6B',
  },
  {
    id: 'strength',
    name: 'Strength',
    description: 'Strength training equipment',
    color: '#4ECDC4',
  },
  {
    id: 'free-weights',
    name: 'Free Weights',
    description: 'Dumbbells, barbells, and kettlebells',
    color: '#45B7D1',
  },
  {
    id: 'machines',
    name: 'Machines',
    description: 'Weight machines and cable systems',
    color: '#96CEB4',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Resistance bands, mats, and other accessories',
    color: '#FFEAA7',
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Miscellaneous equipment',
    color: '#DFE6E9',
  },
];

export const EquipmentCategoryProvider: React.FC<EquipmentCategoryProviderProps> = ({
  children,
}) => {
  const { token, isLoading } = useAuth();
  const [categories, setCategories] = useState<EquipmentCategory[]>(() => {
    const storedCategories = getLocalStorageItem<EquipmentCategory[]>('equipmentCategories', []);
    if (storedCategories.length === 0) {
      setLocalStorageItem<EquipmentCategory[]>('equipmentCategories', defaultCategories);
      return defaultCategories;
    }
    return storedCategories;
  });

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      setTimeout(() => setCategories([]), 0);
      localStorage.removeItem('equipmentCategories');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/gym/equipment-categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            setLocalStorageItem('equipmentCategories', data.categories);
          } else {
            // Seed defaults
            const defaults = defaultCategories.map((cat) => ({ ...cat, id: uuidv4() }));
            setCategories(defaults);
            setLocalStorageItem('equipmentCategories', defaults);

            // Persist defaults to backend SEQUENTIALLY
            for (const cat of defaults) {
              try {
                await fetch('/api/v1/gym/equipment-categories', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(cat),
                });
              } catch (seedError) {
                console.error(`Failed to seed category ${cat.name}`, seedError);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch equipment categories', e);
      }
    };
    fetchData();
  }, [token, isLoading]);

  useEffect(() => {
    setLocalStorageItem<EquipmentCategory[]>('equipmentCategories', categories);
  }, [categories]);

  const addCategory = async (category: Omit<EquipmentCategory, 'id'>) => {
    const newCategory: EquipmentCategory = { id: uuidv4(), ...category };
    setCategories((prev) => [...prev, newCategory]);
    if (token) {
      try {
        await fetch('/api/v1/gym/equipment-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newCategory),
        });
      } catch (e) {
        console.error('Failed to add category', e);
      }
    }
  };

  const updateCategory = async (category: EquipmentCategory) => {
    setCategories((prev) => prev.map((cat) => (cat.id === category.id ? category : cat)));
    if (token) {
      try {
        await fetch('/api/v1/gym/equipment-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(category),
        });
      } catch (e) {
        console.error('Failed to update category', e);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    if (token) {
      try {
        await fetch(`/api/v1/gym/equipment-categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Failed to delete category', e);
      }
    }
  };

  return (
    <EquipmentCategoryContext.Provider
      value={{ categories, setCategories, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </EquipmentCategoryContext.Provider>
  );
};
