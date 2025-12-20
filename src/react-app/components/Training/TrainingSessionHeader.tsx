import { Typography } from '@mui/material';
import React from 'react';

/**
 * Header component for the training session page
 * Displays the page title
 */
const TrainingSessionHeader: React.FC = () => {
  return (
    <Typography variant="h4" gutterBottom textAlign="center">
      Training Session Tracker
    </Typography>
  );
};

export default TrainingSessionHeader;
