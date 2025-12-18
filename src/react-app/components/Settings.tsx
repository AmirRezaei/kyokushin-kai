// File: ./src/components/Settings.tsx

// HEADER-START
// * Path: ./src/components/Settings.tsx
// HEADER-END

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   Grid2,
   IconButton,
   InputLabel,
   List,
   ListItem,
   ListItemSecondaryAction,
   ListItemText,
   MenuItem,
   Paper,
   Select,
   TextField,
   Typography,
} from '@mui/material';
import React, {useCallback, useMemo, useState} from 'react';

// import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils'; // Removed as we use SettingsManager

// import {gradeData} from '@/data/gradeData'; // Removed
// import {Grade} from '@/data/Grade'; // Removed
import { KyokushinRepository } from '../../data/repo/KyokushinRepository';
import { getBeltColorHex, getFormattedGradeName, getStripeNumber } from '../../data/repo/gradeHelpers';


import {SettingsManager} from '@/helper/SettingsManager';
import type {GradeHistoryEntry} from '@/types/settings';

import {exportLocalStorageDataAsJSON, importLocalStorageDataFromJSON} from './ImportExportLocalStorage';
import CustomDivider from './UI/CustomDivider';
import DarkModeToggle from './UI/DarkModeToggle';
import ThemeManager from './UI/DraggableList/ThemeManager';
import KarateBelt from './UI/KarateBelt';
import PersistentSwitch from './UI/PersistentSwitch';

const Settings: React.FC = () => {
   const [history, setHistory] = useState<GradeHistoryEntry[]>(() => SettingsManager.getGradeHistory());
   const [openAddDialog, setOpenAddDialog] = useState(false);
   const [newGradeDate, setNewGradeDate] = useState(new Date().toISOString().split('T')[0]);
   const [newGradeId, setNewGradeId] = useState('1');
   const [trainedDaysInput, setTrainedDaysInput] = useState<string>(() => SettingsManager.getTrainedDays().toString());


   // Initialize data
   const grades = useMemo(() => KyokushinRepository.getCurriculumGrades(), []);


   // Derived current grade
   const currentGradeId = useMemo(() => {
       if (history.length > 0) return history[0].gradeId;
       // Fallback to legacy or default
       return localStorage.getItem('user.selectedGrade') || '1';
   }, [history]);

    // Find the current grade object
   const currentGradeObj = useMemo(() => {
       return grades.find(g => g.id === currentGradeId);
   }, [currentGradeId, grades]);

   const handleAddGrade = () => {
       SettingsManager.addGradeHistoryEntry(newGradeDate, newGradeId);
       setHistory(SettingsManager.getGradeHistory());
       setOpenAddDialog(false);
   };

   const handleDeleteGrade = (index: number) => {
       SettingsManager.removeGradeHistoryEntry(index);
       setHistory(SettingsManager.getGradeHistory());
   };


   // Handler for setting trained days
   const handleSetTrainedDays = useCallback(() => {
      const days = parseInt(trainedDaysInput, 10);
      if (!isNaN(days) && days >= 0) {
         SettingsManager.setTrainedDays(days, {lastTrainingDate: null});
      } else {
         alert('Please enter a valid number of days.');
      }
   }, [trainedDaysInput]);


   // File input change handler
   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         importLocalStorageDataFromJSON(file);
      }
   };

   const sortedHistory = useMemo(() => {
      return [...history].sort((a, b) => {
         const indexA = grades.findIndex(g => g.id === a.gradeId);
         const indexB = grades.findIndex(g => g.id === b.gradeId);
         return indexB - indexA;
      });
   }, [history, grades]);

   return (
      <Paper
         elevation={3}
         sx={{
            margin: 0,
            width: '100%',
            padding: {xs: 2, sm: 4},
         }}>
         <Typography variant='h5' gutterBottom>
            Settings
         </Typography>
         {/* Theme Settings */}
         <CustomDivider bold textAlign='start'>
            Theme
         </CustomDivider>
         <Grid2 container spacing={2} alignItems='center'>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Theme Mode</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <DarkModeToggle />
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Theme</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <ThemeManager />
            </Grid2>
         </Grid2>
         {/* User Settings */}
         <CustomDivider bold textAlign='start'>
            User Grade History
         </CustomDivider>
         <Grid2 container spacing={2} alignItems='center'>
            <Grid2 size={{xs: 12}}>
               <Box display='flex' alignItems='center' justifyContent='space-between' mb={1}>
                  <Box display='flex' alignItems='center'>
                      <Typography variant="subtitle1" mr={2}>Current Grade:</Typography>
                      {currentGradeObj && (
                          <Box display='flex' alignItems='center'>
                              <KarateBelt
                                 sx={{
                                    width: {xs: '2em', sm: '2.5em'},
                                    height: {xs: '1em', sm: '1.0em'},
                                    mr: 1,
                                 }}
                                 color={getBeltColorHex(currentGradeObj.beltColor)}
                                 thickness={5}
                                 stripes={getStripeNumber(currentGradeObj)}
                                 borderRadius='10%'
                              />
                              <Typography>{getFormattedGradeName(currentGradeObj)}</Typography>
                          </Box>
                      )}
                  </Box>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenAddDialog(true)}>
                      Add Grade
                  </Button>
               </Box>

               <List dense>
                   {sortedHistory.map((entry, index) => {
                       const grade = grades.find(g => g.id === entry.gradeId);
                       if (!grade) return null;
                       return (
                           <ListItem key={index} divider>
                               <Box display='flex' alignItems='center' mr={2}>
                                   <KarateBelt
                                     sx={{
                                        width: '2em',
                                        height: '1em',
                                     }}
                                     color={getBeltColorHex(grade.beltColor)}
                                     thickness={4}
                                     stripes={getStripeNumber(grade)}
                                     borderRadius='10%'
                                  />
                               </Box>
                               <ListItemText
                                   primary={getFormattedGradeName(grade)}
                                   secondary={`Registered: ${entry.date}`}
                               />
                               <ListItemSecondaryAction>
                                   <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGrade(index)}>
                                       <DeleteIcon />
                                   </IconButton>
                               </ListItemSecondaryAction>
                           </ListItem>
                       );
                   })}
                   {history.length === 0 && (
                       <Typography variant="body2" color="textSecondary" align="center">
                           No grade history recorded.
                       </Typography>
                   )}
               </List>
            </Grid2>
         </Grid2>

         {/* Add Grade Dialog */}
         <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
             <DialogTitle>Register Grade</DialogTitle>
             <DialogContent>
                 <Box display="flex" flexDirection="column" gap={2} mt={1} minWidth={{sm: 300}}>
                     <TextField
                         label="Date"
                         type="date"
                         value={newGradeDate}
                         onChange={(e) => setNewGradeDate(e.target.value)}
                         fullWidth
                         InputLabelProps={{ shrink: true }}
                     />
                     <FormControl variant='outlined' fullWidth>
                        <InputLabel id='new-grade-select-label'>Grade</InputLabel>
                        <Select
                            labelId='new-grade-select-label'
                            value={newGradeId}
                            onChange={(e) => setNewGradeId(e.target.value)}
                            label='Grade'
                        >
                           {grades
                              .filter(grade => !history.some(h => h.gradeId === grade.id))
                              .map((grade) => (
                              <MenuItem key={grade.id} value={grade.id}>
                                 <Box display='flex' alignItems='center'>
                                    <KarateBelt
                                       sx={{
                                          width: '2em',
                                          height: '1em',
                                          mr: 2,
                                       }}
                                       color={getBeltColorHex(grade.beltColor)}
                                       thickness={5}
                                       stripes={getStripeNumber(grade)}
                                       borderRadius='10%'
                                    />
                                    {getFormattedGradeName(grade)}
                                 </Box>
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                 </Box>
             </DialogContent>
             <DialogActions>
                 <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                 <Button onClick={handleAddGrade} variant="contained">Add</Button>
             </DialogActions>
         </Dialog>


         {/* Training Tracker Settings */}
         <CustomDivider bold textAlign='start'>
            Training Tracker
         </CustomDivider>
         <Grid2 container spacing={2} alignItems='center'>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Set Trained Days</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Box display='flex' gap={1}>
                  <TextField type='number' value={trainedDaysInput} onChange={e => setTrainedDaysInput(e.target.value)} inputProps={{min: 0}} size='small' fullWidth />
                  <Button variant='contained' onClick={handleSetTrainedDays}>
                     Set
                  </Button>
               </Box>
            </Grid2>
         </Grid2>

         {/* Combination Settings */}
         <CustomDivider bold textAlign='start'>
            Skip confirmation
         </CustomDivider>
         <Grid2 container spacing={2} alignItems='center'>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Combination techniques</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <PersistentSwitch label='' storageKey='skipDeleteConfirmForComboItems' />
            </Grid2>
         </Grid2>
         <Grid2 container spacing={2} alignItems='center'>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Combinations</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <PersistentSwitch label='' storageKey='skipDeleteConfirmForCombo' />
            </Grid2>
         </Grid2>

         {/* Tools */}
         <CustomDivider bold textAlign='start'>
            Tools
         </CustomDivider>
         <Grid2 container spacing={2}>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Export settings</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Button variant='contained' color='primary' startIcon={<UploadIcon />} onClick={exportLocalStorageDataAsJSON}>
                  Export
               </Button>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Typography>Import settings</Typography>
            </Grid2>
            <Grid2 size={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
               <Button variant='contained' component='label' color='secondary' startIcon={<DownloadIcon />}>
                  Import
                  <input type='file' accept='application/json' hidden onChange={handleFileChange} />
               </Button>
            </Grid2>
         </Grid2>
      </Paper>
   );
};

export default React.memo(Settings);
