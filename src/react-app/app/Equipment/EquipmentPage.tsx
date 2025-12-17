// File: ./src/app/Equipment/EquipmentPage.tsx
import {Box, Tab, Tabs} from '@mui/material';
import React, {useState} from 'react';

import {EquipmentProvider} from './contexts/EquipmentContext';
import {ExerciseProvider} from './contexts/ExerciseContext';
import {MuscleGroupProvider} from './contexts/MuscleGroupContext';
import {TrainingSessionProvider} from './contexts/TrainingSessionContext';
import {TrainingSetProvider} from './contexts/TrainingSetContext';
import {WorkoutPlanProvider} from './contexts/WorkoutPlanContext';
import DataManager from './DataManager';
import EquipmentLibrary from './EquipmentLibrary';
import ExerciseManager from './ExerciseManager';
import MuscleGroupManager from './MuscleGroupManager';
import Progress from './Progress';
import Stats from './Stats';
import TrainingSession from './TrainingSession';
import WorkoutPlans from './WorkoutPlans';

const EquipmentPage: React.FC = () => {
   const [mainTabValue, setMainTabValue] = useState(0); // Main tab state
   const [subTabValue, setSubTabValue] = useState(0); // Sub-tab state for Management section

   const handleMainTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setMainTabValue(newValue);
      if (newValue !== 1) setSubTabValue(0); // Reset sub-tab when not on Management
   };

   const handleSubTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setSubTabValue(newValue);
   };

   return (
      <Box>
         <MuscleGroupProvider>
            <EquipmentProvider>
               <ExerciseProvider>
                  <TrainingSetProvider>
                     <TrainingSessionProvider>
                        <WorkoutPlanProvider>
                           {/* Main Tabs */}
                           <Tabs variant='scrollable' value={mainTabValue} onChange={handleMainTabChange} indicatorColor='primary' textColor='primary' sx={{mb: 2}}>
                              <Tab label='Session' />
                              <Tab label='Progress' />
                              <Tab label='Stats' />
                              <Tab label='Management' />
                           </Tabs>

                           {/* Main Tab Content */}
                           {mainTabValue === 0 && <TrainingSession />}
                           {mainTabValue === 1 && <Progress />}
                           {mainTabValue === 2 && <Stats />}
                           {mainTabValue === 3 && (
                              <Box>
                                 {/* Sub-Tabs for Management */}
                                 <Tabs variant='scrollable' value={subTabValue} onChange={handleSubTabChange} indicatorColor='secondary' textColor='secondary' sx={{mb: 2}}>
                                    <Tab label='Workout Plans' />
                                    <Tab label='Exercise Manager' />
                                    <Tab label='Equipment Library' />
                                    <Tab label='Muscle Groups' />
                                    <Tab label='Data Manager' />
                                 </Tabs>

                                 {/* Sub-Tab Content */}
                                 {subTabValue === 0 && <WorkoutPlans />}
                                 {subTabValue === 1 && <ExerciseManager />}
                                 {subTabValue === 2 && <EquipmentLibrary />}
                                 {subTabValue === 3 && <MuscleGroupManager />}
                                 {subTabValue === 4 && <DataManager />}
                              </Box>
                           )}
                        </WorkoutPlanProvider>
                     </TrainingSessionProvider>
                  </TrainingSetProvider>
               </ExerciseProvider>
            </EquipmentProvider>
         </MuscleGroupProvider>
      </Box>
   );
};

export default EquipmentPage;