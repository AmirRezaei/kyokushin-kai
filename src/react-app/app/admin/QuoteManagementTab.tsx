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

type QuoteRecord = {
  id: string;
  author: string;
  tags: string[];
  date?: string;
  text: string;
  meaning: string;
  history?: string;
  reference?: string;
  status: PublishStatus;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
};

type QuoteFormState = {
  author: string;
  text: string;
  meaning: string;
  tags: string;
  date: string;
  history: string;
  reference: string;
  sortOrder: number | '';
  status: PublishStatus;
};

type SortDirection = 'asc' | 'desc';
type QuoteSortKey = 'author' | 'text' | 'status' | 'tags' | 'sortOrder';

const defaultFormState: QuoteFormState = {
  author: '',
  text: '',
  meaning: '',
  tags: '',
  date: '',
  history: '',
  reference: '',
  sortOrder: '',
  status: 'draft',
};

const parseTags = (value: string): string[] =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

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

const QuoteManagementTab: React.FC = () => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [formState, setFormState] = useState<QuoteFormState>(defaultFormState);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [sortKey, setSortKey] = useState<QuoteSortKey>('sortOrder');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const loadQuotes = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/quotes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load quotes');
      }
      const payload = (await res.json()) as { quotes?: QuoteRecord[] };
      const loaded = Array.isArray(payload.quotes) ? payload.quotes : [];
      // Sort by sortOrder by default
      loaded.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setQuotes(loaded);
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to load quotes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar, token]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const haystack = [quote.author, quote.text, quote.meaning, quote.tags?.join(' '), quote.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [quotes, search, statusFilter]);

  const orderedQuotes = useMemo(() => {
    const compareStrings = (a: string, b: string) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    const statusOrder: Record<PublishStatus, number> = {
      published: 0,
      draft: 1,
      inactive: 2,
    };

    return [...filteredQuotes].sort((a, b) => {
      let result = 0;
      switch (sortKey) {
        case 'author':
          result = compareStrings(a.author, b.author);
          break;
        case 'text':
          result = compareStrings(a.text, b.text);
          break;
        case 'status':
          result = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'tags':
          result = (a.tags?.length || 0) - (b.tags?.length || 0);
          break;
        case 'sortOrder':
          result = (a.sortOrder || 0) - (b.sortOrder || 0);
          break;
      }
      if (result === 0) {
        result = compareStrings(a.id, b.id);
      }
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredQuotes, sortDirection, sortKey]);

  // DND Sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Only allow drag reordering effectively if we are sorted by sortOrder and no filter is active?
    // Or just always apply it to the underlying list.
    // Safe approach: find indices in the full `quotes` list.

    const oldIndex = quotes.findIndex((item) => item.id === active.id);
    const newIndex = quotes.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(quotes, oldIndex, newIndex);

    // Optimistic update
    const updated = newOrder.map((q, index) => ({
      ...q,
      sortOrder: index + 1,
    }));

    setQuotes(updated);

    if (!token) return;

    try {
      // Process sequentially to persist order
      for (const q of updated) {
        await fetch(`/api/v1/quotes/${q.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sortOrder: q.sortOrder }),
        });
      }
    } catch (err) {
      console.error('Failed to save order', err);
      showSnackbar('Failed to save new order', 'error');
      loadQuotes();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setShowCreateRow(false);
  };

  const handleShowCreateRow = () => {
    setEditingId(null);
    const maxOrder = quotes.reduce((max, q) => Math.max(max, q.sortOrder || 0), 0);
    setFormState({
      ...defaultFormState,
      sortOrder: maxOrder + 1,
    });
    setShowCreateRow(true);
  };

  const handleEditQuote = (quote: QuoteRecord) => {
    setShowCreateRow(false);
    setEditingId(quote.id);
    setFormState({
      author: quote.author || '',
      text: quote.text || '',
      meaning: quote.meaning || '',
      tags: quote.tags?.join(', ') || '',
      date: quote.date || '',
      history: quote.history || '',
      reference: quote.reference || '',
      sortOrder: quote.sortOrder ?? '',
      status: quote.status,
    });
  };

  const handleSaveQuote = async () => {
    if (!token) return;

    const author = formState.author.trim();
    const text = formState.text.trim();
    const meaning = formState.meaning.trim();

    if (!author || !text || !meaning) {
      showSnackbar('Author, quote, and meaning are required', 'warning');
      return;
    }

    const payload: Partial<QuoteRecord> = {
      author,
      text,
      meaning,
      status: formState.status,
      tags: parseTags(formState.tags),
      date: formState.date.trim(),
      history: formState.history.trim(),
      reference: formState.reference.trim(),
      sortOrder: typeof formState.sortOrder === 'number' ? formState.sortOrder : 0,
    };

    setIsSaving(true);
    try {
      const res = await fetch(editingId ? `/api/v1/quotes/${editingId}` : '/api/v1/quotes', {
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

      showSnackbar(editingId ? 'Quote updated' : 'Quote created', 'success');
      resetForm();
      await loadQuotes();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to save quote', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/quotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      showSnackbar('Quote deleted', 'success');
      if (editingId === id) {
        resetForm();
      }
      await loadQuotes();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to delete quote', 'error');
    }
  };

  const handleSort = (key: QuoteSortKey) => {
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
          Quote Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Curate the quotes shown on the home screen.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
          <Chip label={`${quotes.length} total`} />
          <Chip
            label={`${quotes.filter((quote) => quote.status === 'published').length} published`}
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
                Quote Library
              </Typography>
              <Chip label={`${filteredQuotes.length} shown`} size="small" />
            </Stack>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={handleShowCreateRow}
              disabled={Boolean(editingId)}
            >
              Add Quote
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
              <InputLabel id="quote-filter-status">Status</InputLabel>
              <Select
                labelId="quote-filter-status"
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
                  <TableCell sortDirection={sortKey === 'text' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortKey === 'text'}
                      direction={sortKey === 'text' ? sortDirection : 'asc'}
                      onClick={() => handleSort('text')}
                    >
                      Quote
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortKey === 'author' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortKey === 'author'}
                      direction={sortKey === 'author' ? sortDirection : 'asc'}
                      onClick={() => handleSort('author')}
                    >
                      Author
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortKey === 'tags' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortKey === 'tags'}
                      direction={sortKey === 'tags' ? sortDirection : 'asc'}
                      onClick={() => handleSort('tags')}
                    >
                      Tags
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
                <SortableContext items={orderedQuotes} strategy={verticalListSortingStrategy}>
                  {showCreateRow && !editingId && (
                    <TableRow
                      sx={(theme) => ({
                        backgroundColor: theme.palette.action.hover,
                      })}
                    >
                      <TableCell />
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Create new quote
                          </Typography>
                          <TextField
                            label="Quote"
                            value={formState.text}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, text: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            multiline
                            minRows={3}
                          />
                          <TextField
                            label="Meaning"
                            value={formState.meaning}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, meaning: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                          />
                          <TextField
                            label="History"
                            value={formState.history}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, history: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                          />
                          <TextField
                            label="Reference"
                            value={formState.reference}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                reference: event.target.value,
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
                            label="Author"
                            value={formState.author}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, author: event.target.value }))
                            }
                            size="small"
                            fullWidth
                          />
                          <TextField
                            label="Date"
                            type="date"
                            value={formState.date}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, date: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Stack spacing={1}>
                          <TextField
                            label="Tags"
                            value={formState.tags}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, tags: event.target.value }))
                            }
                            size="small"
                            fullWidth
                            helperText="Comma-separated"
                          />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <FormControl size="small" fullWidth>
                          <InputLabel id="quote-status-label">Status</InputLabel>
                          <Select
                            labelId="quote-status-label"
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
                            onClick={handleSaveQuote}
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
                  {orderedQuotes.map((quote) => {
                    if (editingId === quote.id) {
                      return (
                        <SortableTableRow key={quote.id} id={quote.id} disabled>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary">
                                Editing {quote.id}
                              </Typography>
                              <TextField
                                label="Quote"
                                value={formState.text}
                                onChange={(event) =>
                                  setFormState((prev) => ({ ...prev, text: event.target.value }))
                                }
                                size="small"
                                fullWidth
                                multiline
                                minRows={3}
                              />
                              <TextField
                                label="Meaning"
                                value={formState.meaning}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    meaning: event.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                              />
                              <TextField
                                label="History"
                                value={formState.history}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    history: event.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                              />
                              <TextField
                                label="Reference"
                                value={formState.reference}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    reference: event.target.value,
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
                                label="Author"
                                value={formState.author}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    author: event.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                              />
                              <TextField
                                label="Date"
                                type="date"
                                value={formState.date}
                                onChange={(event) =>
                                  setFormState((prev) => ({ ...prev, date: event.target.value }))
                                }
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <TextField
                              label="Tags"
                              value={formState.tags}
                              onChange={(event) =>
                                setFormState((prev) => ({ ...prev, tags: event.target.value }))
                              }
                              size="small"
                              fullWidth
                              helperText="Comma-separated"
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <FormControl size="small" fullWidth>
                              <InputLabel id="quote-status-label-edit">Status</InputLabel>
                              <Select
                                labelId="quote-status-label-edit"
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
                                onClick={handleSaveQuote}
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
                      <SortableTableRow key={quote.id} id={quote.id}>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={600}>
                              {quote.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {quote.meaning}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={600}>
                              {quote.author}
                            </Typography>
                            {quote.date && (
                              <Typography variant="caption" color="text.secondary">
                                {quote.date}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {quote.tags?.slice(0, 3).map((tag) => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
                            {quote.tags && quote.tags.length > 3 && (
                              <Chip label={`+${quote.tags.length - 3}`} size="small" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={quote.status}
                            size="small"
                            color={
                              quote.status === 'published'
                                ? 'success'
                                : quote.status === 'draft'
                                  ? 'warning'
                                  : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              onClick={() => handleEditQuote(quote)}
                              disabled={Boolean(editingId)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteQuote(quote.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </SortableTableRow>
                    );
                  })}
                </SortableContext>
                {!filteredQuotes.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No quotes match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading quotes...
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

export default QuoteManagementTab;
