// File: ./src/app/Equipment/contexts/TrainingSessionContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {TrainingSession} from '../types';

interface TrainingSessionContextProps {
   trainingSessions: TrainingSession[];
   setTrainingSessions: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
   addTrainingSession: (session: Omit<TrainingSession, 'id'>) => void;
   updateTrainingSession: (session: TrainingSession) => void;
   deleteTrainingSession: (id: string) => void;
}

export const TrainingSessionContext = createContext<TrainingSessionContextProps>({
   trainingSessions: [],
   setTrainingSessions: () => {},
   addTrainingSession: () => {},
   updateTrainingSession: () => {},
   deleteTrainingSession: () => {},
});

interface TrainingSessionProviderProps {
   children: React.ReactNode;
}

export const TrainingSessionProvider: React.FC<TrainingSessionProviderProps> = ({children}) => {
   const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(() => {
      const storedSessions = localStorage.getItem('trainingSessions');
      return storedSessions ? (JSON.parse(storedSessions) as TrainingSession[]) : [];
   });

   useEffect(() => {
      localStorage.setItem('trainingSessions', JSON.stringify(trainingSessions));
   }, [trainingSessions]);

   const addTrainingSession = (session: Omit<TrainingSession, 'id'>) => {
      const newSession: TrainingSession = {id: uuidv4(), ...session};
      setTrainingSessions(prev => [...prev, newSession]);
   };

   const updateTrainingSession = (session: TrainingSession) => {
      setTrainingSessions(prev => prev.map(ts => (ts.id === session.id ? session : ts)));
   };

   const deleteTrainingSession = (id: string) => {
      setTrainingSessions(prev => prev.filter(ts => ts.id !== id));
   };

   return <TrainingSessionContext.Provider value={{trainingSessions, setTrainingSessions, addTrainingSession, updateTrainingSession, deleteTrainingSession}}>{children}</TrainingSessionContext.Provider>;
};
