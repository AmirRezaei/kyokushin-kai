// File: ./src/app/Equipment/Stats.tsx
import {Box, Grid, Paper, Typography, useTheme} from '@mui/material';
import {BarChart, PieChart} from '@mui/x-charts';
import React, {useContext, useMemo} from 'react';

import {ExerciseContext} from './contexts/ExerciseContext';
import {MuscleGroupContext} from './contexts/MuscleGroupContext';
import {TrainingSessionContext} from './contexts/TrainingSessionContext';
import ContributionCalendar from './ContributionCalendar';
import {Contribution} from './types';

const Stats: React.FC = () => {
   const {trainingSessions} = useContext(TrainingSessionContext);
   const {exercises} = useContext(ExerciseContext);
   const {muscleGroups} = useContext(MuscleGroupContext);
   const theme = useTheme();

   // Convert training sessions to contributions
   const contributions: Contribution[] = useMemo(() => {
      return trainingSessions.map(session => ({
         date: session.date,
         id: session.id,
         category: session.workoutPlanId || 'general', // Use workoutPlanId as category if available
      }));
   }, [trainingSessions]);

   // Total Volume per Exercise
   const volumeData = exercises.map(ex => {
      const volume = trainingSessions
         .flatMap(s => s.exercises)
         .filter(se => se.exerciseId === ex.id)
         .reduce((sum, se) => sum + se.weight * se.reps * se.times, 0);
      return {id: ex.id, label: ex.name, value: volume};
   });

   // Muscle Group Distribution with "Others" category
   const muscleGroupVolume = useMemo(() => {
      const allMuscleGroups = muscleGroups.map(mg => {
         const volume = trainingSessions
            .flatMap(s => s.exercises)
            .filter(se => exercises.find(e => e.id === se.exerciseId)?.muscleGroupIds.includes(mg.id))
            .reduce((sum, se) => sum + se.weight * se.reps * se.times, 0);
         return {id: mg.id, label: mg.name, value: volume};
      });

      const sorted = [...allMuscleGroups].sort((a, b) => b.value - a.value);
      const topN = 5;
      const topMuscleGroups = sorted.slice(0, topN);
      const othersVolume = sorted.slice(topN).reduce((sum, mg) => sum + mg.value, 0);

      if (othersVolume > 0) {
         return [...topMuscleGroups, {id: 'others', label: 'Others', value: othersVolume}];
      }
      return topMuscleGroups;
   }, [trainingSessions, exercises, muscleGroups]);

   // Workout Frequency (Sessions per Month)
   const frequencyData = useMemo(() => {
      const monthlySessions = trainingSessions.reduce(
         (acc, s) => {
            const month = new Date(s.date).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + 1;
            return acc;
         },
         {} as Record<string, number>,
      );
      return Object.entries(monthlySessions)
         .map(([month, count]) => ({month, count}))
         .sort((a, b) => a.month.localeCompare(b.month));
   }, [trainingSessions]);

   return (
      <Paper
         sx={{
            p: {xs: 2, sm: 3},
            maxWidth: 1200,
            mx: 'auto',
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(255, 255, 255, 0.1)' : 3,
         }}>
         <Typography
            variant='h4'
            gutterBottom
            sx={{
               mb: 3,
               fontWeight: 'bold',
               color: theme.palette.text.primary,
               textAlign: {xs: 'center', sm: 'left'},
            }}>
            Training Statistics
         </Typography>
         <Grid container spacing={3}>
            {/* Total Volume by Exercise */}
            <Grid item xs={12} sm={6}>
               <Typography variant='h6' sx={{color: theme.palette.text.primary, mb: 1}}>
                  Total Volume by Exercise
               </Typography>
               <Box sx={{width: '100%', overflow: 'hidden'}}>
                  <BarChart
                     xAxis={[
                        {
                           scaleType: 'band',
                           data: volumeData.map(d => d.label),
                           tickLabelStyle: {angle: 45, textAnchor: 'start', fontSize: 12},
                        },
                     ]}
                     series={[
                        {
                           data: volumeData.map(d => d.value),
                           label: 'Volume (kg)',
                           color: theme.palette.primary.main,
                        },
                     ]}
                     height={300}
                     margin={{bottom: 60}}
                     grid={{horizontal: true}}
                     sx={{
                        '& .MuiChartsAxis-tickLabel': {fill: theme.palette.text.secondary},
                        '& .MuiChartsAxis-line': {stroke: theme.palette.divider},
                     }}
                  />
               </Box>
               <Typography variant='body2' sx={{mt: 1, color: theme.palette.text.secondary}}>
                  Total lifting volume (weight × reps × sets) for each exercise.
               </Typography>
            </Grid>

            {/* Muscle Group Distribution */}
            <Grid item xs={12} sm={6}>
               <Typography variant='h6' sx={{color: theme.palette.text.primary, mb: 1}}>
                  Muscle Group Distribution
               </Typography>
               <Box sx={{width: '100%', overflow: 'hidden'}}>
                  <PieChart
                     series={[
                        {
                           data: muscleGroupVolume,
                           innerRadius: 30,
                           outerRadius: 100,
                           paddingAngle: 2,
                           cornerRadius: 5,
                        },
                     ]}
                     height={300}
                     slotProps={{
                        legend: {
                           direction: 'row',
                           position: {vertical: 'bottom', horizontal: 'middle'},
                           padding: {top: 20, bottom: 0, left: 0, right: 0},
                           itemMarkWidth: 20,
                           itemMarkHeight: 2,
                           markGap: 5,
                           itemGap: 10,
                        },
                     }}
                     margin={{bottom: 60}}
                     sx={{
                        '& .MuiChartsLegend-mark': {fill: theme.palette.text.primary},
                        '& .MuiChartsLegend-label': {fill: theme.palette.text.secondary},
                     }}
                  />
               </Box>
               <Typography variant='body2' sx={{mt: 1, color: theme.palette.text.secondary}}>
                  Distribution of total volume across targeted muscle groups (top 5 shown, rest grouped as "Others").
               </Typography>
            </Grid>

            {/* Contribution Calendar */}
            <Grid item xs={12}>
               <ContributionCalendar contributions={contributions} year={new Date().getFullYear()} weekStartDay={1} />
            </Grid>
         </Grid>
      </Paper>
   );
};

export default Stats;
