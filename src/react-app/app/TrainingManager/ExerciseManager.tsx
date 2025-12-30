// File: ./src/app/Equipment/ExerciseManager.tsx

import { Add, Delete, Edit } from '@mui/icons-material';
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ChangeEvent, FormEvent, useContext, useState } from 'react';

import { EquipmentCategoryContext } from './contexts/EquipmentCategoryContext';
import { EquipmentContext } from './contexts/EquipmentContext';
import { ExerciseContext } from './contexts/ExerciseContext';
import { MuscleGroupContext } from './contexts/MuscleGroupContext';
import { Exercise } from './types';

// Styles for multiple select chips
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuPropsMultiple = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ExerciseManager: React.FC = () => {
  const {
    exercises,
    addExercise: contextAddExercise,
    updateExercise: contextUpdateExercise,
    deleteExercise: contextDeleteExercise,
  } = useContext(ExerciseContext);
  const { equipments } = useContext(EquipmentContext);
  const { categories } = useContext(EquipmentCategoryContext);
  const { muscleGroups } = useContext(MuscleGroupContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Debug: Log equipment count
  console.log('ExerciseManager - Equipment count:', equipments.length, equipments);

  // State for dialogs and forms
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openBatchDialog, setOpenBatchDialog] = useState<boolean>(false);
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({
    equipmentIds: [],
    muscleGroupIds: [],
  });
  const [batchInput, setBatchInput] = useState<string>('');
  const [batchResults, setBatchResults] = useState<{
    successful: string[];
    failed: { name: string; error: string }[];
  } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Exercise | 'batch', string>>>({});
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());
  const [openBatchDeleteDialog, setOpenBatchDeleteDialog] = useState<boolean>(false);

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setCurrentExercise({ equipmentIds: [], muscleGroupIds: [] });
    setErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (exercise: Exercise) => {
    setCurrentExercise({ ...exercise });
    setErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (exercise: Exercise) => {
    setCurrentExercise({ ...exercise });
    setOpenDeleteDialog(true);
  };

  const handleOpenBatchDialog = () => {
    setBatchInput('');
    setBatchResults(null);
    setErrors({});
    setOpenBatchDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setCurrentExercise({});
    setErrors({});
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentExercise({});
    setErrors({});
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentExercise({});
  };

  const handleCloseBatchDialog = () => {
    setOpenBatchDialog(false);
    setBatchInput('');
    setBatchResults(null);
    setErrors({});
  };

  // Handle input changes for single exercise form
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentExercise((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMuscleGroupChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setCurrentExercise((prev) => ({
      ...prev,
      muscleGroupIds: value,
    }));
  };

  // Handle batch input change
  const handleBatchInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBatchInput(e.target.value);
  };

  // Validation for single exercise
  const validateSingleExercise = (): boolean => {
    const current = currentExercise;
    const validationErrors: Partial<Record<keyof Exercise, string>> = {};

    if (!current.name || current.name.trim() === '') {
      validationErrors.name = 'Exercise Name is required';
    }

    if (
      !current.muscleGroupIds ||
      (Array.isArray(current.muscleGroupIds) && current.muscleGroupIds.length === 0)
    ) {
      validationErrors.muscleGroupIds = 'At least one Muscle Group must be selected';
    }

    if (
      !current.equipmentIds ||
      (Array.isArray(current.equipmentIds) && current.equipmentIds.length === 0)
    ) {
      validationErrors.equipmentIds = 'At least one Equipment must be selected';
    }

    const isDuplicate = exercises.some(
      (ex) => ex.name.toLowerCase() === current.name?.trim().toLowerCase() && ex.id !== current.id,
    );
    if (isDuplicate) {
      validationErrors.name = 'Exercise Name must be unique';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Validation and parsing for batch import with names instead of IDs
  const validateAndParseBatchExercises = (): {
    successful: string[];
    failed: { name: string; error: string }[];
  } => {
    const lines = batchInput
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');
    const successful: string[] = [];
    const failed: { name: string; error: string }[] = [];
    const existingNames = new Set(exercises.map((ex) => ex.name.toLowerCase()));
    const muscleGroupMap = new Map(muscleGroups.map((mg) => [mg.name.toLowerCase(), mg.id]));
    const equipmentMap = new Map(equipments.map((eq) => [eq.name.toLowerCase(), eq.id]));

    lines.forEach((line, index) => {
      const [name, muscleGroupsStr, equipmentsStr, how] = line
        .split('|')
        .map((part) => part.trim());

      if (!name) {
        failed.push({ name: `Line ${index + 1}`, error: 'Exercise Name is required' });
        return;
      }

      if (existingNames.has(name.toLowerCase())) {
        failed.push({ name, error: 'Exercise Name must be unique' });
        return;
      }

      const muscleGroupNames = muscleGroupsStr
        ? muscleGroupsStr.split(',').map((n) => n.trim())
        : [];
      if (muscleGroupNames.length === 0) {
        failed.push({ name, error: 'At least one Muscle Group must be provided' });
        return;
      }
      const muscleGroupIds: string[] = [];
      const invalidMuscleGroups: string[] = [];
      muscleGroupNames.forEach((mg) => {
        const id = muscleGroupMap.get(mg.toLowerCase());
        if (id) muscleGroupIds.push(id);
        else invalidMuscleGroups.push(mg);
      });
      if (invalidMuscleGroups.length > 0) {
        failed.push({
          name,
          error: `Invalid Muscle Group names: ${invalidMuscleGroups.join(', ')}`,
        });
        return;
      }

      const equipmentNames = equipmentsStr ? equipmentsStr.split(',').map((n) => n.trim()) : [];
      if (equipmentNames.length === 0) {
        failed.push({ name, error: 'At least one Equipment must be provided' });
        return;
      }
      const equipmentIds: string[] = [];
      const invalidEquipments: string[] = [];
      equipmentNames.forEach((eq) => {
        const id = equipmentMap.get(eq.toLowerCase());
        if (id) equipmentIds.push(id);
        else invalidEquipments.push(eq);
      });
      if (invalidEquipments.length > 0) {
        failed.push({ name, error: `Invalid Equipment names: ${invalidEquipments.join(', ')}` });
        return;
      }

      const newExercise: Omit<Exercise, 'id'> = {
        name,
        muscleGroupIds,
        equipmentIds,
        how: how || '',
      };

      contextAddExercise(newExercise);
      successful.push(name);
      existingNames.add(name.toLowerCase());
    });

    return { successful, failed };
  };

  // Handle adding a single exercise
  const handleAddExercise = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateSingleExercise()) return;

    const newExercise: Omit<Exercise, 'id'> = {
      name: currentExercise.name!.trim(),
      muscleGroupIds: currentExercise.muscleGroupIds!,
      equipmentIds: currentExercise.equipmentIds!,
      how: currentExercise.how?.trim() || '',
    };

    contextAddExercise(newExercise);
    handleCloseAddDialog();
  };

  // Handle editing an existing exercise
  const handleEditExercise = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateSingleExercise()) return;

    const updatedExercise: Exercise = {
      id: currentExercise.id!,
      name: currentExercise.name!.trim(),
      muscleGroupIds: currentExercise.muscleGroupIds!,
      equipmentIds: currentExercise.equipmentIds!,
      how: currentExercise.how?.trim() || '',
    };

    contextUpdateExercise(updatedExercise);
    handleCloseEditDialog();
  };

  // Handle batch import of exercises
  const handleBatchImport = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const results = validateAndParseBatchExercises();
    setBatchResults(results);
    if (results.failed.length === 0) {
      handleCloseBatchDialog();
    }
  };

  // Handle deleting an exercise
  const handleDeleteExercise = () => {
    if (!currentExercise.id) return;

    contextDeleteExercise(currentExercise.id);
    handleCloseDeleteDialog();
  };

  const handleToggleSelect = (id: string): void => {
    setSelectedExerciseIds((prev) => {
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
    if (selectedExerciseIds.size === exercises.length) {
      setSelectedExerciseIds(new Set());
    } else {
      setSelectedExerciseIds(new Set(exercises.map((ex) => ex.id)));
    }
  };

  const handleOpenBatchDeleteDialog = (): void => {
    setOpenBatchDeleteDialog(true);
  };

  const handleCloseBatchDeleteDialog = (): void => {
    setOpenBatchDeleteDialog(false);
  };

  const handleBatchDelete = (): void => {
    selectedExerciseIds.forEach((id) => contextDeleteExercise(id));
    setSelectedExerciseIds(new Set());
    setOpenBatchDeleteDialog(false);
  };

  return (
    <Paper style={{ padding: 16, margin: 'auto', maxWidth: 1200 }}>
      <Typography variant="h4" gutterBottom>
        Exercise Manager
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
          sx={{ mr: 2 }}
        >
          Add New Exercise
        </Button>
        <Button variant="contained" color="secondary" onClick={handleOpenBatchDialog}>
          Batch Import Exercises
        </Button>
        {selectedExerciseIds.size > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleOpenBatchDeleteDialog}
            sx={{ ml: 2 }}
          >
            Delete Selected ({selectedExerciseIds.size})
          </Button>
        )}
        {equipments.length === 0 && (
          <Typography
            variant="caption"
            color="warning.main"
            sx={{ ml: 2, display: 'block', mt: 1 }}
          >
            ⚠️ No equipment available. Please add equipment in the Equipment Library first.
          </Typography>
        )}
        {equipments.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 2, display: 'block', mt: 1 }}
          >
            {equipments.length} equipment item(s) available
          </Typography>
        )}
      </Box>

      {/* Exercises Table/Cards */}
      {isMobile ? (
        <Box>
          {exercises.map((exercise) => (
            <Card key={exercise.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">{exercise.name}</Typography>
                  <Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditDialog(exercise)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleOpenDeleteDialog(exercise)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Muscle Groups
                </Typography>
                <Box mb={1}>
                  {exercise.muscleGroupIds.map((id) => {
                    const group = muscleGroups.find((mg) => mg.id === id);
                    return group ? (
                      <Chip
                        key={id}
                        label={group.name}
                        size="small"
                        style={{ marginRight: 4, marginBottom: 4 }}
                      />
                    ) : null;
                  })}
                </Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Equipment
                </Typography>
                <Box mb={1}>
                  {exercise.equipmentIds.map((id) => {
                    const equipment = equipments.find((eq) => eq.id === id);
                    return equipment ? (
                      <Chip
                        key={id}
                        label={equipment.name}
                        color="secondary"
                        size="small"
                        style={{ marginRight: 4, marginBottom: 4 }}
                      />
                    ) : null;
                  })}
                </Box>
                {exercise.how && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      How
                    </Typography>
                    <Typography variant="body2">{exercise.how}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
          {exercises.length === 0 && (
            <Typography align="center" color="textSecondary">
              No Exercises added yet.
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Exercises table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedExerciseIds.size > 0 && selectedExerciseIds.size < exercises.length
                    }
                    checked={exercises.length > 0 && selectedExerciseIds.size === exercises.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Exercise Name</TableCell>
                <TableCell>Muscle Groups</TableCell>
                <TableCell>Equipments</TableCell>
                <TableCell>How</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id} hover selected={selectedExerciseIds.has(exercise.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedExerciseIds.has(exercise.id)}
                      onChange={() => handleToggleSelect(exercise.id)}
                    />
                  </TableCell>
                  <TableCell>{exercise.name}</TableCell>
                  <TableCell>
                    {exercise.muscleGroupIds.map((id) => {
                      const group = muscleGroups.find((mg) => mg.id === id);
                      return group ? (
                        <Chip
                          key={id}
                          label={group.name}
                          style={{ marginRight: 4, marginBottom: 4 }}
                        />
                      ) : null;
                    })}
                  </TableCell>
                  <TableCell>
                    {exercise.equipmentIds.map((id) => {
                      const equipment = equipments.find((eq) => eq.id === id);
                      return equipment ? (
                        <Chip
                          key={id}
                          label={equipment.name}
                          color="secondary"
                          style={{ marginRight: 4, marginBottom: 4 }}
                        />
                      ) : null;
                    })}
                  </TableCell>
                  <TableCell>{exercise.how || '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpenEditDialog(exercise)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenDeleteDialog(exercise)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {exercises.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Exercises added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Exercise Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="md">
        <DialogTitle>Add New Exercise</DialogTitle>
        <form onSubmit={handleAddExercise} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  label="Exercise Name"
                  name="name"
                  fullWidth
                  value={currentExercise.name || ''}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={
                    !currentExercise.equipmentIds || currentExercise.equipmentIds.length === 0
                  }
                  onClick={() => {
                    const selectedEquipment = equipments.filter((eq) =>
                      currentExercise.equipmentIds?.includes(eq.id),
                    );
                    if (selectedEquipment.length > 0) {
                      const equipmentNames = selectedEquipment.map((eq) => eq.name).join(' + ');
                      setCurrentExercise((prev) => ({ ...prev, name: equipmentNames }));
                    }
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  📝 Use equipment name
                  {currentExercise.equipmentIds && currentExercise.equipmentIds.length > 1
                    ? 's'
                    : ''}{' '}
                  as exercise name
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.muscleGroupIds)}>
                  <InputLabel id="muscle-group-label">Muscle Groups</InputLabel>
                  <Select
                    labelId="muscle-group-label"
                    multiple
                    name="muscleGroupIds"
                    value={currentExercise.muscleGroupIds || []}
                    onChange={handleMuscleGroupChange}
                    input={<OutlinedInput label="Muscle Groups" />}
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {(selected as string[]).map((value) => {
                          const group = muscleGroups.find((mg) => mg.id === value);
                          return group ? (
                            <Chip key={value} label={group.name} style={{ margin: 2 }} />
                          ) : null;
                        })}
                      </div>
                    )}
                    MenuProps={MenuPropsMultiple}
                  >
                    {muscleGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.muscleGroupIds && (
                    <Typography variant="caption" color="error">
                      {errors.muscleGroupIds}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  options={equipments}
                  value={equipments.filter((eq) => currentExercise.equipmentIds?.includes(eq.id))}
                  onChange={(_, newValue) => {
                    setCurrentExercise((prev) => ({
                      ...prev,
                      equipmentIds: newValue.map((eq) => eq.id),
                    }));
                  }}
                  getOptionLabel={(option) => option.name}
                  groupBy={(option) => {
                    if (!option.categoryId) return 'Uncategorized';
                    const category = categories.find((cat) => cat.id === option.categoryId);
                    return category?.name || 'Unknown Category';
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Equipments"
                      required
                      error={Boolean(errors.equipmentIds)}
                      helperText={errors.equipmentIds || 'Search by name or category'}
                    />
                  )}
                  renderOption={(props, option) => {
                    const category = categories.find((cat) => cat.id === option.categoryId);
                    return (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography sx={{ flexGrow: 1 }}>{option.name}</Typography>
                          {category && (
                            <Chip
                              label={category.name}
                              size="small"
                              sx={{ backgroundColor: category.color, color: '#fff' }}
                            />
                          )}
                        </Box>
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        color="secondary"
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="How"
                  name="how"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentExercise.how || ''}
                  onChange={handleChange}
                  error={Boolean(errors.how)}
                  helperText={errors.how || 'Optional: Describe how to perform the exercise'}
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

      {/* Edit Exercise Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Edit Exercise</DialogTitle>
        <form onSubmit={handleEditExercise} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  label="Exercise Name"
                  name="name"
                  fullWidth
                  value={currentExercise.name || ''}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={
                    !currentExercise.equipmentIds || currentExercise.equipmentIds.length === 0
                  }
                  onClick={() => {
                    const selectedEquipment = equipments.filter((eq) =>
                      currentExercise.equipmentIds?.includes(eq.id),
                    );
                    if (selectedEquipment.length > 0) {
                      const equipmentNames = selectedEquipment.map((eq) => eq.name).join(' + ');
                      setCurrentExercise((prev) => ({ ...prev, name: equipmentNames }));
                    }
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  📝 Use equipment name
                  {currentExercise.equipmentIds && currentExercise.equipmentIds.length > 1
                    ? 's'
                    : ''}{' '}
                  as exercise name
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.muscleGroupIds)}>
                  <InputLabel id="edit-muscle-group-label">Muscle Groups</InputLabel>
                  <Select
                    labelId="edit-muscle-group-label"
                    multiple
                    name="muscleGroupIds"
                    value={currentExercise.muscleGroupIds || []}
                    onChange={handleMuscleGroupChange}
                    input={<OutlinedInput label="Muscle Groups" />}
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {(selected as string[]).map((value) => {
                          const group = muscleGroups.find((mg) => mg.id === value);
                          return group ? (
                            <Chip key={value} label={group.name} style={{ margin: 2 }} />
                          ) : null;
                        })}
                      </div>
                    )}
                    MenuProps={MenuPropsMultiple}
                  >
                    {muscleGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.muscleGroupIds && (
                    <Typography variant="caption" color="error">
                      {errors.muscleGroupIds}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  options={equipments}
                  value={equipments.filter((eq) => currentExercise.equipmentIds?.includes(eq.id))}
                  onChange={(_, newValue) => {
                    setCurrentExercise((prev) => ({
                      ...prev,
                      equipmentIds: newValue.map((eq) => eq.id),
                    }));
                  }}
                  getOptionLabel={(option) => option.name}
                  groupBy={(option) => {
                    if (!option.categoryId) return 'Uncategorized';
                    const category = categories.find((cat) => cat.id === option.categoryId);
                    return category?.name || 'Unknown Category';
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Equipments"
                      required
                      error={Boolean(errors.equipmentIds)}
                      helperText={errors.equipmentIds || 'Search by name or category'}
                    />
                  )}
                  renderOption={(props, option) => {
                    const category = categories.find((cat) => cat.id === option.categoryId);
                    return (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography sx={{ flexGrow: 1 }}>{option.name}</Typography>
                          {category && (
                            <Chip
                              label={category.name}
                              size="small"
                              sx={{ backgroundColor: category.color, color: '#fff' }}
                            />
                          )}
                        </Box>
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        color="secondary"
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="How"
                  name="how"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentExercise.how || ''}
                  onChange={handleChange}
                  error={Boolean(errors.how)}
                  helperText={errors.how || 'Optional: Describe how to perform the exercise'}
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
      <Dialog open={openBatchDialog} onClose={handleCloseBatchDialog} fullWidth maxWidth="md">
        <DialogTitle>Batch Import Exercises</DialogTitle>
        <form onSubmit={handleBatchImport} noValidate>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              Enter exercises, one per line, in the format: Name | Muscle Group Names
              (comma-separated) | Equipment Names (comma-separated) | How (optional)
              <br />
              Example:
              <br />
              Squat | Quads, Glutes | Barbell | Stand with feet shoulder-width apart
              <br />
              Push-up | Chest | Bodyweight
            </Typography>
            <TextField
              label="Exercises List"
              fullWidth
              multiline
              rows={6}
              value={batchInput}
              onChange={handleBatchInputChange}
              error={Boolean(errors.batch)}
              helperText={errors.batch || 'Enter exercises as described above'}
            />
            {batchResults && (
              <Box sx={{ mt: 2 }}>
                {batchResults.successful.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="success.main">
                      Successfully Imported:
                    </Typography>
                    <List dense>
                      {batchResults.successful.map((name) => (
                        <ListItem key={name}>
                          <ListItemText primary={name} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                {batchResults.failed.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="error">
                      Failed to Import:
                    </Typography>
                    <List dense>
                      {batchResults.failed.map(({ name, error }) => (
                        <ListItem key={name}>
                          <ListItemText
                            primary={name}
                            secondary={error}
                            secondaryTypographyProps={{ color: 'error' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBatchDialog}>Close</Button>
            <Button type="submit" color="secondary" variant="contained">
              Import
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Exercise</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{currentExercise.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteExercise} color="secondary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={openBatchDeleteDialog} onClose={handleCloseBatchDeleteDialog}>
        <DialogTitle>Delete Selected Exercises</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete <strong>{selectedExerciseIds.size}</strong> exercise(s)?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBatchDeleteDialog}>Cancel</Button>
          <Button onClick={handleBatchDelete} color="error" variant="contained">
            Delete {selectedExerciseIds.size} Exercise(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ExerciseManager;
