// HEADER-START
// * Path: ./src/components/UI/KarateBelt.tsx
// HEADER-END

import { Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import { styled, SxProps } from '@mui/system'; // Corrected import
import React from 'react';
export interface KarateBeltProps {
  sx?: SxProps<Theme>;
  thickness: string | number;
  borderWidth?: string;
  borderRadius: string;
  color: string; // Belt color
  stripes: number; // Number of dan stripes
  orientation?: 'horizontal' | 'vertical'; // Belt orientation
  stripeGap?: string; // Optional gap between stripes
}

const BeltWrapper = styled(Box)<{ orientation: 'horizontal' | 'vertical' }>(({ orientation }) => ({
  flexDirection: orientation === 'horizontal' ? 'row' : 'column',
  display: 'flex',
  alignItems: 'center',
}));

const BeltSegment = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'borderWidth' && prop !== 'borderRadius',
})<{
  color: string;
  borderWidth?: string;
  borderRadius: string;
}>(({ color, borderWidth: borderWidth, borderRadius }) => ({
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
}>(({ orientation }) => ({
  display: 'flex',
  flexDirection: orientation === 'horizontal' ? 'row' : 'column',
  position: 'absolute',
  right: orientation === 'horizontal' ? '10%' : undefined,
  bottom: orientation === 'horizontal' ? undefined : '0',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '100%',
  width: '100%',
  // Padding removed as it was using invalid string interpolation and seems unnecessary with flex gap/positioning
  boxSizing: 'border-box',
}));

const SimpleStripe = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'thickness' && prop !== 'color' && prop !== 'orientation' && prop !== 'stripeGap',
})<{
  thickness: string | number;
  color: string;
  orientation: 'horizontal' | 'vertical';
  stripeGap: string;
}>(({ thickness, color, orientation, stripeGap }) => ({
  marginLeft: orientation === 'horizontal' ? stripeGap : 0,
  marginTop: orientation === 'horizontal' ? 0 : stripeGap,
  width: orientation === 'horizontal' ? thickness : '100%',
  height: orientation === 'horizontal' ? '100%' : thickness,
  backgroundColor: color,
  // border: '1px solid rgba(0,0,0,0.1)', // simplified border
}));

const KarateBelt: React.FC<KarateBeltProps> = ({
  sx,
  color,
  thickness,
  borderWidth: borderWidth = '0.1em',
  stripes,
  borderRadius = '0',
  orientation = 'horizontal',
  stripeGap = '4px',
}) => {
  const isBlackBelt = color.toLowerCase() === 'black' || color === '#000000';

  return (
    <BeltWrapper orientation={orientation}>
      <BeltSegment sx={sx} color={color} borderWidth={borderWidth} borderRadius={borderRadius}>
        {/* Stripe for intermediate level */}
        {!isBlackBelt && stripes > 0 && (
          <StripeContainer orientation={orientation}>
            <SimpleStripe
              thickness={thickness}
              color="white"
              orientation={orientation}
              stripeGap={stripeGap}
            />
          </StripeContainer>
        )}
        {/* Stripes for black belt */}
        {isBlackBelt && stripes > 0 && (
          <StripeContainer orientation={orientation}>
            {Array.from({ length: stripes }, (_, i) => (
              <SimpleStripe
                thickness={thickness}
                color="gold"
                key={i}
                orientation={orientation}
                stripeGap={stripeGap}
              />
            ))}
          </StripeContainer>
        )}
      </BeltSegment>
    </BeltWrapper>
  );
};

export default KarateBelt;
