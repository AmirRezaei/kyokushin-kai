import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
   Button,
   Chip,
   Divider,
   FormControl,
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import {useAuth} from '@/components/context/AuthContext';
import {useSnackbar} from '@/components/context/SnackbarContext';
import {PublishStatus} from '@/data/model/common';

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
   status: PublishStatus;
};

type SortDirection = 'asc' | 'desc';
type QuoteSortKey = 'author' | 'text' | 'status' | 'tags';

const defaultFormState: QuoteFormState = {
   author: '',
   text: '',
   meaning: '',
   tags: '',
   date: '',
   history: '',
   reference: '',
   status: 'draft',
};

const parseTags = (value: string): string[] =>
   value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

const QuoteManagementTab: React.FC = () => {
   const {token} = useAuth();
   const {showSnackbar} = useSnackbar();
   const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [showCreateRow, setShowCreateRow] = useState(false);
   const [formState, setFormState] = useState<QuoteFormState>(defaultFormState);
   const [search, setSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
   const [sortKey, setSortKey] = useState<QuoteSortKey>('author');
   const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

   const loadQuotes = useCallback(async () => {
      if (!token) return;
      setIsLoading(true);
      try {
         const res = await fetch('/api/v1/quotes', {
            headers: {Authorization: `Bearer ${token}`},
         });
         if (!res.ok) {
            throw new Error('Failed to load quotes');
         }
         const payload = (await res.json()) as {quotes?: QuoteRecord[]};
         setQuotes(Array.isArray(payload.quotes) ? payload.quotes : []);
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
         const haystack = [
            quote.author,
            quote.text,
            quote.meaning,
            quote.tags?.join(' '),
            quote.id,
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
         return haystack.includes(query);
      });
   }, [quotes, search, statusFilter]);

   const orderedQuotes = useMemo(() => {
      const compareStrings = (a: string, b: string) =>
         a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
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
         }
         if (result === 0) {
            result = compareStrings(a.id, b.id);
         }
         return sortDirection === 'asc' ? result : -result;
      });
   }, [filteredQuotes, sortDirection, sortKey]);

   const resetForm = () => {
      setEditingId(null);
      setFormState(defaultFormState);
      setShowCreateRow(false);
   };

   const handleShowCreateRow = () => {
      setEditingId(null);
      setFormState(defaultFormState);
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

      const payload: Partial<QuoteRecord> & {
         date?: string | null;
         history?: string | null;
         reference?: string | null;
      } = {
         author,
         text,
         meaning,
         status: formState.status,
         tags: parseTags(formState.tags),
         date: formState.date.trim() || null,
         history: formState.history.trim() || null,
         reference: formState.reference.trim() || null,
      };

      setIsSaving(true);
      try {
         const res = await fetch(
            editingId ? `/api/v1/quotes/${editingId}` : '/api/v1/quotes',
            {
               method: editingId ? 'PATCH' : 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(payload),
            },
         );
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
            headers: {Authorization: `Bearer ${token}`},
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
      <Paper elevation={2} sx={{p: 3}}>
         <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={600}>
               Quote Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
               Curate the quotes shown on the home screen.
            </Typography>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1} alignItems="flex-start">
               <Chip label={`${quotes.length} total`} />
               <Chip
                  label={`${quotes.filter((quote) => quote.status === 'published').length} published`}
                  color="success"
                  variant="outlined"
               />
            </Stack>
         </Stack>

         <Divider sx={{my: 2}} />

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
                  direction={{xs: 'column', sm: 'row'}}
                  alignItems={{xs: 'flex-start', sm: 'center'}}
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
               <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5}>
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
                        onChange={(event) =>
                           setStatusFilter(event.target.value as 'all' | PublishStatus)
                        }
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

            <TableContainer sx={{maxHeight: 520}}>
               <Table size="small" stickyHeader>
                  <TableHead>
                     <TableRow>
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
                     {showCreateRow && !editingId && (
                        <TableRow
                           sx={(theme) => ({
                              backgroundColor: theme.palette.action.hover,
                           })}
                        >
                           <TableCell sx={{verticalAlign: 'top'}}>
                              <Stack spacing={1}>
                                 <Typography variant="caption" color="text.secondary">
                                    Create new quote
                                 </Typography>
                                 <TextField
                                    label="Quote"
                                    value={formState.text}
                                    onChange={(event) =>
                                       setFormState((prev) => ({...prev, text: event.target.value}))
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
                                       setFormState((prev) => ({...prev, meaning: event.target.value}))
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
                                       setFormState((prev) => ({...prev, history: event.target.value}))
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
                           <TableCell sx={{verticalAlign: 'top'}}>
                              <Stack spacing={1}>
                                 <TextField
                                    label="Author"
                                    value={formState.author}
                                    onChange={(event) =>
                                       setFormState((prev) => ({...prev, author: event.target.value}))
                                    }
                                    size="small"
                                    fullWidth
                                 />
                                 <TextField
                                    label="Date"
                                    type="date"
                                    value={formState.date}
                                    onChange={(event) =>
                                       setFormState((prev) => ({...prev, date: event.target.value}))
                                    }
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{shrink: true}}
                                 />
                              </Stack>
                           </TableCell>
                           <TableCell sx={{verticalAlign: 'top'}}>
                              <Stack spacing={1}>
                                 <TextField
                                    label="Tags"
                                    value={formState.tags}
                                    onChange={(event) =>
                                       setFormState((prev) => ({...prev, tags: event.target.value}))
                                    }
                                    size="small"
                                    fullWidth
                                    helperText="Comma-separated"
                                 />
                              </Stack>
                           </TableCell>
                           <TableCell sx={{verticalAlign: 'top'}}>
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
                           <TableCell align="right" sx={{verticalAlign: 'top'}}>
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
                              <TableRow
                                 key={quote.id}
                                 hover
                                 sx={(theme) => ({
                                    backgroundColor: theme.palette.action.hover,
                                 })}
                              >
                                 <TableCell sx={{verticalAlign: 'top'}}>
                                    <Stack spacing={1}>
                                       <Typography variant="caption" color="text.secondary">
                                          Editing {quote.id}
                                       </Typography>
                                       <TextField
                                          label="Quote"
                                          value={formState.text}
                                          onChange={(event) =>
                                             setFormState((prev) => ({...prev, text: event.target.value}))
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
                                 <TableCell sx={{verticalAlign: 'top'}}>
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
                                             setFormState((prev) => ({...prev, date: event.target.value}))
                                          }
                                          size="small"
                                          fullWidth
                                          InputLabelProps={{shrink: true}}
                                       />
                                    </Stack>
                                 </TableCell>
                                 <TableCell sx={{verticalAlign: 'top'}}>
                                    <TextField
                                       label="Tags"
                                       value={formState.tags}
                                       onChange={(event) =>
                                          setFormState((prev) => ({...prev, tags: event.target.value}))
                                       }
                                       size="small"
                                       fullWidth
                                       helperText="Comma-separated"
                                    />
                                 </TableCell>
                                 <TableCell sx={{verticalAlign: 'top'}}>
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
                                 <TableCell align="right" sx={{verticalAlign: 'top'}}>
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
                              </TableRow>
                           );
                        }

                        return (
                           <TableRow key={quote.id} hover>
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
                           </TableRow>
                        );
                     })}
                     {!filteredQuotes.length && !isLoading && (
                        <TableRow>
                           <TableCell colSpan={5} align="center">
                              No quotes match the current filters.
                           </TableCell>
                        </TableRow>
                     )}
                     {isLoading && (
                        <TableRow>
                           <TableCell colSpan={5} align="center">
                              Loading quotes...
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </TableContainer>
         </Paper>
      </Paper>
   );
};

export default QuoteManagementTab;
