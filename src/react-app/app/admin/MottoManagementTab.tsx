import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';
import { PublishStatus } from '../../../data/model/common';

type MottoRecord = {
  id: string;
  shortTitle: string;
  text: string;
  details?: string;
  sortOrder?: number;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

type MottoFormState = {
  shortTitle: string;
  text: string;
  details: string;
  sortOrder: number | '';
  status: PublishStatus;
};

type SortDirection = 'asc' | 'desc';
type MottoSortKey = 'shortTitle' | 'text' | 'status' | 'sortOrder';

const defaultFormState: MottoFormState = {
  shortTitle: '',
  text: '',
  details: '',
  sortOrder: '',
  status: 'draft',
};

const SortableTableRow = ({
  id,
  children,
  isDragging,
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'default' : 'grab',
  };

  return (
    <TableRow ref={setNodeRef} style={style} hover>
      <TableCell padding="checkbox">
        {!disabled && (
          <IconButton size="small" {...attributes} {...listeners}>
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        )}
      </TableCell>
      {children}
    </TableRow>
  );
};

const MottoManagementTab: React.FC = () => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [mottos, setMottos] = useState<MottoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [formState, setFormState] = useState<MottoFormState>(defaultFormState);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [sortKey, setSortKey] = useState<MottoSortKey>('shortTitle');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const loadMottos = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/mottos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load mottos');
      }
      const payload = (await res.json()) as { mottos?: MottoRecord[] };
      const loadedMottos = Array.isArray(payload.mottos) ? payload.mottos : [];
      // Sort by sortOrder by default for internal consistency before dnd
      loadedMottos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setMottos(loadedMottos);
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to load mottos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar, token]);

  useEffect(() => {
    loadMottos();
  }, [loadMottos]);

  const filteredMottos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mottos.filter((motto) => {
      const matchesStatus = statusFilter === 'all' || motto.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const haystack = [motto.shortTitle, motto.text, motto.details, motto.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [mottos, search, statusFilter]);

  // DND Sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mottos.findIndex((item) => item.id === active.id);
    const newIndex = mottos.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(mottos, oldIndex, newIndex);

    // Optimistic update of sortOrder locally
    const updatedMottos = newOrder.map((motto, index) => ({
      ...motto,
      sortOrder: index + 1,
    }));

    setMottos(updatedMottos);

    // Persist changes sequentially
    if (!token) return;

    try {
      for (const motto of updatedMottos) {
        await fetch(`/api/v1/mottos/${motto.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sortOrder: motto.sortOrder }),
        });
      }
    } catch (err) {
      console.error('Failed to save order', err);
      showSnackbar('Failed to save new order', 'error');
      loadMottos(); // Revert to server state
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setShowCreateRow(false);
  };

  const handleShowCreateRow = () => {
    setEditingId(null);
    const maxSortOrder = mottos.reduce((max, motto) => {
      const order = motto.sortOrder || 0;
      return order > max ? order : max;
    }, 0);
    setFormState({
      ...defaultFormState,
      sortOrder: maxSortOrder + 1,
    });
    setShowCreateRow(true);
  };

  const handleEditMotto = (motto: MottoRecord) => {
    setShowCreateRow(false);
    setEditingId(motto.id);
    setFormState({
      shortTitle: motto.shortTitle || '',
      text: motto.text || '',
      details: motto.details || '',
      sortOrder: motto.sortOrder ?? '',
      status: motto.status,
    });
  };

  const handleSaveMotto = async () => {
    if (!token) return;

    const shortTitle = formState.shortTitle.trim();
    const text = formState.text.trim();

    if (!shortTitle || !text) {
      showSnackbar('Short title and text are required', 'warning');
      return;
    }

    const payload: Partial<MottoRecord> = {
      shortTitle,
      text,
      details: formState.details.trim(),
      sortOrder: typeof formState.sortOrder === 'number' ? formState.sortOrder : 0,
      status: formState.status,
    };

    setIsSaving(true);
    try {
      const res = await fetch(editingId ? `/api/v1/mottos/${editingId}` : '/api/v1/mottos', {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }

      showSnackbar(editingId ? 'Motto updated' : 'Motto created', 'success');
      resetForm();
      await loadMottos();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to save motto', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMotto = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/mottos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      showSnackbar('Motto deleted', 'success');
      if (editingId === id) {
        resetForm();
      }
      await loadMottos();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to delete motto', 'error');
    }
  };

  const handleSort = (key: MottoSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6" fontWeight={600}>
          Motto Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage the Kyokushin Mottos displayed on the motto deck.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
          <Chip label={`${mottos.length} total`} />
          <Chip
            label={`${mottos.filter((m) => m.status === 'published').length} published`}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                Motto Library
              </Typography>
              <Chip label={`${filteredMottos.length} shown`} size="small" />
            </Stack>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={handleShowCreateRow}
              disabled={Boolean(editingId)}
            >
              Add Motto
            </Button>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="motto-filter-status">Status</InputLabel>
              <Select
                labelId="motto-filter-status"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | PublishStatus)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Divider />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell sortDirection={sortKey === 'shortTitle' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortKey === 'shortTitle'}
                      direction={sortKey === 'shortTitle' ? sortDirection : 'asc'}
                      onClick={() => handleSort('shortTitle')}
                    >
                      Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortKey === 'text' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortKey === 'text'}
                      direction={sortKey === 'text' ? sortDirection : 'asc'}
                      onClick={() => handleSort('text')}
                    >
                      Text
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortKey === 'status' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortKey === 'status'}
                      direction={sortKey === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <SortableContext items={mottos} strategy={verticalListSortingStrategy}>
                  {showCreateRow && !editingId && (
                    <TableRow
                      sx={(theme) => ({
                        backgroundColor: theme.palette.action.hover,
                      })}
                    >
                      <TableCell /> {/* Placeholder for drag handle */}
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Stack spacing={1}>
                          <TextField
                            label="Short Title"
                            value={formState.shortTitle}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                shortTitle: event.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                          />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Stack spacing={1}>
                          <TextField
                            label="Text"
                            value={formState.text}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, text: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                          />
                          <TextField
                            label="Details"
                            value={formState.details}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, details: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <FormControl size="small" fullWidth>
                          <InputLabel id="motto-status-label">Status</InputLabel>
                          <Select
                            labelId="motto-status-label"
                            label="Status"
                            value={formState.status}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                status: event.target.value as PublishStatus,
                              }))
                            }
                          >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleSaveMotto}
                            disabled={isSaving}
                          >
                            Create
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={resetForm}
                            disabled={isSaving}
                          >
                            Clear
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                  {mottos.map((motto) => {
                    if (editingId === motto.id) {
                      return (
                        <SortableTableRow key={motto.id} id={motto.id} disabled>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <Stack spacing={1}>
                              <TextField
                                label="Short Title"
                                value={formState.shortTitle}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    shortTitle: event.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                              />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <Stack spacing={1}>
                              <TextField
                                label="Text"
                                value={formState.text}
                                onChange={(event) =>
                                  setFormState((prev) => ({ ...prev, text: event.target.value }))
                                }
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                              />
                              <TextField
                                label="Details"
                                value={formState.details}
                                onChange={(event) =>
                                  setFormState((prev) => ({ ...prev, details: event.target.value }))
                                }
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <FormControl size="small" fullWidth>
                              <InputLabel id="motto-status-label-edit">Status</InputLabel>
                              <Select
                                labelId="motto-status-label-edit"
                                label="Status"
                                value={formState.status}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    status: event.target.value as PublishStatus,
                                  }))
                                }
                              >
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="contained"
                                onClick={handleSaveMotto}
                                disabled={isSaving}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={resetForm}
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </TableCell>
                        </SortableTableRow>
                      );
                    }

                    return (
                      <SortableTableRow key={motto.id} id={motto.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {motto.shortTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2">{motto.text}</Typography>
                            {motto.details && (
                              <Typography variant="caption" color="text.secondary">
                                {motto.details.substring(0, 100)}
                                {motto.details.length > 100 ? '...' : ''}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={motto.status}
                            size="small"
                            color={
                              motto.status === 'published'
                                ? 'success'
                                : motto.status === 'draft'
                                  ? 'warning'
                                  : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              onClick={() => handleEditMotto(motto)}
                              disabled={Boolean(editingId)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteMotto(motto.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </SortableTableRow>
                    );
                  })}
                </SortableContext>
                {!filteredMottos.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No mottos match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading mottos...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DndContext>
      </Paper>
    </Paper>
  );
};

export default MottoManagementTab;
