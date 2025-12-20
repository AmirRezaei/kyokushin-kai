// File: ./src/app/Equipment/Stats.tsx
import { Box, Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import React, { useContext, useMemo } from 'react';

import { ExerciseContext } from './contexts/ExerciseContext';
import { MuscleGroupContext } from './contexts/MuscleGroupContext';
import { GymSessionContext } from './contexts/GymSessionContext';

import ContributionCalendar from '../../components/UI/ContributionCalendar';
import { Contribution } from '../../types/contribution';

const Stats: React.FC = () => {
  const { gymSessions } = useContext(GymSessionContext);

  const { exercises } = useContext(ExerciseContext);
  const { muscleGroups } = useContext(MuscleGroupContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Convert training sessions to contributions
  const contributions: Contribution[] = useMemo(() => {
    return gymSessions.map((session) => ({
      date: session.date,
      id: session.id,
      category: session.workoutPlanId || 'general', // Use workoutPlanId as category if available
    }));
  }, [gymSessions]);

  // Total Volume per Exercise
  const volumeData = exercises.map((ex) => {
    const volume = gymSessions
      .flatMap((s) => s.exercises)

      .filter((se) => se.exerciseId === ex.id)
      .reduce((sum, se) => sum + se.weight * se.reps * se.times, 0);
    return { id: ex.id, label: ex.name, value: volume };
  });

  // Muscle Group Distribution with "Others" category
  const muscleGroupVolume = useMemo(() => {
    const allMuscleGroups = muscleGroups.map((mg) => {
      const volume = gymSessions
        .flatMap((s) => s.exercises)

        .filter((se) =>
          exercises.find((e) => e.id === se.exerciseId)?.muscleGroupIds.includes(mg.id),
        )
        .reduce((sum, se) => sum + se.weight * se.reps * se.times, 0);
      return { id: mg.id, label: mg.name, value: volume };
    });

    const sorted = [...allMuscleGroups].sort((a, b) => b.value - a.value);
    const topN = 5;
    const topMuscleGroups = sorted.slice(0, topN);
    const othersVolume = sorted.slice(topN).reduce((sum, mg) => sum + mg.value, 0);

    if (othersVolume > 0) {
      return [...topMuscleGroups, { id: 'others', label: 'Others', value: othersVolume }];
    }
    return topMuscleGroups;
  }, [gymSessions, exercises, muscleGroups]);

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 1200,
        mx: 'auto',
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(255, 255, 255, 0.1)' : 3,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 'bold',
          color: theme.palette.text.primary,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        Training Statistics
      </Typography>
      <Grid container spacing={3}>
        {/* Total Volume by Exercise */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Total Volume by Exercise
          </Typography>
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <BarChart
              xAxis={[
                {
                  scaleType: 'band',
                  data: volumeData.map((d) => d.label),
                  tickLabelStyle: {
                    angle: isMobile ? 0 : 45,
                    textAnchor: isMobile ? 'middle' : 'start',
                    fontSize: isMobile ? 10 : 12,
                  },
                },
              ]}
              series={[
                {
                  data: volumeData.map((d) => d.value),
                  label: 'Volume (kg)',
                  color: theme.palette.primary.main,
                },
              ]}
              height={isMobile ? 250 : 300}
              margin={{ bottom: isMobile ? 40 : 60 }}
              grid={{ horizontal: true }}
              sx={{
                '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary },
                '& .MuiChartsAxis-line': { stroke: theme.palette.divider },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            Total lifting volume (weight × reps × sets) for each exercise.
          </Typography>
        </Grid>

        {/* Muscle Group Distribution */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Muscle Group Distribution
          </Typography>
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <PieChart
              series={[
                {
                  data: muscleGroupVolume,
                  innerRadius: 30,
                  outerRadius: isMobile ? 80 : 100,
                  paddingAngle: 2,
                  cornerRadius: 5,
                },
              ]}
              height={isMobile ? 250 : 300}
              slotProps={{
                legend: {
                  direction: isMobile ? 'column' : 'row',
                  position: { vertical: 'bottom', horizontal: isMobile ? 'left' : 'middle' },
                  padding: isMobile
                    ? { top: 10, bottom: 0, left: 0, right: 0 }
                    : { top: 20, bottom: 0, left: 0, right: 0 },
                  itemMarkWidth: 20,
                  itemMarkHeight: 2,
                  markGap: 5,
                  itemGap: isMobile ? 5 : 10,
                },
              }}
              margin={{ bottom: isMobile ? 40 : 60 }}
              sx={{
                '& .MuiChartsLegend-mark': { fill: theme.palette.text.primary },
                '& .MuiChartsLegend-label': { fill: theme.palette.text.secondary },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            Distribution of total volume across targeted muscle groups (top 5 shown, rest grouped as
            "Others").
          </Typography>
        </Grid>

        {/* Contribution Calendar */}
        <Grid item xs={12}>
          <ContributionCalendar
            contributions={contributions}
            year={new Date().getFullYear()}
            weekStartDay={1}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Stats;
