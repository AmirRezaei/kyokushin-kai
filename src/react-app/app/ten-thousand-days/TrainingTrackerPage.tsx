// File: ./src/app/ten-thousand-days/TrainingTrackerPage.tsx

import {Container, Paper, Typography} from '@mui/material';
import React from 'react';
import {TrainingTracker} from './TrainingTracker';

const TrainingTrackerPage: React.FC = () => {
   return (
      <Container maxWidth="lg" sx={{py: 4}}>
         <Paper elevation={3} sx={{p: 3, mb: 3}}>
            <Typography variant="h4" component="h1" gutterBottom>
               10 000 Days Training Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
               Track your daily training progress.
            </Typography>
         </Paper>

         <TrainingTracker />
      </Container>
   );
};

export default TrainingTrackerPage;