// File: ./src/app/TrainingManager/EquipmentCategoryManager.tsx
'use strict';

import { Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
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
import React, { ChangeEvent, FormEvent, useContext, useState } from 'react';

import { EquipmentCategoryContext } from './contexts/EquipmentCategoryContext';
import { EquipmentContext } from './contexts/EquipmentContext';
import { EquipmentCategory } from './types';

const EquipmentCategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useContext(EquipmentCategoryContext);
  const { equipments } = useContext(EquipmentContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );

  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<EquipmentCategory>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof EquipmentCategory, string>>>({});

  // Count equipment per category
  const getEquipmentCount = (categoryId: string): number => {
    return equipments.filter((eq) => eq.categoryId === categoryId).length;
  };

  const handleOpenAddDialog = (): void => {
    setOpenAddDialog(true);
    setCurrentCategory({ color: '#4ECDC4' });
    setErrors({});
  };

  const handleCloseAddDialog = (): void => {
    setOpenAddDialog(false);
    setCurrentCategory({});
    setErrors({});
  };

  const handleOpenEditDialog = (category: EquipmentCategory): void => {
    setOpenEditDialog(true);
    setCurrentCategory({ ...category });
    setErrors({});
  };

  const handleCloseEditDialog = (): void => {
    setOpenEditDialog(false);
    setCurrentCategory({});
    setErrors({});
  };

  const handleOpenDeleteDialog = (category: EquipmentCategory): void => {
    setOpenDeleteDialog(true);
    setCurrentCategory({ ...category });
  };

  const handleCloseDeleteDialog = (): void => {
    setOpenDeleteDialog(false);
    setCurrentCategory({});
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Partial<Record<keyof EquipmentCategory, string>> = {};

    if (!currentCategory.name || currentCategory.name.trim() === '') {
      tempErrors.name = 'Category Name is required';
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === currentCategory.name?.trim().toLowerCase() &&
        cat.id !== currentCategory.id,
    );
    if (isDuplicate) {
      tempErrors.name = 'Category Name must be unique';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAddCategory = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate()) return;

    const newCategory: Omit<EquipmentCategory, 'id'> = {
      name: currentCategory.name!.trim(),
      description: currentCategory.description?.trim(),
      color: currentCategory.color?.trim() || '#4ECDC4',
    };

    addCategory(newCategory);
    setOpenAddDialog(false);
    setCurrentCategory({});
    setErrors({});
  };

  const handleEditCategory = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate()) return;

    const updatedCategory: EquipmentCategory = {
      id: currentCategory.id!,
      name: currentCategory.name!.trim(),
      description: currentCategory.description?.trim(),
      color: currentCategory.color?.trim() || '#4ECDC4',
    };

    updateCategory(updatedCategory);
    setOpenEditDialog(false);
    setCurrentCategory({});
    setErrors({});
  };

  const handleDeleteCategory = (): void => {
    if (currentCategory.id) {
      deleteCategory(currentCategory.id);
    }
    setOpenDeleteDialog(false);
    setCurrentCategory({});
  };

  return (
    <Paper style={{ padding: 16, margin: 'auto', maxWidth: 1000 }}>
      <Typography variant="h4" gutterBottom>
        Equipment Categories
      </Typography>
      <Grid container spacing={2} style={{ marginBottom: 16 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Add New Category
          </Button>
        </Grid>
      </Grid>

      {/* Categories Table/Cards */}
      {isMobile ? (
        <Box>
          {sortedCategories.map((category) => (
            <Card key={category.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={category.name}
                      size="medium"
                      sx={{
                        backgroundColor: category.color || '#4ECDC4',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      ({getEquipmentCount(category.id)} items)
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditDialog(category)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleOpenDeleteDialog(category)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {category.description && (
                  <Typography variant="body2" color="textSecondary">
                    {category.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
          {sortedCategories.length === 0 && (
            <Typography align="center" color="textSecondary">
              No Categories added yet.
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Categories table">
            <TableHead>
              <TableRow>
                <TableCell>Category Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Equipment Count</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Chip
                      label={category.name}
                      size="small"
                      sx={{
                        backgroundColor: category.color || '#4ECDC4',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{getEquipmentCount(category.id)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEditDialog(category)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenDeleteDialog(category)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {sortedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No Categories added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Category Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add New Category</DialogTitle>
        <form onSubmit={handleAddCategory} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Category Name"
                  name="name"
                  fullWidth
                  value={currentCategory.name || ''}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  value={currentCategory.description || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Color"
                  name="color"
                  type="color"
                  fullWidth
                  value={currentCategory.color || '#4ECDC4'}
                  onChange={handleChange}
                  helperText="Choose a color for this category"
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

      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Category</DialogTitle>
        <form onSubmit={handleEditCategory} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Category Name"
                  name="name"
                  fullWidth
                  value={currentCategory.name || ''}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  value={currentCategory.description || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Color"
                  name="color"
                  type="color"
                  fullWidth
                  value={currentCategory.color || '#4ECDC4'}
                  onChange={handleChange}
                  helperText="Choose a color for this category"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{currentCategory.name}</strong>?
          </Typography>
          {currentCategory.id && getEquipmentCount(currentCategory.id) > 0 && (
            <Typography color="warning.main" sx={{ mt: 2 }}>
              Warning: {getEquipmentCount(currentCategory.id)} equipment item(s) are assigned to
              this category. They will become uncategorized.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="secondary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EquipmentCategoryManager;
