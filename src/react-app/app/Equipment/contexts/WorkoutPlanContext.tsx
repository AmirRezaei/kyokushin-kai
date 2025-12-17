// File: ./src/app/Equipment/contexts/WorkoutPlanContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {WorkoutPlan} from '../types';

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

export const WorkoutPlanProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
   const [plans, setPlans] = useState<WorkoutPlan[]>(() => {
      const stored = localStorage.getItem('workoutPlans');
      return stored ? JSON.parse(stored) : [];
   });

   useEffect(() => {
      localStorage.setItem('workoutPlans', JSON.stringify(plans));
   }, [plans]);

   const addPlan = (plan: Omit<WorkoutPlan, 'id'>) => {
      setPlans(prev => [...prev, {id: uuidv4(), ...plan}]);
   };

   const updatePlan = (plan: WorkoutPlan) => {
      setPlans(prev => prev.map(p => (p.id === plan.id ? plan : p)));
   };

   const deletePlan = (id: string) => {
      setPlans(prev => prev.filter(p => p.id !== id));
   };

   return <WorkoutPlanContext.Provider value={{plans, setPlans, addPlan, updatePlan, deletePlan}}>{children}</WorkoutPlanContext.Provider>;
};
