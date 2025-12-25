// File: src/react-app/app/WordQuest/components/GamePageHeader.tsx

import { Box, Fade, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';

interface GamePageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const GamePageHeader: React.FC<GamePageHeaderProps> = ({ icon, title, description }) => {
  const theme = useTheme();

  return (
    <Fade in timeout={800}>
      <Paper
        elevation={2}
        sx={{
          pt: theme.spacing(2),
          pb: theme.spacing(2),
          textAlign: 'center',
          borderRadius: 0,
          background: theme.palette.primary.main,
          mb: theme.spacing(2),
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: theme.spacing(1.5),
          }}
        >
          <Box
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem' },
              color: theme.palette.primary.contrastText,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: theme.palette.primary.contrastText,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.primary.contrastText,
            opacity: 0.9,
            mt: 1,
          }}
        >
          {description}
        </Typography>
      </Paper>
    </Fade>
  );
};

export default GamePageHeader;
