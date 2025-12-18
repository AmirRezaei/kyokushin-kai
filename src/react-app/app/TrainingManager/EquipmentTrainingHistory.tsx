// File: ./src/app/Equipment/EquipmentTrainingHistory.tsx

import {FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography} from '@mui/material';
import {LineChart} from '@mui/x-charts';
import React, {useContext,useMemo, useState} from 'react';

import {TrainingSetContext} from './contexts/TrainingSetContext';
import CustomAnimatedLine from './CustomAnimatedLine';
import {calculateAverageSlope, generateForecastPoints} from './helper';
import {Equipment, TrainingSet} from './types';

interface Props {
   equipment: Equipment;
   trainingSets: TrainingSet[];
}

export const EquipmentTrainingHistory: React.FC<Props> = ({equipment, trainingSets}) => {
   const {trainingSets: contextTrainingSets} = useContext(TrainingSetContext);

   const [timeFrame, setTimeFrame] = useState<string>('all');

   const now = useMemo(() => new Date(), []);

   // Filter training sets based on equipment ID and selected time frame
   const filteredSets = useMemo(() => {
      return contextTrainingSets
         .filter(set => set.equipmentId === equipment.id)
         .filter(set => {
            if (timeFrame === 'all') return true;
            const setDate = new Date(set.date);
            const comparisonDate = new Date(now);
            if (timeFrame === '1m') {
               comparisonDate.setMonth(comparisonDate.getMonth() - 1);
               return setDate >= comparisonDate;
            }
            if (timeFrame === '6m') {
               comparisonDate.setMonth(comparisonDate.getMonth() - 6);
               return setDate >= comparisonDate;
            }
            if (timeFrame === '1y') {
               comparisonDate.setFullYear(comparisonDate.getFullYear() - 1);
               return setDate >= comparisonDate;
            }
            return true;
         })
         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
   }, [contextTrainingSets, equipment.id, timeFrame, now]);

   // Calculate average slope
   const averageSlope = useMemo(() => {
      return calculateAverageSlope(filteredSets, 8) ?? 0;
   }, [filteredSets]);

   // Convert training sets to data points
   const dataPoints = useMemo(() => {
      return filteredSets.map(set => ({
         x: new Date(set.date).getTime(),
         y: set.weight,
      }));
   }, [filteredSets]);

   // Generate forecast points
   const forecastPoints = useMemo(() => {
      return generateForecastPoints(dataPoints, averageSlope, 4); // Generate 4 forecast points
   }, [dataPoints, averageSlope]);

   // Combine actual and forecast data
   const combinedData = useMemo(() => [...dataPoints, ...forecastPoints], [dataPoints, forecastPoints]);

   // Determine the limit (last actual data point's x value)
   const lastRealDataX = useMemo(() => {
      return dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].x : undefined;
   }, [dataPoints]);

   // Calculate average weight for display
   const averageWeight = useMemo(() => {
      if (filteredSets.length === 0) return 0;
      const totalWeight = filteredSets.reduce((sum, set) => sum + set.weight, 0);
      return totalWeight / filteredSets.length;
   }, [filteredSets]);

   return (
      <Paper style={{padding: 16, margin: 'auto', maxWidth: 1000}}>
         <Typography variant='h4' gutterBottom>
            Training History: {equipment.name}
         </Typography>

         <FormControl style={{minWidth: 150, marginBottom: 16}}>
            <InputLabel id='time-frame-select-label'>Time Frame</InputLabel>
            <Select labelId='time-frame-select-label' value={timeFrame} onChange={e => setTimeFrame(e.target.value)}>
               <MenuItem value='all'>All Time</MenuItem>
               <MenuItem value='1m'>Last 1 Month</MenuItem>
               <MenuItem value='6m'>Last 6 Months</MenuItem>
               <MenuItem value='1y'>Last 1 Year</MenuItem>
            </Select>
         </FormControl>

         <Grid container spacing={2}>
            <Grid item xs={12}>
               <LineChart
                  series={[
                     {
                        data: combinedData.map(d => d.y),
                        label: 'Weight (kg)',
                        color: '#1976d2', // Actual data line color
                        showMark: true,
                     },
                  ]}
                  xAxis={[
                     {
                        data: combinedData.map(d => d.x),
                        label: 'Date',
                        scaleType: 'time',
                        dataKey: 'x',
                        valueFormatter: (value: number) => new Date(value).toISOString().split('T')[0],
                     },
                  ]}
                  height={600}
                  width={800}
                  grid={{vertical: true, horizontal: true}}
                  slots={{line: CustomAnimatedLine}}
                  slotProps={{
                     line: {limit: lastRealDataX} as any,
                  }}
                  sx={{
                     '& .line-after path': {
                        strokeDasharray: '10 5', // Dashed line for forecast
                        stroke: '#f50057', // Forecast line color
                     },
                     '& .line-before path': {
                        stroke: '#1976d2', // Actual data line color
                     },
                  }}
               />
            </Grid>
         </Grid>

         {/* Optional: Display Average Weight */}
         <Typography variant='subtitle1' style={{marginTop: 16}}>
            Average Weight: {averageWeight.toFixed(2)} kg
         </Typography>
      </Paper>
   );
};

export default EquipmentTrainingHistory;
