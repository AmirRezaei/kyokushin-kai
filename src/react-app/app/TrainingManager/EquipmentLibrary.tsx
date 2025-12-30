// File: ./src/app/Equipment/EquipmentLibrary.tsx
'use strict';

import { Delete, Edit, FileUpload, FilterList } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ChangeEvent, FormEvent, useContext, useMemo, useState } from 'react';

import { EquipmentCategoryContext } from './contexts/EquipmentCategoryContext';
import { EquipmentContext } from './contexts/EquipmentContext';
import { Equipment } from './types';

// EquipmentLibrary Component
const EquipmentLibrary: React.FC = () => {
  const { equipments, addEquipment, updateEquipment, deleteEquipment } =
    useContext(EquipmentContext);
  const { categories } = useContext(EquipmentCategoryContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filter and sort equipments
  const filteredEquipments = useMemo(() => {
    if (selectedCategoryFilter === 'all') return equipments;
    if (selectedCategoryFilter === 'uncategorized')
      return equipments.filter((eq) => !eq.categoryId);
    return equipments.filter((eq) => eq.categoryId === selectedCategoryFilter);
  }, [equipments, selectedCategoryFilter]);

  const sortedEquipments = [...filteredEquipments].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );

  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return 'Uncategorized';
    return categories.find((cat) => cat.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string | undefined): string => {
    if (!categoryId) return '#DFE6E9';
    return categories.find((cat) => cat.id === categoryId)?.color || '#4ECDC4';
  };

  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openBatchImportDialog, setOpenBatchImportDialog] = useState<boolean>(false);
  const [currentEquipment, setCurrentEquipment] = useState<Partial<Equipment>>({});
  const [batchInput, setBatchInput] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof Equipment, string>>>({});
  const [batchError, setBatchError] = useState<string>('');
  const [trimCsvFields, setTrimCsvFields] = useState<boolean>(true);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<Set<string>>(new Set());
  const [openBatchDeleteDialog, setOpenBatchDeleteDialog] = useState<boolean>(false);

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
    setCurrentEquipment({ ...equipment });
    setErrors({});
  };

  const handleCloseEditDialog = (): void => {
    setOpenEditDialog(false);
    setCurrentEquipment({});
    setErrors({});
  };

  const handleOpenDeleteDialog = (equipment: Equipment): void => {
    setOpenDeleteDialog(true);
    setCurrentEquipment({ ...equipment });
  };

  const handleCloseDeleteDialog = (): void => {
    setOpenDeleteDialog(false);
    setCurrentEquipment({});
  };

  const handleOpenBatchImportDialog = (): void => {
    setBatchInput('');
    setBatchError('');
    setTrimCsvFields(true);
    setOpenBatchImportDialog(true);
  };

  const handleCloseBatchImportDialog = (): void => {
    setOpenBatchImportDialog(false);
    setBatchInput('');
    setBatchError('');
    setTrimCsvFields(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setCurrentEquipment((prev) => ({
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

    const isDuplicate = equipments.some(
      (eq) =>
        eq.name.toLowerCase() === currentEquipment.name?.trim().toLowerCase() &&
        eq.id !== currentEquipment.id,
    );
    if (isDuplicate) {
      tempErrors.name = 'Equipment Name must be unique';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateBatch = (): boolean => {
    const entries = batchInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line) => {
        const parts = line.split(',').map((part) => (trimCsvFields ? part.trim() : part));
        const [name, description, categoryName] = parts;
        return { name, description: description || '', categoryName: categoryName || '' };
      });

    if (entries.length === 0) {
      setBatchError('Please enter at least one equipment name');
      return false;
    }

    const names = entries.map((entry) => entry.name.toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      setBatchError('Duplicate names detected in batch input');
      return false;
    }

    // Validate category names
    const invalidCategories = entries
      .filter((entry) => entry.categoryName)
      .filter(
        (entry) =>
          !categories.find((cat) => cat.name.toLowerCase() === entry.categoryName.toLowerCase()),
      );

    if (invalidCategories.length > 0) {
      const invalidNames = invalidCategories.map((e) => e.categoryName).join(', ');
      setBatchError(`Invalid category name(s): ${invalidNames}`);
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
      categoryId: currentEquipment.categoryId,
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
      categoryId: currentEquipment.categoryId,
    };

    updateEquipment(updatedEquipment);
    setOpenEditDialog(false);
    setCurrentEquipment({});
    setErrors({});
  };

  const handleBatchImport = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validateBatch()) return;

    const existingNames = new Set(equipments.map((eq) => eq.name.toLowerCase()));
    const newEquipments: Omit<Equipment, 'id'>[] = batchInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line) => {
        const parts = line.split(',').map((part) => (trimCsvFields ? part.trim() : part));
        const [name, description, categoryName] = parts;

        // Find category ID by name (case-insensitive)
        const categoryId = categoryName
          ? categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())?.id
          : undefined;

        return {
          name,
          description: description || '',
          categoryId,
        };
      })
      .filter((entry) => !existingNames.has(entry.name.toLowerCase()));

    if (newEquipments.length === 0) {
      setBatchError('All entered equipment names already exist');
      return;
    }

    newEquipments.forEach((equipment) => addEquipment(equipment));
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

  const handleToggleSelect = (id: string): void => {
    setSelectedEquipmentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (): void => {
    if (selectedEquipmentIds.size === sortedEquipments.length) {
      setSelectedEquipmentIds(new Set());
    } else {
      setSelectedEquipmentIds(new Set(sortedEquipments.map((eq) => eq.id)));
    }
  };

  const handleOpenBatchDeleteDialog = (): void => {
    setOpenBatchDeleteDialog(true);
  };

  const handleCloseBatchDeleteDialog = (): void => {
    setOpenBatchDeleteDialog(false);
  };

  const handleBatchDelete = (): void => {
    selectedEquipmentIds.forEach((id) => deleteEquipment(id));
    setSelectedEquipmentIds(new Set());
    setOpenBatchDeleteDialog(false);
  };

  return (
    <Paper style={{ padding: 16, margin: 'auto', maxWidth: 1000 }}>
      <Typography variant="h4" gutterBottom>
        Equipment Library
      </Typography>
      <Grid container spacing={2} style={{ marginBottom: 16 }} alignItems="center">
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Add New Equipment
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FileUpload />}
            onClick={handleOpenBatchImportDialog}
          >
            Batch Import
          </Button>
        </Grid>
        {selectedEquipmentIds.size > 0 && (
          <Grid item>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleOpenBatchDeleteDialog}
            >
              Delete Selected ({selectedEquipmentIds.size})
            </Button>
          </Grid>
        )}
        <Grid item xs={12} sm={4}>
          <Select
            fullWidth
            size="small"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            startAdornment={<FilterList sx={{ mr: 1, color: 'action.active' }} />}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="uncategorized">Uncategorized</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <Chip
                  label={cat.name}
                  size="small"
                  sx={{ backgroundColor: cat.color, color: '#fff', mr: 1 }}
                />
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {/* Equipments Table/Cards */}
      {isMobile ? (
        <Box>
          {sortedEquipments.map((equipment) => (
            <Card key={equipment.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="h6">{equipment.name}</Typography>
                    {equipment.categoryId && (
                      <Chip
                        label={getCategoryName(equipment.categoryId)}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(equipment.categoryId),
                          color: '#fff',
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditDialog(equipment)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleOpenDeleteDialog(equipment)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {equipment.description && (
                  <Typography variant="body2" color="textSecondary">
                    {equipment.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
          {sortedEquipments.length === 0 && (
            <Typography align="center" color="textSecondary">
              No Equipments added yet.
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Equipments table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedEquipmentIds.size > 0 &&
                      selectedEquipmentIds.size < sortedEquipments.length
                    }
                    checked={
                      sortedEquipments.length > 0 &&
                      selectedEquipmentIds.size === sortedEquipments.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Equipment Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEquipments.map((equipment) => (
                <TableRow
                  key={equipment.id}
                  hover
                  selected={selectedEquipmentIds.has(equipment.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedEquipmentIds.has(equipment.id)}
                      onChange={() => handleToggleSelect(equipment.id)}
                    />
                  </TableCell>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>
                    {equipment.categoryId ? (
                      <Chip
                        label={getCategoryName(equipment.categoryId)}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(equipment.categoryId),
                          color: '#fff',
                        }}
                      />
                    ) : (
                      <Chip label="Uncategorized" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>{equipment.description}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEditDialog(equipment)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenDeleteDialog(equipment)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {sortedEquipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Equipments added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add New Equipment</DialogTitle>
        <form onSubmit={handleAddEquipment} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Equipment Name"
                  name="name"
                  fullWidth
                  value={currentEquipment.name || ''}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={categories.find((cat) => cat.id === currentEquipment.categoryId) || null}
                  onChange={(_, newValue) => {
                    setCurrentEquipment((prev) => ({ ...prev, categoryId: newValue?.id }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      helperText="Optional: Assign to a category"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Chip
                        label={option.name}
                        size="small"
                        sx={{ backgroundColor: option.color, color: '#fff', mr: 1 }}
                      />
                    </li>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  value={currentEquipment.description || ''}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Cancel</Button>
            <Button type="submit" color="primary" variant="contained">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Equipment</DialogTitle>
        <form onSubmit={handleEditEquipment} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Equipment Name"
                  name="name"
                  fullWidth
                  value={currentEquipment.name || ''}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={categories.find((cat) => cat.id === currentEquipment.categoryId) || null}
                  onChange={(_, newValue) => {
                    setCurrentEquipment((prev) => ({ ...prev, categoryId: newValue?.id }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      helperText="Optional: Assign to a category"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Chip
                        label={option.name}
                        size="small"
                        sx={{ backgroundColor: option.color, color: '#fff', mr: 1 }}
                      />
                    </li>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  value={currentEquipment.description || ''}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" color="primary" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog
        open={openBatchImportDialog}
        onClose={handleCloseBatchImportDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Batch Import Equipment</DialogTitle>
        <form onSubmit={handleBatchImport} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Equipment Entries"
                  name="batchInput"
                  fullWidth
                  multiline
                  rows={4}
                  value={batchInput}
                  onChange={handleBatchInputChange}
                  error={Boolean(batchError)}
                  helperText={
                    batchError ||
                    'Enter equipment per line: name,description,category (all optional except name)\nExamples:\nDumbbell,Adjustable weight,Free Weights\nBarbell,,Strength\nKettlebell,For swings'
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={trimCsvFields}
                      onChange={(e) => setTrimCsvFields(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Trim whitespace from fields (recommended)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBatchImportDialog}>Cancel</Button>
            <Button type="submit" color="primary" variant="contained">
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
          <Button onClick={handleDeleteEquipment} color="secondary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={openBatchDeleteDialog} onClose={handleCloseBatchDeleteDialog}>
        <DialogTitle>Delete Selected Equipment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete <strong>{selectedEquipmentIds.size}</strong> equipment
            item(s)?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBatchDeleteDialog}>Cancel</Button>
          <Button onClick={handleBatchDelete} color="error" variant="contained">
            Delete {selectedEquipmentIds.size} Item(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EquipmentLibrary;
