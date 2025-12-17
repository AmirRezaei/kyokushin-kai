// HEADER-START
// * Path: ./src/app/trainingSession/trainingSessionPage.tsx
// HEADER-END
import {Box, Container, Divider, Typography} from '@mui/material';
import React, {useCallback, useEffect, useState} from 'react';

import TrainingSessionForm from '@/components/Training/TrainingSessionForm';
import TrainingSessionList from '@/components/Training/TrainingSessionList';
import TrainingStatistics from '@/components/Training/TrainingStatistics';
import TrainingTypeBreakdownChart from '@/components/Training/TrainingTypeBreakdownChart';
import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

export interface TrainingSession {
   date: string;
   type: string;
   duration: number;
   intensity: string;
   notes: string;
}

const TrainingSessionPage: React.FC = () => {
    const [sessions, setSessions] = useState<TrainingSession[]>(() => getLocalStorageItem<TrainingSession[]>('trainingSessions', []));

   const handleAddSession = useCallback(
      (session: TrainingSession) => {
         const updatedSessions = [...sessions, session];
         setSessions(updatedSessions);
         setLocalStorageItem('trainingSessions', updatedSessions);
      },
      [sessions],
   );

   const handleDeleteSession = useCallback(
      (index: number) => {
         const updatedSessions = sessions.filter((_, i) => i !== index);
         setSessions(updatedSessions);
         setLocalStorageItem('trainingSessions', updatedSessions);
      },
      [sessions],
   );

   const handleEditSession = useCallback(
      (index: number, updatedSession: TrainingSession) => {
         const updatedSessions = sessions.map((session, i) => (i === index ? updatedSession : session));
         setSessions(updatedSessions);
         setLocalStorageItem('trainingSessions', updatedSessions);
      },
      [sessions],
   );

   useEffect(() => {
      setLocalStorageItem('trainingSessions', sessions);
   }, [sessions]);

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