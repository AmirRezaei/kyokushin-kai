// File: ./src/app/WordQuest/Card/UI/FlipCardContainer.tsx

import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

// Create the styled component using theme
const StyledFlipCardContainer = styled(Box)(({ theme }) => ({
  perspective: '1000px',
  cursor: 'pointer',
  margin: '2em',
}));

interface FlipCardContainerProps extends BoxProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const FlipCardContainer: React.FC<FlipCardContainerProps> = ({
  children,
  onClick,
  sx,
  ...rest
}) => {
  return (
    <StyledFlipCardContainer onClick={onClick} sx={sx} {...rest}>
      {children}
    </StyledFlipCardContainer>
  );
};

export default FlipCardContainer;
