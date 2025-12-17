// HEADER-START
// * Path: ./src/components/UI/CustomDivider.tsx
// HEADER-END
'use client';

import {Typography} from '@mui/material';
import Stack from '@mui/material/Stack';
import {styled, useTheme} from '@mui/material/styles';
import React from 'react';

type TextAlign = 'start' | 'left' | 'center' | 'right' | 'end';

interface CustomDividerProps {
   textAlign?: TextAlign;
   thickness?: number;
   children?: React.ReactNode;
   bold?: boolean;
}

interface DividerLineProps {
   thickness: number;
   bold?: boolean;
   flexGrow: number;
}

const DividerLine = styled('div')<DividerLineProps>(({theme, thickness, bold, flexGrow}) => ({
   height: thickness,
   backgroundColor: theme.palette.divider,
   fontWeight: bold ? 'bold' : 'normal',
   flexGrow,
}));

const CustomDivider: React.FC<CustomDividerProps> = ({textAlign = 'center', thickness = 1, children, bold = false}) => {
   const theme = useTheme();

   // Determine flexGrow values based on textAlign
   let leftFlexGrow = 1;
   let rightFlexGrow = 1;
   let contentOrder: 'start' | 'center' | 'end' = 'center';

   switch (textAlign) {
      case 'start':
         leftFlexGrow = 0;
         rightFlexGrow = 1;
         contentOrder = 'start';
         break;
      case 'end':
         leftFlexGrow = 1;
         rightFlexGrow = 0;
         contentOrder = 'end';
         break;
      case 'left':
         leftFlexGrow = 1;
         rightFlexGrow = 12;
         contentOrder = 'start';
         break;
      case 'right':
         leftFlexGrow = 12;
         rightFlexGrow = 1;
         contentOrder = 'end';
         break;
      case 'center':
      default:
         leftFlexGrow = 1;
         rightFlexGrow = 1;
         contentOrder = 'center';
         break;
   }

   return (
      <Stack
         direction='row'
         alignItems='center'
         spacing={1}
         sx={{
            width: '100%',
            justifyContent: contentOrder === 'start' ? 'flex-start' : contentOrder === 'end' ? 'flex-end' : 'center',
         }}>
         {leftFlexGrow > 0 && <DividerLine thickness={thickness} bold={bold} flexGrow={leftFlexGrow} />}
         <Typography sx={{fontWeight: bold ? 'bold' : 'normal'}}>{children}</Typography>
         {rightFlexGrow > 0 && <DividerLine thickness={thickness} bold={bold} flexGrow={rightFlexGrow} />}
      </Stack>
   );
};

export default CustomDivider;
