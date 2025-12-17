// File: ./src/app/WordQuest/FlashCard/UI/FlipCardFace.tsx

import {Paper, PaperProps} from '@mui/material';
import {styled, Theme} from '@mui/material/styles';
import React from 'react';

// Create the styled Paper component
const StyledFlipCardFace = styled(Paper)(({theme}: {theme: Theme}) => ({
   position: 'absolute',
   width: '100%',
   height: '100%',
   backfaceVisibility: 'hidden',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',

   border: '0.15em solid',
   borderBlockColor: 'black',
   borderRadius: '0.5em',
   boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1)',
}));

interface FlipCardFaceProps extends PaperProps {
   children: React.ReactNode;
}

const FlipCardFace: React.FC<FlipCardFaceProps> = ({children, sx, ...rest}) => {
   return (
      <StyledFlipCardFace elevation={3} sx={sx} {...rest}>
         {children}
      </StyledFlipCardFace>
   );
};

export default FlipCardFace;
