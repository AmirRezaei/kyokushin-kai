// File: ./src/app/Equipment/DataManager.tsx

import {Alert, Box, Button, Paper, Typography} from '@mui/material';
import React, {useContext} from 'react';

import {EquipmentContext} from './contexts/EquipmentContext';
import {ExerciseContext} from './contexts/ExerciseContext';
import {MuscleGroupContext} from './contexts/MuscleGroupContext';
import {TrainingSessionContext} from './contexts/TrainingSessionContext';
import {TrainingSetContext} from './contexts/TrainingSetContext';
import {WorkoutPlanContext} from './contexts/WorkoutPlanContext';

const DataManager: React.FC = () => {
   const {equipments, setEquipments} = useContext(EquipmentContext);
   const {exercises, setExercises} = useContext(ExerciseContext);
   const {muscleGroups, setMuscleGroups} = useContext(MuscleGroupContext);
   const {trainingSessions, setTrainingSessions} = useContext(TrainingSessionContext);
   const {trainingSets, setTrainingSets} = useContext(TrainingSetContext);
   const {plans, setPlans} = useContext(WorkoutPlanContext);

   // Handle data export
   const handleExport = () => {
      const data = {
         equipments,
         exercises,
         muscleGroups,
         trainingSessions,
         trainingSets,
         plans, // Include workout plans
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workout_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   };

   // Handle data import
   const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
         try {
            const importedData = JSON.parse(e.target?.result as string);

            // Validate and set data
            if (importedData.equipments && Array.isArray(importedData.equipments)) {
               setEquipments(importedData.equipments);
               localStorage.setItem('equipments', JSON.stringify(importedData.equipments));
            }
            if (importedData.exercises && Array.isArray(importedData.exercises)) {
               setExercises(importedData.exercises);
               localStorage.setItem('exercises', JSON.stringify(importedData.exercises));
            }
            if (importedData.muscleGroups && Array.isArray(importedData.muscleGroups)) {
               setMuscleGroups(importedData.muscleGroups);
               localStorage.setItem('muscleGroups', JSON.stringify(importedData.muscleGroups));
            }
            if (importedData.trainingSessions && Array.isArray(importedData.trainingSessions)) {
               setTrainingSessions(importedData.trainingSessions);
               localStorage.setItem('trainingSessions', JSON.stringify(importedData.trainingSessions));
            }
            if (importedData.trainingSets && Array.isArray(importedData.trainingSets)) {
               setTrainingSets(importedData.trainingSets);
               localStorage.setItem('trainingSets', JSON.stringify(importedData.trainingSets));
            }
            if (importedData.plans && Array.isArray(importedData.plans)) {
               // Import workout plans
               setPlans(importedData.plans);
               localStorage.setItem('workoutPlans', JSON.stringify(importedData.plans));
            }

            alert('Data imported successfully!');
         } catch (error) {
            alert('Error importing data: Invalid JSON file');
         }
      };
      reader.readAsText(file);

      // Reset input value to allow re-importing same file
      event.target.value = '';
   };

   return (
      <Paper sx={{padding: 2, margin: 'auto', maxWidth: 800}}>
         <Typography variant='h4' gutterBottom>
            Data Manager
         </Typography>

         <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <Box>
               <Button variant='contained' color='primary' onClick={handleExport}>
                  Export Data as JSON
               </Button>
               <Typography variant='body2' sx={{mt: 1}}>
                  Exports all your workout data (equipment, exercises, muscle groups, sessions, sets, and plans) to a JSON file.
               </Typography>
            </Box>

            <Box>
               <Button variant='contained' color='secondary' component='label'>
                  Import Data from JSON
                  <input type='file' hidden accept='.json' onChange={handleImport} />
               </Button>
               <Typography variant='body2' sx={{mt: 1}}>
                  Import previously exported data. This will overwrite existing data.
               </Typography>
               <Alert severity='warning' sx={{mt: 1}}>
                  Warning: Importing will replace all current data. Make sure to export first if you want to keep your existing data.
               </Alert>
            </Box>
         </Box>
      </Paper>
   );
};

export default DataManager;
