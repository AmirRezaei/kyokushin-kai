// File: ./src/app/WordQuest/Card/UI/LinearProgressWithLabel.tsx

import Box from '@mui/material/Box';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import * as React from 'react';

export function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'end' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Typography variant="body2" sx={{ minWidth: '3em', color: 'text.secondary' }}>
        {`${Math.round(props.value)}%`}
      </Typography>
    </Box>
  );
}
