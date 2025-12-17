// File: ./src/app/WordQuest/FlashCard/UI/FlipCardInner.tsx

import {Box, BoxProps} from '@mui/material';
import {styled} from '@mui/system';
import React from 'react';

// Define the props interface
interface FlipCardInnerProps extends BoxProps {
   flipped: boolean;
}

// Create the styled component with shouldForwardProp to exclude 'flipped'
const StyledFlipCardInner = styled(Box, {
   shouldForwardProp: prop => prop !== 'flipped',
})<{flipped: boolean}>(({flipped}) => ({
   transition: 'transform 0.6s',
   transformStyle: 'preserve-3d',
   transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
}));

const FlipCardInner: React.FC<FlipCardInnerProps> = ({flipped, children, sx, ...rest}) => {
   return (
      <StyledFlipCardInner flipped={flipped} sx={sx} {...rest}>
         {children}
      </StyledFlipCardInner>
   );
};

export default FlipCardInner;
