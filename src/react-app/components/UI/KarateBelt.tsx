// HEADER-START
// * Path: ./src/components/UI/KarateBelt.tsx
// HEADER-END

import { Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import { styled, SxProps } from '@mui/system';
import React from 'react';
import { GradeRecord, GradeKind } from '../../../data/model/grade';

export interface KarateBeltProps {
  sx?: SxProps<Theme>;
  thickness: string | number;
  borderWidth?: string;
  borderRadius: string;
  grade: GradeRecord; // Now accepts full grade object
  orientation?: 'horizontal' | 'vertical';
  stripeGap?: string;
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
}));

/**
 * Calculate the number of stripes based on grade
 * - Kyu grades with odd numbers (9, 7, 5, 3, 1) get 1 white stripe
 * - Dan grades get gold stripes equal to their dan number
 */
const calculateStripes = (grade: GradeRecord): number => {
  if (grade.kind === GradeKind.Dan) {
    return grade.number; // 1st Dan = 1 stripe, 2nd Dan = 2 stripes, etc.
  }

  if (grade.kind === GradeKind.Kyu && grade.number % 2 === 1) {
    return 1; // Odd kyu numbers (9, 7, 5, 3, 1) get 1 stripe
  }

  return 0; // No stripes for even kyu or mukyu
};

const KarateBelt: React.FC<KarateBeltProps> = ({
  sx,
  grade,
  thickness,
  borderWidth: borderWidth = '0.1em',
  borderRadius = '0',
  orientation = 'horizontal',
  stripeGap = '4px',
}) => {
  const color = grade.beltColor;
  const stripes = calculateStripes(grade);
  const isBlackBelt = color.toLowerCase() === 'black' || color === 'black';

  return (
    <BeltWrapper orientation={orientation}>
      <BeltSegment sx={sx} color={color} borderWidth={borderWidth} borderRadius={borderRadius}>
        {/* Stripe for intermediate kyu level */}
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
        {/* Stripes for black belt (dan grades) */}
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
