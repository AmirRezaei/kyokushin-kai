// File: ./src/app/Equipment/TrainingSession.tsx

import {Add, Delete, Edit, FileCopy} from '@mui/icons-material';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid, IconButton, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from '@mui/material';
import {format} from 'date-fns';
import React, {ChangeEvent, FormEvent, useContext, useMemo, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {ExerciseContext} from './contexts/ExerciseContext';
import {TrainingSessionContext} from './contexts/TrainingSessionContext';
import {WorkoutPlanContext} from './contexts/WorkoutPlanContext';
import {TrainingSession} from './types';

// Define the component's state interface
interface TrainingSessionState {
   openAddDialog: boolean;
   openEditDialog: boolean;
   openDeleteDialog: boolean;
   currentSession: Partial<TrainingSession>;
   editingSession: TrainingSession | null;
   deleteSessionId: string | null;
   errors: Record<string, string>;
}

const TrainingSessionManager: React.FC = () => {
   const {trainingSessions, addTrainingSession, updateTrainingSession, deleteTrainingSession} = useContext(TrainingSessionContext);
   const {exercises} = useContext(ExerciseContext);
   const {plans} = useContext(WorkoutPlanContext);

   const [state, setState] = useState<TrainingSessionState>({
      openAddDialog: false,
      openEditDialog: false,
      openDeleteDialog: false,
      currentSession: {},
      editingSession: null,
      deleteSessionId: null,
      errors: {},
   });

   // Extract unique dates from training sessions and sort them descending
   const recentDates = useMemo(() => {
      const uniqueDatesSet = new Set<string>();
      trainingSessions.forEach(session => {
         uniqueDatesSet.add(session.date);
      });
      const uniqueDates = Array.from(uniqueDatesSet);
      uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      return uniqueDates.slice(0, 10);
   }, [trainingSessions]);

   // Prepare a map for quick lookup: date -> exerciseId -> { weight, reps, times }
   const dataMap = useMemo(() => {
      const map: {[date: string]: {[exerciseId: string]: {weight: number; reps: number; times: number}[]}} = {};
      trainingSessions.forEach(session => {
         const date = session.date;
         if (!map[date]) {
            map[date] = {};
         }
         session.exercises.forEach(ex => {
            if (!map[date][ex.exerciseId]) {
               map[date][ex.exerciseId] = [];
            }
            map[date][ex.exerciseId].push({
               weight: ex.weight,
               reps: ex.reps,
               times: ex.times,
            });
         });
      });
      return map;
   }, [trainingSessions]);

   // Handlers to open dialogs
   const handleOpenAddDialog = () => {
      const lastSession = trainingSessions.slice(-1)[0];
      const preFilledExercises = exercises.map(ex => {
         const lastExercise = lastSession?.exercises.find(e => e.exerciseId === ex.id);
         return {
            exerciseId: ex.id,
            weight: lastExercise?.weight || 0,
            reps: lastExercise?.reps || 0,
            times: lastExercise?.times || 0,
         };
      });
      setState(prev => ({
         ...prev,
         openAddDialog: true,
         currentSession: {
            date: new Date().toISOString().split('T')[0],
            exercises: preFilledExercises,
         },
         errors: {},
      }));
   };

   const handleCloseAddDialog = () => {
      setState(prev => ({
         ...prev,
         openAddDialog: false,
         currentSession: {},
         errors: {},
      }));
   };

   const handleOpenEditDialog = (session: TrainingSession) => {
      setState(prev => ({
         ...prev,
         openEditDialog: true,
         editingSession: session,
         currentSession: {...session},
         errors: {},
      }));
   };

   const handleCloseEditDialog = () => {
      setState(prev => ({
         ...prev,
         openEditDialog: false,
         editingSession: null,
         currentSession: {},
         errors: {},
      }));
   };

   const handleOpenDeleteDialog = (sessionId: string) => {
      setState(prev => ({
         ...prev,
         openDeleteDialog: true,
         deleteSessionId: sessionId,
      }));
   };

   const handleCloseDeleteDialog = () => {
      setState(prev => ({
         ...prev,
         openDeleteDialog: false,
         deleteSessionId: null,
      }));
   };

   const handleDuplicateSession = (session: TrainingSession) => {
      const duplicatedSession = {
         ...session,
         id: uuidv4(), // New ID for the duplicated session
         date: new Date().toISOString().split('T')[0], // Set to current date
      };
      setState(prev => ({
         ...prev,
         openAddDialog: true,
         currentSession: duplicatedSession,
         errors: {},
      }));
   };

   // Handle input changes for add and edit forms
   const handleSessionChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const {name, value} = e.target;
      setState(prev => ({
         ...prev,
         currentSession: {
            ...prev.currentSession,
            [name]: value,
         },
      }));
   };

   // Handle exercise data changes within a session
   const handleExerciseChange = (index: number, field: 'weight' | 'reps' | 'times', value: number) => {
      const updatedExercises = [...(state.currentSession.exercises || [])];
      updatedExercises[index] = {
         ...updatedExercises[index],
         [field]: value,
      };
      setState(prev => ({
         ...prev,
         currentSession: {
            ...prev.currentSession,
            exercises: updatedExercises,
         },
      }));
   };

   // Handle adding a new exercise row in the session
   const handleAddExerciseRow = () => {
      setState(prev => ({
         ...prev,
         currentSession: {
            ...prev.currentSession,
            exercises: [...(prev.currentSession.exercises || []), {exerciseId: '', weight: 0, reps: 0, times: 0}],
         },
      }));
   };

   // Handle removing an exercise row from the session
   const handleRemoveExerciseRow = (index: number) => {
      const updatedExercises = [...(state.currentSession.exercises || [])];
      updatedExercises.splice(index, 1);
      setState(prev => ({
         ...prev,
         currentSession: {
            ...prev.currentSession,
            exercises: updatedExercises,
         },
      }));
   };

   // Load exercises from a workout plan
   const handleLoadPlan = (planId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
         const loadedExercises = plan.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            weight: 0,
            reps: ex.reps,
            times: ex.sets,
         }));
         setState(prev => ({
            ...prev,
            currentSession: {
               ...prev.currentSession,
               exercises: loadedExercises,
            },
         }));
      }
   };

   // Validation function
   const validate = (): boolean => {
      const {currentSession} = state;
      const errors: Record<string, string> = {};

      if (!currentSession.date) {
         errors.date = 'Date is required';
      }

      if (!currentSession.exercises || currentSession.exercises.length === 0) {
         errors.exercises = 'At least one exercise is required';
      } else {
         currentSession.exercises.forEach((ex, idx) => {
            if (!ex.exerciseId) {
               errors[`exercises.${idx}.exerciseId`] = 'Exercise is required';
            }
            if (ex.weight === undefined || ex.weight < 0) {
               errors[`exercises.${idx}.weight`] = 'Valid weight is required';
            }
            if (ex.reps === undefined || ex.reps <= 0) {
               errors[`exercises.${idx}.reps`] = 'Valid reps are required';
            }
            if (ex.times === undefined || ex.times <= 0) {
               errors[`exercises.${idx}.times`] = 'Valid times are required';
            }
         });
      }

      setState(prev => ({
         ...prev,
         errors,
      }));

      return Object.keys(errors).length === 0;
   };

   // Handle adding a new training session
   const handleAddSession = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) return;

      const newSession: TrainingSession = {
         id: uuidv4(),
         date: state.currentSession.date!,
         exercises: state.currentSession.exercises!.map(ex => ({
            exerciseId: ex.exerciseId!,
            weight: ex.weight!,
            reps: ex.reps!,
            times: ex.times!,
         })),
      };

      addTrainingSession(newSession);
      setState(prev => ({
         ...prev,
         openAddDialog: false,
         currentSession: {},
         errors: {},
      }));
   };

   // Handle editing an existing training session
   const handleEditSession = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) return;

      if (!state.editingSession) return;

      const updatedSession: TrainingSession = {
         id: state.editingSession.id,
         date: state.currentSession.date!,
         exercises: state.currentSession.exercises!.map(ex => ({
            exerciseId: ex.exerciseId!,
            weight: ex.weight!,
            reps: ex.reps!,
            times: ex.times!,
         })),
      };

      updateTrainingSession(updatedSession);
      setState(prev => ({
         ...prev,
         openEditDialog: false,
         editingSession: null,
         currentSession: {},
         errors: {},
      }));
   };

   // Handle deleting a training session
   const handleDeleteSession = () => {
      if (state.deleteSessionId) {
         deleteTrainingSession(state.deleteSessionId);
      }
      handleCloseDeleteDialog();
   };

   return (
      <Paper sx={{padding: 2, marginTop: 2, maxWidth: 1200, mx: 'auto'}}>
         <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
            <Typography variant='h6' align='center'>
               Training Sessions
            </Typography>
            <Button variant='contained' color='primary' startIcon={<Add />} onClick={handleOpenAddDialog}>
               Add Session
            </Button>
         </Box>
         <TableContainer component={Paper}>
            <Table stickyHeader>
               <TableHead>
                  <TableRow>
                     <TableCell>Training</TableCell>
                     {recentDates.map(date => {
                        const session = trainingSessions.find(s => s.date === date);
                        return (
                           <TableCell key={date} align='center'>
                              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                 {format(new Date(date), 'yyyy-MM-dd')}
                                 {session && (
                                    <Box sx={{mt: 1}}>
                                       <IconButton size='small' color='primary' onClick={() => handleOpenEditDialog(session)}>
                                          <Edit fontSize='small' />
                                       </IconButton>
                                       <IconButton size='small' color='primary' onClick={() => handleDuplicateSession(session)}>
                                          <FileCopy fontSize='small' />
                                       </IconButton>
                                       <IconButton size='small' color='secondary' onClick={() => handleOpenDeleteDialog(session.id)}>
                                          <Delete fontSize='small' />
                                       </IconButton>
                                    </Box>
                                 )}
                              </Box>
                           </TableCell>
                        );
                     })}
                  </TableRow>
               </TableHead>
               <TableBody>
                  {exercises.map(exercise => (
                     <TableRow key={exercise.id}>
                        <TableCell component='th' scope='row'>
                           {exercise.name}
                        </TableCell>
                        {recentDates.map(date => {
                           const sets = dataMap[date]?.[exercise.id];
                           return (
                              <TableCell key={date} align='center'>
                                 {sets && sets.length > 0
                                    ? sets.map((set, index) => (
                                         <Box key={index}>
                                            {set.weight}/{set.reps}/{set.times}
                                         </Box>
                                      ))
                                    : '-'}
                              </TableCell>
                           );
                        })}
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>

         {/* Add Training Session Dialog */}
         <Dialog open={state.openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth='lg'>
            <DialogTitle>Add New Training Session</DialogTitle>
            <form onSubmit={handleAddSession} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12} sm={4}>
                        <TextField required label='Date' name='date' type='date' fullWidth value={state.currentSession.date || ''} onChange={handleSessionChange} InputLabelProps={{shrink: true}} error={Boolean(state.errors.date)} helperText={state.errors.date} />
                     </Grid>
                     <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                           <InputLabel id='load-plan-label'>Load from Plan</InputLabel>
                           <Select labelId='load-plan-label' value='' label='Load from Plan' onChange={(e: SelectChangeEvent<string>) => handleLoadPlan(e.target.value)}>
                              <MenuItem value='' disabled>
                                 Select a plan
                              </MenuItem>
                              {plans.map(plan => (
                                 <MenuItem key={plan.id} value={plan.id}>
                                    {plan.name}
                                 </MenuItem>
                              ))}
                           </Select>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12}>
                        <Typography variant='h6'>Exercises</Typography>
                     </Grid>
                     <Grid item xs={12}>
                        <TableContainer component={Paper}>
                           <Table aria-label='Exercises in Session'>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>Exercise</TableCell>
                                    <TableCell>Weight (kg)</TableCell>
                                    <TableCell>Reps</TableCell>
                                    <TableCell>Times</TableCell>
                                    <TableCell align='center'>Actions</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {(state.currentSession.exercises || []).map((ex, idx) => (
                                    <TableRow key={idx}>
                                       <TableCell>
                                          <FormControl fullWidth required error={Boolean(state.errors[`exercises.${idx}.exerciseId`])}>
                                             <InputLabel id={`exercise-select-label-${idx}`}>Exercise</InputLabel>
                                             <Select
                                                labelId={`exercise-select-label-${idx}`}
                                                value={ex.exerciseId}
                                                onChange={(e: SelectChangeEvent<string>) =>
                                                   setState(prev => {
                                                      const updatedExercises = [...(prev.currentSession.exercises || [])];
                                                      updatedExercises[idx].exerciseId = e.target.value;
                                                      return {
                                                         ...prev,
                                                         currentSession: {...prev.currentSession, exercises: updatedExercises},
                                                      };
                                                   })
                                                }
                                                label='Exercise'>
                                                {exercises.map(exercise => (
                                                   <MenuItem key={exercise.id} value={exercise.id}>
                                                      {exercise.name}
                                                   </MenuItem>
                                                ))}
                                             </Select>
                                             {state.errors[`exercises.${idx}.exerciseId`] && <FormHelperText>{state.errors[`exercises.${idx}.exerciseId`]}</FormHelperText>}
                                          </FormControl>
                                       </TableCell>
                                       <TableCell>
                                          <TextField
                                             required
                                             type='number'
                                             label='Weight (kg)'
                                             value={ex.weight}
                                             onChange={e => handleExerciseChange(idx, 'weight', Number(e.target.value))}
                                             inputProps={{min: 0}}
                                             error={Boolean(state.errors[`exercises.${idx}.weight`])}
                                             helperText={state.errors[`exercises.${idx}.weight`]}
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <TextField
                                             required
                                             type='number'
                                             label='Reps'
                                             value={ex.reps}
                                             onChange={e => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                                             inputProps={{min: 1}}
                                             error={Boolean(state.errors[`exercises.${idx}.reps`])}
                                             helperText={state.errors[`exercises.${idx}.reps`]}
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <TextField
                                             required
                                             type='number'
                                             label='Times'
                                             value={ex.times}
                                             onChange={e => handleExerciseChange(idx, 'times', Number(e.target.value))}
                                             inputProps={{min: 1}}
                                             error={Boolean(state.errors[`exercises.${idx}.times`])}
                                             helperText={state.errors[`exercises.${idx}.times`]}
                                          />
                                       </TableCell>
                                       <TableCell align='center'>
                                          <IconButton color='secondary' onClick={() => handleRemoveExerciseRow(idx)}>
                                             <Delete />
                                          </IconButton>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                        {state.errors.exercises && (
                           <Typography variant='caption' color='error'>
                              {state.errors.exercises}
                           </Typography>
                        )}
                        <Button variant='outlined' color='primary' onClick={handleAddExerciseRow} sx={{mt: 1}}>
                           Add Exercise
                        </Button>
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleCloseAddDialog}>Cancel</Button>
                  <Button type='submit' color='primary' variant='contained'>
                     Add Session
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Edit Training Session Dialog */}
         <Dialog open={state.openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth='lg'>
            <DialogTitle>Edit Training Session</DialogTitle>
            <form onSubmit={handleEditSession} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12} sm={4}>
                        <TextField required label='Date' name='date' type='date' fullWidth value={state.currentSession.date || ''} onChange={handleSessionChange} InputLabelProps={{shrink: true}} error={Boolean(state.errors.date)} helperText={state.errors.date} />
                     </Grid>
                     <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                           <InputLabel id='load-plan-label-edit'>Load from Plan</InputLabel>
                           <Select labelId='load-plan-label-edit' value='' label='Load from Plan' onChange={(e: SelectChangeEvent<string>) => handleLoadPlan(e.target.value)}>
                              <MenuItem value='' disabled>
                                 Select a plan
                              </MenuItem>
                              {plans.map(plan => (
                                 <MenuItem key={plan.id} value={plan.id}>
                                    {plan.name}
                                 </MenuItem>
                              ))}
                           </Select>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12}>
                        <Typography variant='h6'>Exercises</Typography>
                     </Grid>
                     <Grid item xs={12}>
                        <TableContainer component={Paper}>
                           <Table aria-label='Exercises in Session'>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>Exercise</TableCell>
                                    <TableCell>Weight (kg)</TableCell>
                                    <TableCell>Reps</TableCell>
                                    <TableCell>Times</TableCell>
                                    <TableCell align='center'>Actions</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {(state.currentSession.exercises || []).map((ex, idx) => (
                                    <TableRow key={idx}>
                                       <TableCell>
                                          <FormControl fullWidth required error={Boolean(state.errors[`exercises.${idx}.exerciseId`])}>
                                             <InputLabel id={`exercise-select-label-edit-${idx}`}>Exercise</InputLabel>
                                             <Select
                                                labelId={`exercise-select-label-edit-${idx}`}
                                                value={ex.exerciseId}
                                                onChange={(e: SelectChangeEvent<string>) =>
                                                   setState(prev => {
                                                      const updatedExercises = [...(prev.currentSession.exercises || [])];
                                                      updatedExercises[idx].exerciseId = e.target.value;
                                                      return {
                                                         ...prev,
                                                         currentSession: {...prev.currentSession, exercises: updatedExercises},
                                                      };
                                                   })
                                                }
                                                label='Exercise'>
                                                {exercises.map(exercise => (
                                                   <MenuItem key={exercise.id} value={exercise.id}>
                                                      {exercise.name}
                                                   </MenuItem>
                                                ))}
                                             </Select>
                                             {state.errors[`exercises.${idx}.exerciseId`] && <FormHelperText>{state.errors[`exercises.${idx}.exerciseId`]}</FormHelperText>}
                                          </FormControl>
                                       </TableCell>
                                       <TableCell>
                                          <TextField
                                             required
                                             type='number'
                                             label='Weight (kg)'
                                             value={ex.weight}
                                             onChange={e => handleExerciseChange(idx, 'weight', Number(e.target.value))}
                                             inputProps={{min: 0}}
                                             error={Boolean(state.errors[`exercises.${idx}.weight`])}
                                             helperText={state.errors[`exercises.${idx}.weight`]}
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <TextField
                                             required
                                             type='number'
                                             label='Reps'
                                             value={ex.reps}
                                             onChange={e => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                                             inputProps={{min: 1}}
                                             error={Boolean(state.errors[`exercises.${idx}.reps`])}
                                             helperText={state.errors[`exercises.${idx}.reps`]}
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <TextField
                                             required
                                             type='number'
                                             label='Times'
                                             value={ex.times}
                                             onChange={e => handleExerciseChange(idx, 'times', Number(e.target.value))}
                                             inputProps={{min: 1}}
                                             error={Boolean(state.errors[`exercises.${idx}.times`])}
                                             helperText={state.errors[`exercises.${idx}.times`]}
                                          />
                                       </TableCell>
                                       <TableCell align='center'>
                                          <IconButton color='secondary' onClick={() => handleRemoveExerciseRow(idx)}>
                                             <Delete />
                                          </IconButton>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                        {state.errors.exercises && (
                           <Typography variant='caption' color='error'>
                              {state.errors.exercises}
                           </Typography>
                        )}
                        <Button variant='outlined' color='primary' onClick={handleAddExerciseRow} sx={{mt: 1}}>
                           Add Exercise
                        </Button>
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleCloseEditDialog}>Cancel</Button>
                  <Button type='submit' color='primary' variant='contained'>
                     Save Changes
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Delete Training Session Dialog */}
         <Dialog open={state.openDeleteDialog} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Delete Training Session</DialogTitle>
            <DialogContent>
               <Typography>Are you sure you want to delete this training session?</Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
               <Button onClick={handleDeleteSession} color='secondary' variant='contained'>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>
      </Paper>
   );
};

export default TrainingSessionManager;
