// File: ./src/app/TrainingManager/contexts/GymSessionContext.tsx
import React, {createContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {GymSession} from '../types';
import {useAuth} from '../../../components/context/AuthContext';

interface GymSessionContextProps {
   gymSessions: GymSession[];
   setGymSessions: React.Dispatch<React.SetStateAction<GymSession[]>>;
   addGymSession: (session: Omit<GymSession, 'id'>) => void;
   updateGymSession: (session: GymSession) => void;
   deleteGymSession: (id: string) => void;
}

export const GymSessionContext = createContext<GymSessionContextProps>({
   gymSessions: [],
   setGymSessions: () => {},
   addGymSession: () => {},
   updateGymSession: () => {},
   deleteGymSession: () => {},
});

interface GymSessionProviderProps {
   children: React.ReactNode;
}

export const GymSessionProvider: React.FC<GymSessionProviderProps> = ({children}) => {
   const {token, isLoading} = useAuth();
   const [gymSessions, setGymSessions] = useState<GymSession[]>(() => {
      if (typeof window !== 'undefined') {
         const storedSessions = localStorage.getItem('gymSessions');
         return storedSessions ? (JSON.parse(storedSessions) as GymSession[]) : [];
      }
      return [];
   });

   // Fetch from API when token is available, clear when logged out
   useEffect(() => {
      if (isLoading) return;

      if (!token) {
         setGymSessions([]);
         localStorage.removeItem('gymSessions');
         return;
      }

      const fetchSessions = async () => {
         try {
            const res = await fetch('/api/v1/gym/sessions', {
               headers: {Authorization: `Bearer ${token}`},
            });
            if (res.ok) {
               const data = await res.json();
               if (data.sessions) {
                  setGymSessions(data.sessions);
                  // Optionally sync back to local storage or keep separate
                  localStorage.setItem('gymSessions', JSON.stringify(data.sessions));
               }
            }
         } catch (error) {
            console.error('Failed to fetch gym sessions', error);
         }
      };

      fetchSessions();
   }, [token, isLoading]);

   // Sync to LocalStorage (always, for offline capability/cache)
   useEffect(() => {
      localStorage.setItem('gymSessions', JSON.stringify(gymSessions));
   }, [gymSessions]);

   const addGymSession = async (session: Omit<GymSession, 'id'>) => {
      const newSession: GymSession = {id: uuidv4(), ...session};
      
      // Optimistic update
      setGymSessions(prev => [...prev, newSession]);

      if (token) {
         try {
            await fetch('/api/v1/gym/sessions', {
               method: 'POST',
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(newSession),
            });
         } catch (e) {
            console.error('Failed to persist session', e);
         }
      }
   };

   const updateGymSession = async (session: GymSession) => {
      // Optimistic update
      setGymSessions(prev => prev.map(ts => (ts.id === session.id ? session : ts)));

      if (token) {
         try {
            await fetch('/api/v1/gym/sessions', {
               method: 'POST', // API supports upsert via POST
               headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
               body: JSON.stringify(session),
            });
         } catch (e) {
            console.error('Failed to update session', e);
         }
      }
   };

   const deleteGymSession = async (id: string) => {
      // Optimistic update
      setGymSessions(prev => prev.filter(ts => ts.id !== id));

      if (token) {
         try {
            await fetch(`/api/v1/gym/sessions/${id}`, {
               method: 'DELETE',
               headers: {Authorization: `Bearer ${token}`},
            });
         } catch (e) {
            console.error('Failed to delete session', e);
         }
      }
   };

   return <GymSessionContext.Provider value={{gymSessions, setGymSessions, addGymSession, updateGymSession, deleteGymSession}}>{children}</GymSessionContext.Provider>;
};
