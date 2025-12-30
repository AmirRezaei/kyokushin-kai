import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';

import { useAuth } from '../../components/context/AuthContext';
import { EquipmentCategoryProvider } from './contexts/EquipmentCategoryContext';
import { EquipmentProvider } from './contexts/EquipmentContext';
import { ExerciseProvider } from './contexts/ExerciseContext';
import { GymSessionProvider } from './contexts/GymSessionContext';
import { MuscleGroupProvider } from './contexts/MuscleGroupContext';
import { TrainingSetProvider } from './contexts/TrainingSetContext';
import { WorkoutPlanProvider } from './contexts/WorkoutPlanContext';

import DataManager from './DataManager';
import EquipmentCategoryManager from './EquipmentCategoryManager';
import EquipmentLibrary from './EquipmentLibrary';
import ExerciseManager from './ExerciseManager';
import GymSessionManager from './GymSessionManager';
import MuscleGroupManager from './MuscleGroupManager';
import Progress from './Progress';
import Stats from './Stats';
import WorkoutPlans from './WorkoutPlans';

const TrainingManagerPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const [mainTabValue, setMainTabValue] = useState('session'); // Main tab state
  const [subTabValue, setSubTabValue] = useState('workout-plans'); // Sub-tab state for Management section

  const handleMainTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setMainTabValue(newValue);
    if (newValue !== 'management') setSubTabValue('workout-plans'); // Reset sub-tab when not on Management
  };

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSubTabValue(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Training Manager
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please log in to access your personalized training data.
        </Typography>
        <Button variant="contained" onClick={() => login()}>
          Log In
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <MuscleGroupProvider>
        <EquipmentCategoryProvider>
          <EquipmentProvider>
            <ExerciseProvider>
              <GymSessionProvider>
                <TrainingSetProvider>
                  <WorkoutPlanProvider>
                    {/* Main Tabs */}
                    <Tabs
                      variant="scrollable"
                      value={mainTabValue}
                      onChange={handleMainTabChange}
                      indicatorColor="primary"
                      textColor="primary"
                      sx={{ mb: 2 }}
                    >
                      <Tab value="session" label="Session" />
                      <Tab value="progress" label="Progress" />
                      <Tab value="stats" label="Stats" />
                      <Tab value="management" label="Management" />
                    </Tabs>

                    {/* Main Tab Content */}
                    {mainTabValue === 'session' && <GymSessionManager />}
                    {mainTabValue === 'progress' && <Progress />}
                    {mainTabValue === 'stats' && <Stats />}
                    {mainTabValue === 'management' && (
                      <Box>
                        {/* Sub-Tabs for Management */}
                        <Tabs
                          variant="scrollable"
                          value={subTabValue}
                          onChange={handleSubTabChange}
                          indicatorColor="secondary"
                          textColor="secondary"
                          sx={{ mb: 2 }}
                        >
                          <Tab value="workout-plans" label="Workout Plans" />
                          <Tab value="exercise-manager" label="Exercise Manager" />
                          <Tab value="equipment-library" label="Equipment Library" />
                          <Tab value="equipment-categories" label="Equipment Categories" />
                          <Tab value="muscle-groups" label="Muscle Groups" />
                          <Tab value="data-manager" label="Data Manager" />
                        </Tabs>

                        {/* Sub-Tab Content */}
                        {subTabValue === 'workout-plans' && <WorkoutPlans />}
                        {subTabValue === 'exercise-manager' && <ExerciseManager />}
                        {subTabValue === 'equipment-library' && <EquipmentLibrary />}
                        {subTabValue === 'equipment-categories' && <EquipmentCategoryManager />}
                        {subTabValue === 'muscle-groups' && <MuscleGroupManager />}
                        {subTabValue === 'data-manager' && <DataManager />}
                      </Box>
                    )}
                  </WorkoutPlanProvider>
                </TrainingSetProvider>
              </GymSessionProvider>
            </ExerciseProvider>
          </EquipmentProvider>
        </EquipmentCategoryProvider>
      </MuscleGroupProvider>
    </Box>
  );
};

export default TrainingManagerPage;
