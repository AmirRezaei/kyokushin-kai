// File: ./src/app/Equipment/EquipmentLibrary.tsx
'use strict';

import {Delete, Edit, FileUpload} from '@mui/icons-material';
import {Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme} from '@mui/material';
import React, {ChangeEvent, FormEvent, useContext, useState} from 'react';

import {EquipmentContext} from './contexts/EquipmentContext';
import {Equipment} from './types';

// EquipmentLibrary Component
const EquipmentLibrary: React.FC = () => {
   const {equipments, addEquipment, updateEquipment, deleteEquipment} = useContext(EquipmentContext);
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

   // Sort equipments alphabetically
   const sortedEquipments = [...equipments].sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}));

   const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
   const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
   const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
   const [openBatchImportDialog, setOpenBatchImportDialog] = useState<boolean>(false);
   const [currentEquipment, setCurrentEquipment] = useState<Partial<Equipment>>({});
   const [batchInput, setBatchInput] = useState<string>('');
   const [errors, setErrors] = useState<Partial<Record<keyof Equipment, string>>>({});
   const [batchError, setBatchError] = useState<string>('');

   const handleOpenAddDialog = (): void => {
      setOpenAddDialog(true);
      setCurrentEquipment({});
      setErrors({});
   };

   const handleCloseAddDialog = (): void => {
      setOpenAddDialog(false);
      setCurrentEquipment({});
      setErrors({});
   };

   const handleOpenEditDialog = (equipment: Equipment): void => {
      setOpenEditDialog(true);
      setCurrentEquipment({...equipment});
      setErrors({});
   };

   const handleCloseEditDialog = (): void => {
      setOpenEditDialog(false);
      setCurrentEquipment({});
      setErrors({});
   };

   const handleOpenDeleteDialog = (equipment: Equipment): void => {
      setOpenDeleteDialog(true);
      setCurrentEquipment({...equipment});
   };

   const handleCloseDeleteDialog = (): void => {
      setOpenDeleteDialog(false);
      setCurrentEquipment({});
   };

   const handleOpenBatchImportDialog = (): void => {
      setBatchInput('');
      setBatchError('');
      setOpenBatchImportDialog(true);
   };

   const handleCloseBatchImportDialog = (): void => {
      setOpenBatchImportDialog(false);
      setBatchInput('');
      setBatchError('');
   };

   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const {name, value} = e.target;
      setCurrentEquipment(prev => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleBatchInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
      setBatchInput(e.target.value);
      setBatchError('');
   };

   const validate = (): boolean => {
      const tempErrors: Partial<Record<keyof Equipment, string>> = {};

      if (!currentEquipment.name || currentEquipment.name.trim() === '') {
         tempErrors.name = 'Equipment Name is required';
      }

      const isDuplicate = equipments.some(eq => eq.name.toLowerCase() === currentEquipment.name?.trim().toLowerCase() && eq.id !== currentEquipment.id);
      if (isDuplicate) {
         tempErrors.name = 'Equipment Name must be unique';
      }

      setErrors(tempErrors);
      return Object.keys(tempErrors).length === 0;
   };

   const validateBatch = (): boolean => {
      const entries = batchInput
         .split('\n')
         .map(line => line.trim())
         .filter(line => line !== '')
         .map(line => {
            const [name, description] = line.split(',').map(part => part.trim());
            return {name, description: description || ''};
         });

      if (entries.length === 0) {
         setBatchError('Please enter at least one equipment name');
         return false;
      }

      const names = entries.map(entry => entry.name.toLowerCase());
      const uniqueNames = new Set(names);
      if (uniqueNames.size !== names.length) {
         setBatchError('Duplicate names detected in batch input');
         return false;
      }

      return true;
   };

   const handleAddEquipment = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!validate()) return;

      const newEquipment: Omit<Equipment, 'id'> = {
         name: currentEquipment.name!.trim(),
         description: currentEquipment.description?.trim(),
      };

      addEquipment(newEquipment);
      setOpenAddDialog(false);
      setCurrentEquipment({});
      setErrors({});
   };

   const handleEditEquipment = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!validate()) return;

      const updatedEquipment: Equipment = {
         id: currentEquipment.id!,
         name: currentEquipment.name!.trim(),
         description: currentEquipment.description?.trim(),
      };

      updateEquipment(updatedEquipment);
      setOpenEditDialog(false);
      setCurrentEquipment({});
      setErrors({});
   };

   const handleBatchImport = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!validateBatch()) return;

      const existingNames = new Set(equipments.map(eq => eq.name.toLowerCase()));
      const newEquipments: Omit<Equipment, 'id'>[] = batchInput
         .split('\n')
         .map(line => line.trim())
         .filter(line => line !== '')
         .map(line => {
            const [name, description] = line.split(',').map(part => part.trim());
            return {name, description: description || ''};
         })
         .filter(entry => !existingNames.has(entry.name.toLowerCase()));

      if (newEquipments.length === 0) {
         setBatchError('All entered equipment names already exist');
         return;
      }

      newEquipments.forEach(equipment => addEquipment(equipment));
      setOpenBatchImportDialog(false);
      setBatchInput('');
      setBatchError('');
   };

   const handleDeleteEquipment = (): void => {
      if (currentEquipment.id) {
         deleteEquipment(currentEquipment.id);
      }
      setOpenDeleteDialog(false);
      setCurrentEquipment({});
   };

   return (
      <Paper style={{padding: 16, margin: 'auto', maxWidth: 1000}}>
         <Typography variant='h4' gutterBottom>
            Equipment Library
         </Typography>
         <Grid container spacing={2} style={{marginBottom: 16}}>
            <Grid item>
               <Button variant='contained' color='primary' onClick={handleOpenAddDialog}>
                  Add New Equipment
               </Button>
            </Grid>
            <Grid item>
               <Button variant='contained' color='secondary' startIcon={<FileUpload />} onClick={handleOpenBatchImportDialog}>
                  Batch Import
               </Button>
            </Grid>
         </Grid>

         {/* Equipments Table/Cards */}
         {isMobile ? (
            <Box>
               {sortedEquipments.map(equipment => (
                  <Card key={equipment.id} sx={{ mb: 2 }}>
                     <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                           <Typography variant="h6">{equipment.name}</Typography>
                           <Box>
                              <IconButton size="small" color='primary' onClick={() => handleOpenEditDialog(equipment)}>
                                 <Edit fontSize='small' />
                              </IconButton>
                              <IconButton size="small" color='secondary' onClick={() => handleOpenDeleteDialog(equipment)}>
                                 <Delete fontSize='small' />
                              </IconButton>
                           </Box>
                        </Box>
                        {equipment.description && (
                           <Typography variant="body2" color="textSecondary">{equipment.description}</Typography>
                        )}
                     </CardContent>
                  </Card>
               ))}
               {sortedEquipments.length === 0 && (
                  <Typography align='center' color='textSecondary'>No Equipments added yet.</Typography>
               )}
            </Box>
         ) : (
            <TableContainer component={Paper}>
               <Table aria-label='Equipments table'>
                  <TableHead>
                     <TableRow>
                        <TableCell>Equipment Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align='right'>Actions</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {sortedEquipments.map(equipment => (
                        <TableRow key={equipment.id}>
                           <TableCell>{equipment.name}</TableCell>
                           <TableCell>{equipment.description}</TableCell>
                           <TableCell align='right'>
                              <IconButton color='primary' onClick={() => handleOpenEditDialog(equipment)}>
                                 <Edit />
                              </IconButton>
                              <IconButton color='secondary' onClick={() => handleOpenDeleteDialog(equipment)}>
                                 <Delete />
                              </IconButton>
                           </TableCell>
                        </TableRow>
                     ))}
                     {sortedEquipments.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={3} align='center'>
                              No Equipments added yet.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </TableContainer>
         )}

         {/* Add Equipment Dialog */}
         <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth='sm'>
            <DialogTitle>Add New Equipment</DialogTitle>
            <form onSubmit={handleAddEquipment} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField required label='Equipment Name' name='name' fullWidth value={currentEquipment.name || ''} onChange={handleChange} error={Boolean(errors.name)} helperText={errors.name} />
                     </Grid>
                     <Grid item xs={12}>
                        <TextField label='Description' name='description' fullWidth value={currentEquipment.description || ''} onChange={handleChange} />
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

         {/* Edit Equipment Dialog */}
         <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth='sm'>
            <DialogTitle>Edit Equipment</DialogTitle>
            <form onSubmit={handleEditEquipment} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField required label='Equipment Name' name='name' fullWidth value={currentEquipment.name || ''} onChange={handleChange} error={Boolean(errors.name)} helperText={errors.name} />
                     </Grid>
                     <Grid item xs={12}>
                        <TextField label='Description' name='description' fullWidth value={currentEquipment.description || ''} onChange={handleChange} />
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
            <DialogTitle>Batch Import Equipment</DialogTitle>
            <form onSubmit={handleBatchImport} noValidate>
               <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <TextField
                           label='Equipment Entries'
                           name='batchInput'
                           fullWidth
                           multiline
                           rows={4}
                           value={batchInput}
                           onChange={handleBatchInputChange}
                           error={Boolean(batchError)}
                           helperText={batchError || 'Enter equipment per line (name,description optional) e.g.\nDumbbell,Adjustable weight\nBarbell\nKettlebell,For swings'}
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
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogContent>
               <Typography>
                  Are you sure you want to delete <strong>{currentEquipment.name}</strong>?
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
               <Button onClick={handleDeleteEquipment} color='secondary' variant='contained'>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>
      </Paper>
   );
};

export default EquipmentLibrary;
