// File: ./src/app/Equipment/MuscleGroupManager.tsx

import {Add, Delete, Edit, FileUpload} from '@mui/icons-material';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography} from '@mui/material';
import React, {ChangeEvent, FormEvent, useContext, useState} from 'react';

import {MuscleGroupContext} from './contexts/MuscleGroupContext';
import {MuscleGroup} from './types';

// MuscleGroupManagerFunctional Component
const MuscleGroupManager: React.FC = () => {
   const {muscleGroups, addMuscleGroup, updateMuscleGroup, deleteMuscleGroup} = useContext(MuscleGroupContext);

   // Sort muscle groups alphabetically
   const sortedMuscleGroups = [...muscleGroups].sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}));

   const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
   const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
   const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
   const [openBatchImportDialog, setOpenBatchImportDialog] = useState<boolean>(false);
   const [currentMuscleGroup, setCurrentMuscleGroup] = useState<Partial<MuscleGroup>>({});
   const [batchInput, setBatchInput] = useState<string>('');
   const [errors, setErrors] = useState<Partial<Record<keyof MuscleGroup, string>>>({});
   const [batchError, setBatchError] = useState<string>('');

   // Handlers to open dialogs
   const handleOpenAddDialog = (): void => {
      setCurrentMuscleGroup({});
      setErrors({});
      setOpenAddDialog(true);
   };

   const handleOpenEditDialog = (group: MuscleGroup): void => {
      setCurrentMuscleGroup({...group});
      setErrors({});
      setOpenEditDialog(true);
   };

   const handleOpenDeleteDialog = (group: MuscleGroup): void => {
      setCurrentMuscleGroup({...group});
      setOpenDeleteDialog(true);
   };

   const handleOpenBatchImportDialog = (): void => {
      setBatchInput('');
      setBatchError('');
      setOpenBatchImportDialog(true);
   };

   // Handlers to close dialogs
   const handleCloseAddDialog = (): void => {
      setOpenAddDialog(false);
      setCurrentMuscleGroup({});
      setErrors({});
   };

   const handleCloseEditDialog = (): void => {
      setOpenEditDialog(false);
      setCurrentMuscleGroup({});
      setErrors({});
   };

   const handleCloseDeleteDialog = (): void => {
      setOpenDeleteDialog(false);
      setCurrentMuscleGroup({});
   };

   const handleCloseBatchImportDialog = (): void => {
      setOpenBatchImportDialog(false);
      setBatchInput('');
      setBatchError('');
   };

   // Handle input changes for add and edit forms
   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const {name, value} = e.target;
      setCurrentMuscleGroup(prev => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleBatchInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
      setBatchInput(e.target.value);
      setBatchError('');
   };

   // Validation function for single muscle group
   const validate = (): boolean => {
      const current = currentMuscleGroup;
      const validationErrors: Partial<Record<keyof MuscleGroup, string>> = {};

      if (!current.name || current.name.trim() === '') {
         validationErrors.name = 'Muscle Group Name is required';
      }

      const isDuplicate = muscleGroups.some(group => group.name.toLowerCase() === current.name?.trim().toLowerCase() && group.id !== current.id);
      if (isDuplicate) {
         validationErrors.name = 'Muscle Group Name must be unique';
      }

      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
   };

   // Validation for batch import
   const validateBatch = (): boolean => {
      const names = batchInput
         .split(/[\n,]+/)
         .map(name => name.trim())
         .filter(name => name !== '');

      if (names.length === 0) {
         setBatchError('Please enter at least one muscle group name');
         return false;
      }

      const uniqueNames = new Set(names.map(name => name.toLowerCase()));
      if (uniqueNames.size !== names.length) {
         setBatchError('Duplicate names detected in batch input');
         return false;
      }

      return true;
   };

   // Handle adding a new muscle group
   const handleAddMuscleGroup = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!validate()) return;

      const newGroup: MuscleGroup = {
         id: Date.now().toString(),
         name: currentMuscleGroup.name!.trim(),
      };

      addMuscleGroup(newGroup);
      handleCloseAddDialog();
   };

   // Handle editing an existing muscle group
   const handleEditMuscleGroup = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!validate()) return;

      const updatedGroup: MuscleGroup = {
         id: currentMuscleGroup.id!,
         name: currentMuscleGroup.name!.trim(),
      };

      updateMuscleGroup(updatedGroup);
      handleCloseEditDialog();
   };

   // Handle batch import
   const handleBatchImport = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!validateBatch()) return;

      const existingNames = new Set(muscleGroups.map(group => group.name.toLowerCase()));
      const newMuscleGroups: MuscleGroup[] = batchInput
         .split(/[\n,]+/)
         .map(name => name.trim())
         .filter(name => name !== '')
         .filter(name => !existingNames.has(name.toLowerCase())) // Skip existing names
         .map(name => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name,
         }));

      if (newMuscleGroups.length === 0) {
         setBatchError('All entered muscle groups already exist');
         return;
      }

      newMuscleGroups.forEach(group => addMuscleGroup(group));
      handleCloseBatchImportDialog();
   };

   // Handle deleting a muscle group
   const handleDeleteMuscleGroup = (): void => {
      if (!currentMuscleGroup.id) return;

      deleteMuscleGroup(currentMuscleGroup.id);
      handleCloseDeleteDialog();
   };

   return (
      <Paper style={{padding: 16, margin: 'auto', maxWidth: 800}}>
         <Typography variant='h4' gutterBottom>
            Muscle Group Manager
         </Typography>
         <Grid container spacing={2} style={{marginBottom: 16}}>
            <Grid item>
               <Button variant='contained' color='primary' startIcon={<Add />} onClick={handleOpenAddDialog}>
                  Add New Muscle Group
               </Button>
            </Grid>
            <Grid item>
               <Button variant='contained' color='secondary' startIcon={<FileUpload />} onClick={handleOpenBatchImportDialog}>
                  Batch Import
               </Button>
            </Grid>
         </Grid>

         {/* Muscle Groups Table */}
         <TableContainer component={Paper}>
            <Table aria-label='Muscle Groups table'>
               <TableHead>
                  <TableRow>
                     <TableCell>Muscle Group Name</TableCell>
                     <TableCell align='right'>Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {sortedMuscleGroups.map(group => (
                     <TableRow key={group.id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell align='right'>
                           <Tooltip title='Edit'>
                              <IconButton color='primary' onClick={() => handleOpenEditDialog(group)}>
                                 <Edit />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title='Delete'>
                              <IconButton color='secondary' onClick={() => handleOpenDeleteDialog(group)}>
                                 <Delete />
                              </IconButton>
                           </Tooltip>
                        </TableCell>
                     </TableRow>
                  ))}
                  {sortedMuscleGroups.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={2} align='center'>
                           No Muscle Groups added yet.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </TableContainer>

         {/* Add Muscle Group Dialog */}
         <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth='sm'>
            <DialogTitle>Add New Muscle Group</DialogTitle>
            <form onSubmit={handleAddMuscleGroup} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField required label='Muscle Group Name' name='name' fullWidth value={currentMuscleGroup.name || ''} onChange={handleChange} error={Boolean(errors.name)} helperText={errors.name} />
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleCloseAddDialog}>Cancel</Button>
                  <Button type='submit' color='primary' variant='contained'>
                     Add
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Edit Muscle Group Dialog */}
         <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth='sm'>
            <DialogTitle>Edit Muscle Group</DialogTitle>
            <form onSubmit={handleEditMuscleGroup} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField required label='Muscle Group Name' name='name' fullWidth value={currentMuscleGroup.name || ''} onChange={handleChange} error={Boolean(errors.name)} helperText={errors.name} />
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleCloseEditDialog}>Cancel</Button>
                  <Button type='submit' color='primary' variant='contained'>
                     Save
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Batch Import Dialog */}
         <Dialog open={openBatchImportDialog} onClose={handleCloseBatchImportDialog} fullWidth maxWidth='sm'>
            <DialogTitle>Batch Import Muscle Groups</DialogTitle>
            <form onSubmit={handleBatchImport} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField
                           label='Muscle Group Names'
                           name='batchInput'
                           fullWidth
                           multiline
                           rows={4}
                           value={batchInput}
                           onChange={handleBatchInputChange}
                           error={Boolean(batchError)}
                           helperText={batchError || 'Enter muscle group names separated by commas or new lines (existing names will be skipped)'}
                        />
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleCloseBatchImportDialog}>Cancel</Button>
                  <Button type='submit' color='primary' variant='contained'>
                     Import
                  </Button>
               </DialogActions>
            </form>
         </Dialog>

         {/* Delete Confirmation Dialog */}
         <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Delete Muscle Group</DialogTitle>
            <DialogContent>
               <Typography>
                  Are you sure you want to delete <strong>{currentMuscleGroup.name}</strong>?
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
               <Button onClick={handleDeleteMuscleGroup} color='secondary' variant='contained'>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>
      </Paper>
   );
};

export default MuscleGroupManager;
