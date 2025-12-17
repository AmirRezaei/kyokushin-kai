// HEADER-START
// * Path: ./src/components/AlignBox.tsx
// HEADER-END

import Box from '@mui/material/Box';
import React from 'react';

interface AlignBoxProps {
   children: React.ReactNode;
   direction?: 'horizontal' | 'vertical';
   sx?: object;
}

const AlignBox: React.FC<AlignBoxProps> = ({children, direction = 'horizontal', sx = {}}) => {
   return (
      <Box display='flex' flexDirection={direction === 'vertical' ? 'column' : 'row'} sx={sx}>
         {children}
      </Box>
   );
};

export default AlignBox;
