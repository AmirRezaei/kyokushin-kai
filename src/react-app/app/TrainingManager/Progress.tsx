// File: ./src/app/Equipment/Progress.tsx

import {FormControl, Grid, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Typography} from '@mui/material';
import {LineChart, PieChart} from '@mui/x-charts';
import {AnimatedLineProps} from '@mui/x-charts/LineChart';
import {addMonths} from 'date-fns';
import React, {useContext, useMemo, useState} from 'react';

import {ExerciseContext} from './contexts/ExerciseContext';
import {MuscleGroupContext} from './contexts/MuscleGroupContext';
import {GymSessionContext} from './contexts/GymSessionContext';
import CustomAnimatedLine from './CustomAnimatedLine';

// Define custom slot props for CustomAnimatedLine
interface CustomLineSlotProps extends AnimatedLineProps {
   limit?: number;
}

interface DataPoint {
   x: number; // Timestamp
   y: number; // Weight or Volume
}

const ExerciseDevelopment: React.FC = () => {
   const {exercises} = useContext(ExerciseContext);
   const {gymSessions: trainingSessions} = useContext(GymSessionContext);
   const {muscleGroups} = useContext(MuscleGroupContext);
   const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
   const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string>('');
   const [forecastPeriod, setForecastPeriod] = useState<number>(3); // Default to 3 months

   // Handle exercise selection
   const handleExerciseChange = (event: SelectChangeEvent<string>) => {
      setSelectedExerciseId(event.target.value);
      setSelectedMuscleGroupId(''); // Reset muscle group when exercise is selected
   };

   // Handle muscle group selection
   const handleMuscleGroupChange = (event: SelectChangeEvent<string>) => {
      setSelectedMuscleGroupId(event.target.value);
      setSelectedExerciseId(''); // Reset exercise when muscle group is selected
   };

   // Handle forecast period selection
   const handleForecastPeriodChange = (event: SelectChangeEvent<number>) => {
      setForecastPeriod(event.target.value as number);
   };

   // Filter training sessions based on selection
   const sessionData = useMemo(() => {
      if (selectedExerciseId) {
         return trainingSessions
            .filter(session => session.exercises.some(ex => ex.exerciseId === selectedExerciseId))
            .flatMap(session =>
               session.exercises
                  .filter(ex => ex.exerciseId === selectedExerciseId)
                  .map(ex => ({
                     date: new Date(session.date).getTime(),
                     weight: ex.weight,
                     volume: ex.weight * ex.reps * ex.times,
                     reps: ex.reps,
                     times: ex.times,
                  })),
            )
            .sort((a, b) => a.date - b.date);
      } else if (selectedMuscleGroupId) {
         const relevantExerciseIds = exercises.filter(ex => ex.muscleGroupIds.includes(selectedMuscleGroupId)).map(ex => ex.id);
         return trainingSessions
            .filter(session => session.exercises.some(ex => relevantExerciseIds.includes(ex.exerciseId)))
            .flatMap(session =>
               session.exercises
                  .filter(ex => relevantExerciseIds.includes(ex.exerciseId))
                  .map(ex => ({
                     date: new Date(session.date).getTime(),
                     weight: ex.weight,
                     volume: ex.weight * ex.reps * ex.times,
                     reps: ex.reps,
                     times: ex.times,
                  })),
            )
            .sort((a, b) => a.date - b.date);
      }
      return [];
   }, [trainingSessions, selectedExerciseId, selectedMuscleGroupId, exercises]);

   // Weight data points for the main chart
   const weightDataPoints = useMemo(() => sessionData.map(d => ({x: d.date, y: d.weight})), [sessionData]);

   // Volume data points
   const volumeDataPoints = useMemo(() => sessionData.map(d => ({x: d.date, y: d.volume})), [sessionData]);

   // PR (Personal Record) tracking
   const prDataPoints = useMemo(() => {
      let maxWeight = 0;
      return sessionData
         .map(d => {
            if (d.weight > maxWeight) {
               maxWeight = d.weight;
               return {x: d.date, y: d.weight};
            }
            return null; // Only mark PRs
         })
         .filter((d): d is DataPoint => d !== null);
   }, [sessionData]);

   // Calculate average slope for forecast (weight change per day)
   const calculateAverageSlope = (points: DataPoint[]): number => {
      if (points.length < 2) return 0;

      const slopes = points.slice(1).map((point, index) => {
         const prevPoint = points[index];
         const timeDiff = (point.x - prevPoint.x) / (1000 * 60 * 60 * 24); // Days
         if (timeDiff <= 0) return 0;
         return (point.y - prevPoint.y) / timeDiff;
      });

      return slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
   };

   // Generate forecast for weight based on selected period
   const weightForecastPoints = useMemo(() => {
      if (weightDataPoints.length === 0) return [];

      const lastPoint = weightDataPoints[weightDataPoints.length - 1];
      const slope = calculateAverageSlope(weightDataPoints);
      const forecast: DataPoint[] = [];

      // Start forecast from the last real data point
      forecast.push({x: lastPoint.x, y: lastPoint.y});

      // Generate forecast for the selected number of months
      for (let i = 1; i <= forecastPeriod; i++) {
         const newDate = addMonths(new Date(lastPoint.x), i);
         const daysDiff = (newDate.getTime() - lastPoint.x) / (1000 * 60 * 60 * 24);
         const newY = lastPoint.y + slope * daysDiff;
         forecast.push({x: newDate.getTime(), y: Math.max(0, newY)}); // Ensure weight doesn't go negative
      }

      return forecast;
   }, [weightDataPoints, forecastPeriod]);

   // Combine actual weight data and forecast (remove duplication of last point)
   const combinedWeightData = useMemo(() => {
      // Only include forecast points starting after the last real point
      const forecastWithoutLastReal = weightForecastPoints.slice(1); // Exclude the duplicated last real point
      return [...weightDataPoints, ...forecastWithoutLastReal];
   }, [weightDataPoints, weightForecastPoints]);

   const lastRealDataX = weightDataPoints.length > 0 ? weightDataPoints[weightDataPoints.length - 1].x : undefined;

   // Muscle Group Focus (Volume distribution)
   const muscleGroupVolume = useMemo(() => {
      if (selectedExerciseId) {
         const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
         if (!selectedExercise) return [];
         const totalVolume = sessionData.reduce((sum, d) => sum + d.volume, 0);
         return selectedExercise.muscleGroupIds.map(mgId => {
            const muscleGroup = muscleGroups.find(mg => mg.id === mgId);
            const volume = totalVolume / selectedExercise.muscleGroupIds.length; // Evenly distribute volume
            return {id: mgId, label: muscleGroup?.name || 'Unknown', value: volume};
         });
      } else if (selectedMuscleGroupId) {
         const relevantExerciseIds = exercises.filter(ex => ex.muscleGroupIds.includes(selectedMuscleGroupId)).map(ex => ex.id);
         const totalVolume = sessionData.reduce((sum, d) => sum + d.volume, 0);
         return [{id: selectedMuscleGroupId, label: muscleGroups.find(mg => mg.id === selectedMuscleGroupId)?.name || 'Unknown', value: totalVolume}];
      }
      return [];
   }, [sessionData, selectedExerciseId, selectedMuscleGroupId, exercises, muscleGroups]);

   // Get title based on selection
   const title = selectedExerciseId
      ? `Exercise Development: ${exercises.find(ex => ex.id === selectedExerciseId)?.name || 'Select an Exercise'}`
      : selectedMuscleGroupId
        ? `Muscle Group Development: ${muscleGroups.find(mg => mg.id === selectedMuscleGroupId)?.name || 'Select a Muscle Group'}`
        : 'Exercise/Muscle Group Development';

   return (
      <Paper sx={{padding: 2, margin: 'auto', maxWidth: 1200}}>
         <Typography variant='h4' gutterBottom>
            {title}
         </Typography>

         <Grid container spacing={2} sx={{mb: 2}}>
            <Grid item>
               <FormControl sx={{minWidth: 200}}>
                  <InputLabel id='exercise-select-label'>Select Exercise</InputLabel>
                  <Select labelId='exercise-select-label' value={selectedExerciseId} label='Select Exercise' onChange={handleExerciseChange}>
                     <MenuItem value=''>
                        <em>Select an exercise</em>
                     </MenuItem>
                     {exercises.map(exercise => (
                        <MenuItem key={exercise.id} value={exercise.id}>
                           {exercise.name}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Grid>
            <Grid item>
               <FormControl sx={{minWidth: 200}}>
                  <InputLabel id='muscle-group-select-label'>Select Muscle Group</InputLabel>
                  <Select labelId='muscle-group-select-label' value={selectedMuscleGroupId} label='Select Muscle Group' onChange={handleMuscleGroupChange}>
                     <MenuItem value=''>
                        <em>Select a muscle group</em>
                     </MenuItem>
                     {muscleGroups.map(muscleGroup => (
                        <MenuItem key={muscleGroup.id} value={muscleGroup.id}>
                           {muscleGroup.name}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Grid>
            <Grid item>
               <FormControl sx={{minWidth: 200}}>
                  <InputLabel id='forecast-period-label'>Forecast Period</InputLabel>
                  <Select labelId='forecast-period-label' value={forecastPeriod} label='Forecast Period' onChange={handleForecastPeriodChange}>
                     <MenuItem value={1}>1 Month</MenuItem>
                     <MenuItem value={2}>2 Months</MenuItem>
                     <MenuItem value={3}>3 Months</MenuItem>
                     <MenuItem value={6}>6 Months</MenuItem>
                     <MenuItem value={12}>12 Months</MenuItem>
                  </Select>
               </FormControl>
            </Grid>
         </Grid>

         {(selectedExerciseId || selectedMuscleGroupId) && sessionData.length > 0 ? (
            <Grid container spacing={3}>
               {/* Weight Progression with PRs and Forecast */}
               <Grid item xs={12}>
                  <Typography variant='h6'>Weight Progression & PRs</Typography>
                  <LineChart
                     series={[
                        {
                           data: combinedWeightData.map(d => d.y),
                           label: 'Weight (kg)',
                           color: '#1976d2',
                           showMark: false,
                        },
                        {
                           data: prDataPoints.map(d => d.y),
                           label: 'Personal Records',
                           color: '#ff9800',
                           showMark: true,
                           area: false,
                        },
                     ]}
                     xAxis={[
                        {
                           data: combinedWeightData.map(d => d.x),
                           label: 'Date',
                           scaleType: 'time',
                           valueFormatter: (value: number) => new Date(value).toISOString().split('T')[0],
                        },
                     ]}
                     height={400}
                     width={1000}
                     grid={{vertical: true, horizontal: true}}
                     slots={{line: CustomAnimatedLine}}
                     slotProps={{
                        line: {limit: lastRealDataX} as CustomLineSlotProps,
                     }}
                     sx={{
                        '& .line-after path': {
                           strokeDasharray: '10 5', // Dashed line for forecast
                           stroke: '#f50057', // Red for forecast
                        },
                        '& .line-before path': {
                           stroke: '#1976d2', // Blue for actual data
                        },
                     }}
                  />
                  <Typography variant='body2' sx={{mt: 1}}>
                     Blue: Weight over time (solid = actual, dashed = {forecastPeriod}-month forecast). Orange: PR milestones.
                  </Typography>
               </Grid>

               {/* Total Volume Lifted */}
               <Grid item xs={12} md={6}>
                  <Typography variant='h6'>Total Volume Lifted</Typography>
                  <LineChart
                     series={[
                        {
                           data: volumeDataPoints.map(d => d.y),
                           label: 'Volume (kg * reps * sets)',
                           color: '#4caf50',
                           area: true,
                        },
                     ]}
                     xAxis={[
                        {
                           data: volumeDataPoints.map(d => d.x),
                           label: 'Date',
                           scaleType: 'time',
                           valueFormatter: (value: number) => new Date(value).toISOString().split('T')[0],
                        },
                     ]}
                     height={300}
                     width={500}
                     grid={{horizontal: true}}
                  />
                  <Typography variant='body2' sx={{mt: 1}}>
                     Green area shows cumulative lifting volume over time.
                  </Typography>
               </Grid>

               {/* Muscle Group Focus */}
               <Grid item xs={12} md={6}>
                  <Typography variant='h6'>Muscle Group Focus</Typography>
                  <PieChart series={[{data: muscleGroupVolume}]} height={300} width={500} />
                  <Typography variant='body2' sx={{mt: 1}}>
                     {selectedExerciseId ? 'Distribution of volume across muscle groups targeted by this exercise.' : 'Total volume for the selected muscle group.'}
                  </Typography>
               </Grid>
            </Grid>
         ) : (
            <Typography variant='body1'>{selectedExerciseId || selectedMuscleGroupId ? 'No training data available for this selection.' : 'Please select an exercise or muscle group to view its development.'}</Typography>
         )}
      </Paper>
   );
};

export default ExerciseDevelopment;
