// HEADER-START
// * Path: ./src/components/UI/KarateBelt.tsx
// HEADER-END

import {Theme} from '@emotion/react';
import Box from '@mui/material/Box';
import {styled, SxProps} from '@mui/system'; // Corrected import
import React from 'react';
export interface KarateBeltProps {
   sx?: SxProps<Theme>;
   thickness: string | number;
   borderWidth?: string;
   borderRadius: string;
   color: string; // Belt color
   stripes: number; // Number of dan stripes
   orientation?: 'horizontal' | 'vertical'; // Belt orientation
}

const BeltWrapper = styled(Box)<{orientation: 'horizontal' | 'vertical'}>(({orientation}) => ({
   flexDirection: orientation === 'horizontal' ? 'row' : 'column',
   display: 'flex',
   alignItems: 'center',
}));

const BeltSegment = styled(Box, {
   shouldForwardProp: prop => prop !== 'borderWidth' && prop !== 'borderRadius',
})<{
   color: string;
   borderWidth?: string;
   borderRadius: string;
}>(({color, borderWidth: borderWidth, borderRadius}) => ({
   borderColor: 'black',
   borderWidth: borderWidth,
   borderStyle: 'solid',
   position: 'relative',
   padding: 0,
   margin: '0.2em',
   borderRadius: borderRadius,
   overflow: 'hidden',
   backgroundColor: color,
}));

const StripeContainer = styled(Box)<{
   orientation: 'horizontal' | 'vertical';
}>(({orientation}) => ({
   display: 'flex',
   flexDirection: orientation === 'horizontal' ? 'row' : 'column',
   position: 'absolute',
   right: orientation === 'horizontal' ? '10%' : undefined,
   bottom: orientation === 'horizontal' ? undefined : '0',
   alignItems: 'center',
   justifyContent: 'flex-end',
   height: '100%',
   width: '100%',
   padding: orientation === 'horizontal' ? '0 thickness' : 'thickness 0',
   boxSizing: 'border-box',
}));

const SimpleStripe = styled(Box)<{
   thickness: string | number;
   color: string;
   orientation: 'horizontal' | 'vertical';
}>(({thickness, color, orientation}) => ({
   marginLeft: orientation === 'horizontal' ? 0 : 0,
   marginTop: orientation === 'horizontal' ? 0 : 0,
   width: orientation === 'horizontal' ? thickness : '100%',
   height: orientation === 'horizontal' ? '100%' : thickness,
   backgroundColor: color,
   border: '0.01em solid black',
}));

const KarateBelt: React.FC<KarateBeltProps> = ({sx, color, thickness, borderWidth: borderWidth = '0.1em', stripes, borderRadius = '0', orientation = 'horizontal'}) => {
   return (
      <BeltWrapper orientation={orientation}>
         <BeltSegment sx={sx} color={color} borderWidth={borderWidth} borderRadius={borderRadius}>
            {/* Stripe for intermediate level */}
            {color !== 'black' && stripes > 0 && (
               <StripeContainer orientation={orientation}>
                  <SimpleStripe thickness={thickness} color='white' orientation={orientation} />
               </StripeContainer>
            )}
            {/* Stripes for black belt */}
            {color === 'black' && stripes > 0 && (
               <StripeContainer orientation={orientation}>
                  {Array.from({length: stripes}, (_, i) => (
                     <SimpleStripe thickness={thickness} color='gold' key={i} orientation={orientation} />
                  ))}
               </StripeContainer>
            )}
         </BeltSegment>
      </BeltWrapper>
   );
};

export default KarateBelt;
