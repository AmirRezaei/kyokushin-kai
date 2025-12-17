// File: ./src/app/Equipment/CustomAnimatedLine.tsx

import {useChartId, useDrawingArea, useXScale} from '@mui/x-charts/hooks';
import {AnimatedLine, AnimatedLineProps} from '@mui/x-charts/LineChart';
import * as React from 'react';

interface CustomAnimatedLineProps extends AnimatedLineProps {
   limit?: number;
}

function CustomAnimatedLine(props: CustomAnimatedLineProps) {
   const {limit, ...other} = props;
   const {top, bottom, height, left, width} = useDrawingArea();
   const scale = useXScale();
   const chartId = useChartId();

   // If no limit is provided, render the default line
   if (limit === undefined) {
      return <AnimatedLine {...other} />;
   }

   // Convert the 'limit' data value into an x-coordinate on the chart
   const limitPosition = scale(limit);
   if (limitPosition === undefined) {
      return <AnimatedLine {...other} />;
   }

   // Unique IDs for the clipping paths
   const clipIdLeft = `${chartId}-${props.ownerState.id}-line-limit-${limit}-1`;
   const clipIdRight = `${chartId}-${props.ownerState.id}-line-limit-${limit}-2`;

   return (
      <React.Fragment>
         {/* Clip path for data up to the limit */}
         <clipPath id={clipIdLeft}>
            <rect x={left} y={0} width={limitPosition - left} height={top + height + bottom} />
         </clipPath>

         {/* Clip path for data after the limit */}
         <clipPath id={clipIdRight}>
            <rect x={limitPosition} y={0} width={left + width - limitPosition} height={top + height + bottom} />
         </clipPath>

         {/* Actual data before the limit */}
         <g clipPath={`url(#${clipIdLeft})`} className='line-before'>
            <AnimatedLine {...other} />
         </g>

         {/* Forecast data after the limit */}
         <g clipPath={`url(#${clipIdRight})`} className='line-after'>
            <AnimatedLine {...other} />
         </g>
      </React.Fragment>
   );
}

export default CustomAnimatedLine;
