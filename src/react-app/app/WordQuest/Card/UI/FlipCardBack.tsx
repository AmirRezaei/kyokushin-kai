// File: ./src/app/WordQuest/Card/UI/FlipCardBack.tsx

import { PaperProps } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import React from 'react';

import FlipCardFace from './FlipCardFace';

// Create the styled component by extending FlipCardFace
const StyledFlipCardBack = styled(FlipCardFace)(({ theme }: { theme: Theme }) => ({
  transform: 'rotateY(180deg)',
}));

interface FlipCardBackProps extends PaperProps {
  children: React.ReactNode;
}

const FlipCardBack: React.FC<FlipCardBackProps> = ({ children, sx, ...rest }) => {
  return (
    <StyledFlipCardBack sx={sx} {...rest}>
      {children}
    </StyledFlipCardBack>
  );
};

export default FlipCardBack;
