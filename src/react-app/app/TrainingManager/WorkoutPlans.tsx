// File: ./src/app/Equipment/WorkoutPlans.tsx

import {Add, Delete, Edit, FitnessCenter, Repeat, Timer} from '@mui/icons-material';
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography, useTheme} from '@mui/material';
import React, {ChangeEvent, FormEvent, useContext, useState} from 'react';

import {ExerciseContext} from './contexts/ExerciseContext';
import {WorkoutPlanContext} from './contexts/WorkoutPlanContext';

interface WorkoutPlan {
   id: string;
   name: string;
   exercises: {exerciseId: string; sets: number; reps: number; rest: number}[];
}

interface FormState {
   name: string;
   exercises: {exerciseId: string; sets: number; reps: number; rest: number}[];
}

const WorkoutPlans: React.FC = () => {
   const {plans, addPlan, updatePlan, deletePlan} = useContext(WorkoutPlanContext);
   const {exercises} = useContext(ExerciseContext);
   const theme = useTheme(); // Access the theme for dynamic styling

   const [openAddDialog, setOpenAddDialog] = useState(false);
   const [openEditDialog, setOpenEditDialog] = useState(false);
   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
   const [currentPlan, setCurrentPlan] = useState<FormState>({name: '', exercises: []});
   const [editPlanId, setEditPlanId] = useState<string | null>(null);
   const [errors, setErrors] = useState<Partial<Record<keyof FormState | string, string>>>({});

   // Dialog handlers
   const handleOpenAddDialog = () => {
      setCurrentPlan({name: '', exercises: [{exerciseId: '', sets: 0, reps: 0, rest: 0}]});
      setErrors({});
      setOpenAddDialog(true);
   };

   const handleCloseAddDialog = () => {
      setOpenAddDialog(false);
      setCurrentPlan({name: '', exercises: []});
      setErrors({});
   };

   const handleOpenEditDialog = (plan: WorkoutPlan) => {
      setCurrentPlan({name: plan.name, exercises: [...plan.exercises]});
      setEditPlanId(plan.id);
      setErrors({});
      setOpenEditDialog(true);
   };

   const handleCloseEditDialog = () => {
      setOpenEditDialog(false);
      setCurrentPlan({name: '', exercises: []});
      setEditPlanId(null);
      setErrors({});
   };

   const handleOpenDeleteDialog = (plan: WorkoutPlan) => {
      setCurrentPlan({name: plan.name, exercises: [...plan.exercises]});
      setEditPlanId(plan.id);
      setOpenDeleteDialog(true);
   };

   const handleCloseDeleteDialog = () => {
      setOpenDeleteDialog(false);
      setCurrentPlan({name: '', exercises: []});
      setEditPlanId(null);
   };

   // Form handlers
   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const {name, value} = e.target;
      setCurrentPlan(prev => ({...prev, [name]: value}));
   };

   const handleExerciseChange = (index: number, field: keyof WorkoutPlan['exercises'][0], value: string | number) => {
      const updatedExercises = [...currentPlan.exercises];
      updatedExercises[index] = {...updatedExercises[index], [field]: field === 'exerciseId' ? value : Number(value)};
      setCurrentPlan(prev => ({...prev, exercises: updatedExercises}));
   };

   const handleAddExerciseRow = () => {
      setCurrentPlan(prev => ({
         ...prev,
         exercises: [...prev.exercises, {exerciseId: '', sets: 0, reps: 0, rest: 0}],
      }));
   };

   const handleRemoveExerciseRow = (index: number) => {
      const updatedExercises = [...currentPlan.exercises];
      updatedExercises.splice(index, 1);
      setCurrentPlan(prev => ({...prev, exercises: updatedExercises}));
   };

   // Validation
   const validate = (): boolean => {
      const newErrors: Partial<Record<keyof FormState | string, string>> = {};

      if (!currentPlan.name.trim()) {
         newErrors.name = 'Plan name is required';
      }

      if (currentPlan.exercises.length === 0) {
         newErrors.exercises = 'At least one exercise is required';
      } else {
         currentPlan.exercises.forEach((ex, idx) => {
            if (!ex.exerciseId) newErrors[`exercises.${idx}.exerciseId`] = 'Exercise is required';
            if (ex.sets <= 0) newErrors[`exercises.${idx}.sets`] = 'Sets must be greater than 0';
            if (ex.reps <= 0) newErrors[`exercises.${idx}.reps`] = 'Reps must be greater than 0';
            if (ex.rest < 0) newErrors[`exercises.${idx}.rest`] = 'Rest cannot be negative';
         });
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // CRUD operations
   const handleAddPlan = (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      addPlan({
         name: currentPlan.name.trim(),
         exercises: currentPlan.exercises,
      });
      handleCloseAddDialog();
   };

   const handleEditPlan = (e: FormEvent) => {
      e.preventDefault();
      if (!validate() || !editPlanId) return;

      updatePlan({
         id: editPlanId,
         name: currentPlan.name.trim(),
         exercises: currentPlan.exercises,
      });
      handleCloseEditDialog();
   };

   const handleDeletePlan = () => {
      if (editPlanId) {
         deletePlan(editPlanId);
      }
      handleCloseDeleteDialog();
   };

   // Helper to get exercise name
   const getExerciseName = (id: string) => exercises.find(ex => ex.id === id)?.name || 'Unknown';

   return (
      <Box sx={{maxWidth: 1200, mx: 'auto', py: 3, px: {xs: 1, sm: 2}}}>
         <Typography
            variant='h4'
            gutterBottom
            sx={{
               mb: 3,
               fontWeight: 'bold',
               color: theme.palette.text.primary,
               textAlign: {xs: 'center', sm: 'left'},
            }}>
            Your Workout Plans
         </Typography>
         <Button
            variant='contained'
            color='primary'
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
            sx={{
               'mb': 4,
               'borderRadius': 20,
               'px': 3,
               'width': {xs: '100%', sm: 'auto'},
               'bgcolor': theme.palette.primary.main,
               '&:hover': {bgcolor: theme.palette.primary.dark},
            }}>
            Create New Plan
         </Button>

         <Grid container spacing={2}>
            {plans.length > 0 ? (
               plans.map(plan => (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                     <Card
                        sx={{
                           'bgcolor': theme.palette.background.paper,
                           'boxShadow': theme.palette.mode === 'dark' ? '0 4px 12px rgba(255, 255, 255, 0.1)' : 3,
                           'borderRadius': 2,
                           'transition': 'transform 0.2s',
                           '&:hover': {transform: 'scale(1.02)'},
                        }}>
                        <CardContent sx={{p: 2}}>
                           <Accordion elevation={0} sx={{bgcolor: 'transparent'}}>
                              <AccordionSummary>
                                 <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <Typography variant='h6' sx={{fontWeight: 'bold', color: theme.palette.text.primary}}>
                                       {plan.name}
                                    </Typography>
                                    <Typography variant='subtitle1' sx={{color: theme.palette.text.secondary}}>
                                       Exercises ({plan.exercises.length})
                                    </Typography>
                                 </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                 <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.0}}>
                                    {plan.exercises.map((ex, idx) => (
                                       <Box
                                          key={idx}
                                          sx={{
                                             bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f5f5',
                                             borderRadius: 1,
                                             p: 1.5,
                                             border: `1px solid ${theme.palette.divider}`,
                                          }}>
                                          <Typography variant='body1' sx={{fontWeight: 'medium', color: theme.palette.primary.main}}>
                                             {getExerciseName(ex.exerciseId)}
                                          </Typography>
                                          <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                             <Typography variant='body2' sx={{display: 'flex', alignItems: 'center', color: theme.palette.text.secondary}}>
                                                <FitnessCenter sx={{fontSize: 16, mr: 0.5, color: '#4caf50'}} /> {ex.sets} sets
                                             </Typography>
                                             <Typography variant='body2' sx={{display: 'flex', alignItems: 'center', color: theme.palette.text.secondary}}>
                                                <Repeat sx={{fontSize: 16, mr: 0.5, color: '#ff9800'}} /> {ex.reps} reps
                                             </Typography>
                                             <Typography variant='body2' sx={{display: 'flex', alignItems: 'center', color: theme.palette.text.secondary}}>
                                                <Timer sx={{fontSize: 16, mr: 0.5, color: '#f44336'}} /> {ex.rest}s rest
                                             </Typography>
                                          </Box>
                                       </Box>
                                    ))}
                                 </Box>
                              </AccordionDetails>
                           </Accordion>
                        </CardContent>
                        <CardActions sx={{justifyContent: 'flex-end', p: 0}}>
                           <IconButton color='primary' onClick={() => handleOpenEditDialog(plan)} sx={{'p': 1, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                              <Edit />
                           </IconButton>
                           <IconButton color='error' onClick={() => handleOpenDeleteDialog(plan)} sx={{'p': 1, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                              <Delete />
                           </IconButton>
                        </CardActions>
                     </Card>
                  </Grid>
               ))
            ) : (
               <Grid item xs={12}>
                  <Typography variant='body1' color='text.secondary' sx={{textAlign: 'center', py: 4}}>
                     No workout plans yet. Start by creating one!
                  </Typography>
               </Grid>
            )}
         </Grid>

         {/* Add Plan Dialog */}
         <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth='md' sx={{'& .MuiDialog-paper': {borderRadius: 2}}}>
            <DialogTitle sx={{bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, py: 2, textAlign: 'center'}}>Create New Workout Plan</DialogTitle>
            <form onSubmit={handleAddPlan}>
               <DialogContent sx={{py: 3, px: {xs: 2, sm: 3}, bgcolor: theme.palette.background.default}}>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField required label='Plan Name' name='name' value={currentPlan.name} onChange={handleInputChange} fullWidth error={!!errors.name} helperText={errors.name} variant='outlined' sx={{bgcolor: theme.palette.background.paper}} />
                     </Grid>
                     <Grid item xs={12}>
                        <Typography variant='h6' sx={{mb: 2, fontWeight: 'medium', color: theme.palette.text.primary}}>
                           Exercises
                        </Typography>
                        {currentPlan.exercises.map((ex, idx) => (
                           <Card
                              key={idx}
                              sx={{
                                 mb: 2,
                                 p: 2,
                                 bgcolor: theme.palette.background.paper,
                                 borderRadius: 2,
                                 boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.05)' : 1,
                              }}>
                              <Grid container spacing={2} alignItems='center'>
                                 <Grid item xs={12} sm={5}>
                                    <FormControl fullWidth error={!!errors[`exercises.${idx}.exerciseId`]}>
                                       <InputLabel sx={{color: theme.palette.text.secondary}}>Exercise</InputLabel>
                                       <Select value={ex.exerciseId} onChange={(e: SelectChangeEvent<string>) => handleExerciseChange(idx, 'exerciseId', e.target.value)} label='Exercise' size='small' sx={{bgcolor: theme.palette.background.paper}}>
                                          {exercises.map(exercise => (
                                             <MenuItem key={exercise.id} value={exercise.id}>
                                                {exercise.name}
                                             </MenuItem>
                                          ))}
                                       </Select>
                                       {errors[`exercises.${idx}.exerciseId`] && (
                                          <Typography variant='caption' color='error'>
                                             {errors[`exercises.${idx}.exerciseId`]}
                                          </Typography>
                                       )}
                                    </FormControl>
                                 </Grid>
                                 <Grid item xs={4} sm={2}>
                                    <TextField
                                       label='Sets'
                                       type='number'
                                       value={ex.sets}
                                       onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                                       inputProps={{min: 1}}
                                       error={!!errors[`exercises.${idx}.sets`]}
                                       helperText={errors[`exercises.${idx}.sets`]}
                                       fullWidth
                                       size='small'
                                       sx={{bgcolor: theme.palette.background.paper}}
                                    />
                                 </Grid>
                                 <Grid item xs={4} sm={2}>
                                    <TextField
                                       label='Reps'
                                       type='number'
                                       value={ex.reps}
                                       onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                                       inputProps={{min: 1}}
                                       error={!!errors[`exercises.${idx}.reps`]}
                                       helperText={errors[`exercises.${idx}.reps`]}
                                       fullWidth
                                       size='small'
                                       sx={{bgcolor: theme.palette.background.paper}}
                                    />
                                 </Grid>
                                 <Grid item xs={4} sm={2}>
                                    <TextField
                                       label='Rest (s)'
                                       type='number'
                                       value={ex.rest}
                                       onChange={e => handleExerciseChange(idx, 'rest', e.target.value)}
                                       inputProps={{min: 0}}
                                       error={!!errors[`exercises.${idx}.rest`]}
                                       helperText={errors[`exercises.${idx}.rest`]}
                                       fullWidth
                                       size='small'
                                       sx={{bgcolor: theme.palette.background.paper}}
                                    />
                                 </Grid>
                                 <Grid item xs={2} sm={1}>
                                    <IconButton color='error' onClick={() => handleRemoveExerciseRow(idx)} sx={{'p': 1, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                                       <Delete />
                                    </IconButton>
                                 </Grid>
                              </Grid>
                           </Card>
                        ))}
                        <Button
                           variant='outlined'
                           onClick={handleAddExerciseRow}
                           sx={{
                              mt: 1,
                              borderRadius: 20,
                              width: {xs: '100%', sm: 'auto'},
                              color: theme.palette.text.primary,
                              borderColor: theme.palette.divider,
                           }}>
                           Add Exercise
                        </Button>
                        {errors.exercises && (
                           <Typography variant='caption' color='error' sx={{mt: 2}}>
                              {errors.exercises}
                           </Typography>
                        )}
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions sx={{p: 2, justifyContent: 'space-between', bgcolor: theme.palette.background.default}}>
                  <Button onClick={handleCloseAddDialog} sx={{'color': theme.palette.text.secondary, 'minWidth': 100, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                     Cancel
                  </Button>
                  <Button type='submit' color='primary' variant='contained' sx={{'borderRadius': 20, 'minWidth': 100, '&:hover': {bgcolor: theme.palette.primary.dark}}}>
                     Add Plan
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Edit Plan Dialog */}
         <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth='md' sx={{'& .MuiDialog-paper': {borderRadius: 2}}}>
            <DialogTitle sx={{bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, py: 2, textAlign: 'center'}}>Edit Workout Plan</DialogTitle>
            <form onSubmit={handleEditPlan}>
               <DialogContent sx={{py: 3, px: {xs: 2, sm: 3}, bgcolor: theme.palette.background.default}}>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField required label='Plan Name' name='name' value={currentPlan.name} onChange={handleInputChange} fullWidth error={!!errors.name} helperText={errors.name} variant='outlined' sx={{bgcolor: theme.palette.background.paper}} />
                     </Grid>
                     <Grid item xs={12}>
                        <Typography variant='h6' sx={{mb: 2, fontWeight: 'medium', color: theme.palette.text.primary}}>
                           Exercises
                        </Typography>
                        {currentPlan.exercises.map((ex, idx) => (
                           <Card
                              key={idx}
                              sx={{
                                 mb: 2,
                                 p: 2,
                                 bgcolor: theme.palette.background.paper,
                                 borderRadius: 2,
                                 boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.05)' : 1,
                              }}>
                              <Grid container spacing={2} alignItems='center'>
                                 <Grid item xs={12} sm={5}>
                                    <FormControl fullWidth error={!!errors[`exercises.${idx}.exerciseId`]}>
                                       <InputLabel sx={{color: theme.palette.text.secondary}}>Exercise</InputLabel>
                                       <Select value={ex.exerciseId} onChange={(e: SelectChangeEvent<string>) => handleExerciseChange(idx, 'exerciseId', e.target.value)} label='Exercise' size='small' sx={{bgcolor: theme.palette.background.paper}}>
                                          {exercises.map(exercise => (
                                             <MenuItem key={exercise.id} value={exercise.id}>
                                                {exercise.name}
                                             </MenuItem>
                                          ))}
                                       </Select>
                                       {errors[`exercises.${idx}.exerciseId`] && (
                                          <Typography variant='caption' color='error'>
                                             {errors[`exercises.${idx}.exerciseId`]}
                                          </Typography>
                                       )}
                                    </FormControl>
                                 </Grid>
                                 <Grid item xs={4} sm={2}>
                                    <TextField
                                       label='Sets'
                                       type='number'
                                       value={ex.sets}
                                       onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                                       inputProps={{min: 1}}
                                       error={!!errors[`exercises.${idx}.sets`]}
                                       helperText={errors[`exercises.${idx}.sets`]}
                                       fullWidth
                                       size='small'
                                       sx={{bgcolor: theme.palette.background.paper}}
                                    />
                                 </Grid>
                                 <Grid item xs={4} sm={2}>
                                    <TextField
                                       label='Reps'
                                       type='number'
                                       value={ex.reps}
                                       onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                                       inputProps={{min: 1}}
                                       error={!!errors[`exercises.${idx}.reps`]}
                                       helperText={errors[`exercises.${idx}.reps`]}
                                       fullWidth
                                       size='small'
                                       sx={{bgcolor: theme.palette.background.paper}}
                                    />
                                 </Grid>
                                 <Grid item xs={4} sm={2}>
                                    <TextField
                                       label='Rest (s)'
                                       type='number'
                                       value={ex.rest}
                                       onChange={e => handleExerciseChange(idx, 'rest', e.target.value)}
                                       inputProps={{min: 0}}
                                       error={!!errors[`exercises.${idx}.rest`]}
                                       helperText={errors[`exercises.${idx}.rest`]}
                                       fullWidth
                                       size='small'
                                       sx={{bgcolor: theme.palette.background.paper}}
                                    />
                                 </Grid>
                                 <Grid item xs={2} sm={1}>
                                    <IconButton color='error' onClick={() => handleRemoveExerciseRow(idx)} sx={{'p': 1, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                                       <Delete />
                                    </IconButton>
                                 </Grid>
                              </Grid>
                           </Card>
                        ))}
                        <Button
                           variant='outlined'
                           onClick={handleAddExerciseRow}
                           sx={{
                              mt: 1,
                              borderRadius: 20,
                              width: {xs: '100%', sm: 'auto'},
                              color: theme.palette.text.primary,
                              borderColor: theme.palette.divider,
                           }}>
                           Add Exercise
                        </Button>
                        {errors.exercises && (
                           <Typography variant='caption' color='error' sx={{mt: 2}}>
                              {errors.exercises}
                           </Typography>
                        )}
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions sx={{p: 2, justifyContent: 'space-between', bgcolor: theme.palette.background.default}}>
                  <Button onClick={handleCloseEditDialog} sx={{'color': theme.palette.text.secondary, 'minWidth': 100, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                     Cancel
                  </Button>
                  <Button type='submit' color='primary' variant='contained' sx={{'borderRadius': 20, 'minWidth': 100, '&:hover': {bgcolor: theme.palette.primary.dark}}}>
                     Save Changes
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Delete Confirmation Dialog */}
         <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} sx={{'& .MuiDialog-paper': {borderRadius: 2}}}>
            <DialogTitle sx={{bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText, py: 2, textAlign: 'center'}}>Delete Workout Plan</DialogTitle>
            <DialogContent sx={{py: 3, px: {xs: 2, sm: 3}, bgcolor: theme.palette.background.default}}>
               <Typography variant='body1' sx={{color: theme.palette.text.primary}}>
                  Are you sure you want to delete <strong>{currentPlan.name}</strong>? This action cannot be undone.
               </Typography>
            </DialogContent>
            <DialogActions sx={{p: 2, justifyContent: 'space-between', bgcolor: theme.palette.background.default}}>
               <Button onClick={handleCloseDeleteDialog} sx={{'color': theme.palette.text.secondary, 'minWidth': 100, '&:hover': {bgcolor: theme.palette.action.hover}}}>
                  Cancel
               </Button>
               <Button onClick={handleDeletePlan} color='error' variant='contained' sx={{'borderRadius': 20, 'minWidth': 100, '&:hover': {bgcolor: theme.palette.error.dark}}}>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
};

export default WorkoutPlans;
