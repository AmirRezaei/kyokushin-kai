// File: ./src/app/ten-thousand-days/TenThousandDaysTrackerPage.tsx

// HEADER-START
// * Path: ./src/app/settings/TenThousandDaysTrackerPage.tsx
// HEADER-END

import {Box, Container, Paper, Typography} from '@mui/material';
import React from 'react';

import {TenThousandDaysTracker} from './TenThousandDaysTracker';

const TenThousandDaysTrackerPage: React.FC = () => {
   return (
      <Container maxWidth='lg' sx={{py: 4}}>
         <Paper elevation={3} sx={{p: 3, mb: 3}}>
            <Typography variant='h4' component='h1' gutterBottom>
               10,000 Days Journey
            </Typography>
            <Typography variant='body1' color='text.secondary' gutterBottom>
               Track your daily practice and visualize your progress toward mastery.
            </Typography>
         </Paper>

         <Box sx={{mt: 2}}>
            <TenThousandDaysTracker title='Kyokushin 10,000 Days Tracker' />
         </Box>
      </Container>
   );
};

export default TenThousandDaysTrackerPage;
