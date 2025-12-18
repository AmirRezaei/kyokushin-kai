import {Box, Container, Divider, Typography} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import { useAuth } from '@/components/context/AuthContext';
import TrainingSessionForm from '@/components/Training/TrainingSessionForm';
import TrainingSessionList from '@/components/Training/TrainingSessionList';
import TrainingStatistics from '@/components/Training/TrainingStatistics';
import TrainingTypeBreakdownChart from '@/components/Training/TrainingTypeBreakdownChart';
import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';
import { UserTrainingSession } from '../../../data/model/trainingSession';

// Extend the model or just use it. The component expects "TrainingSession".
// Let's aliase for compatibility but ensure it has ID.
export type TrainingSession = UserTrainingSession;

const TrainingSessionPage: React.FC = () => {
    const { token } = useAuth();
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const isInitialMount = useRef(true);

    // Initial Load
    useEffect(() => {
        const loadSessions = async () => {
            if (token) {
                try {
                    const res = await fetch('/api/v1/training-sessions', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.sessions) {
                             setSessions(data.sessions);
                             return;
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch sessions", e);
                }
            }

            // Fallback or guest: usage localStorage
            // We need to migrate old data that might lack IDs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const localData = getLocalStorageItem<any[]>('trainingSessions', []);
            const migrated = localData.map(s => ({
                id: s.id || uuidv4(),
                date: s.date,
                type: s.type,
                duration: s.duration,
                intensity: s.intensity,
                notes: s.notes || ''
            }));
            if (JSON.stringify(migrated) !== JSON.stringify(localData)) {
                setLocalStorageItem('trainingSessions', migrated);
            }
            if (!token) {
                setSessions(migrated);
            }
        };
        loadSessions();
    }, [token]);

    // Sync to localStorage as backup if not logged in (or just always keep it in sync? No, avoid double source of truth issues)
    useEffect(() => {
       if (!token && !isInitialMount.current) {
          setLocalStorageItem('trainingSessions', sessions);
       } else if (isInitialMount.current) {
           isInitialMount.current = false;
       }
    }, [sessions, token]);

   const handleAddSession = useCallback(
      async (sessionData: Omit<TrainingSession, 'id'>) => {
         const newSession: TrainingSession = {
             ...sessionData,
             id: uuidv4(), // Ensure generated ID overrides any empty ID from form
         };

         setSessions(prev => [newSession, ...prev]); // Add to top for generic UI, though List might sort

         if (token) {
             try {
                await fetch('/api/v1/training-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(newSession)
                });
             } catch (e) { console.error("Failed to save session", e); }
         }
      },
      [token],
   );

   const handleDeleteSession = useCallback(
      async (idOrIndex: number | string) => {
         // Compatibility: if strictly number, treating as index might be dangerous if we switched to IDs.
         // But the List component passes index currently. We need to update that too? 
         // Or finding the session by index to get ID.
         
         let idToDelete: string | undefined;
         let newSessions: TrainingSession[] = [];

         if (typeof idOrIndex === 'number') {
             const session = sessions[idOrIndex];
             if (session) idToDelete = session.id;
             newSessions = sessions.filter((_, i) => i !== idOrIndex);
         } else {
             idToDelete = idOrIndex;
             newSessions = sessions.filter(s => s.id !== idOrIndex);
         }

         setSessions(newSessions);

         if (token && idToDelete) {
             try {
                await fetch(`/api/v1/training-sessions/${idToDelete}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
             } catch (e) { console.error("Failed to delete session", e); }
         }
      },
      [sessions, token],
   );

   const handleEditSession = useCallback(
      async (index: number, updatedSession: TrainingSession) => {
         // The updatedSession passed from form might not have ID if the form doesn't handle it
         // But we should ensure it has one.
         
         if (!updatedSession.id) {
             // Fallback: get ID from existing session at index
             const existing = sessions[index];
             if (existing) updatedSession.id = existing.id;
             else updatedSession.id = uuidv4();
         }

         const updatedSessions = sessions.map((session, i) => (i === index ? updatedSession : session));
         setSessions(updatedSessions);

         if (token) {
             try {
                await fetch('/api/v1/training-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(updatedSession)
                });
             } catch (e) { console.error("Failed to update session", e); }
         }
      },
      [sessions, token],
   );

   return (
      <Container maxWidth='md' sx={{py: 4}}>
         <Typography variant='h4' gutterBottom textAlign='center'>
            Training Session Tracker
         </Typography>
         <Box sx={{mb: 4}}>
            <TrainingSessionForm onAddSession={handleAddSession} />
         </Box>
         <Box sx={{mb: 4}}>
            <TrainingStatistics sessions={sessions} />
         </Box>
         <Box sx={{mb: 4}}>
            <TrainingTypeBreakdownChart sessions={sessions} />
         </Box>
         <Divider sx={{my: 4}} />
         <Box>
            <TrainingSessionList sessions={sessions} onDeleteSession={handleDeleteSession} onEditSession={handleEditSession} />
         </Box>
      </Container>
   );
};

export default TrainingSessionPage;