// File: ./src/app/ten-thousand-days/TrainingTrackerPage.tsx

import { Container, Paper, Typography, Box, alpha, useTheme } from '@mui/material';
import { TrendingUp } from 'lucide-react';
import React from 'react';
import { TrainingTracker } from './TrainingTracker';

const TrainingTrackerPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.background.paper,
            1,
          )} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <TrendingUp size={32} color="white" />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              10,000 Days Training Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Track your daily training progress and journey to mastery
            </Typography>
          </Box>
        </Box>
      </Paper>

      <TrainingTracker />
    </Container>
  );
};

export default TrainingTrackerPage;
