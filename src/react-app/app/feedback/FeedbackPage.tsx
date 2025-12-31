// File: ./src/app/feedback/FeedbackPage.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  Divider,
} from '@mui/material';
import { BugReport, Lightbulb, Add } from '@mui/icons-material';
import { nanoid } from 'nanoid';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';
import {
  fetchFeedback,
  fetchAdminFeedback,
  createFeedback,
  updateFeedback,
  updateAdminFeedback,
  getAppVersion,
  type AdminFeedback,
  type CreateFeedbackData,
} from '@/services/feedbackService';

type FeedbackType = 'bug' | 'feature';
type FeedbackStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix';
type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

const statusColors: Record<
  FeedbackStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning'
> = {
  open: 'primary',
  'in-progress': 'warning',
  resolved: 'success',
  closed: 'default',
  'wont-fix': 'error',
};

const priorityColors: Record<FeedbackPriority, 'default' | 'primary' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  critical: 'error',
};

type FeedbackPageMode = 'user' | 'admin';

type FeedbackPageProps = {
  mode?: FeedbackPageMode;
};

export default function FeedbackPage({ mode = 'user' }: FeedbackPageProps) {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();

  const [feedbackList, setFeedbackList] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | FeedbackType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | FeedbackStatus>('all');
  const isAdminView = mode === 'admin';

  // Form state
  const [openDialog, setOpenDialog] = useState(false);
  const [formType, setFormType] = useState<FeedbackType>('bug');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<FeedbackPriority>('medium');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<FeedbackStatus>('open');
  const [editPriority, setEditPriority] = useState<FeedbackPriority>('medium');
  const [editVersion, setEditVersion] = useState(0);

  useEffect(() => {
    void loadFeedback();
    if (!isAdminView) {
      void loadAppVersion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminView, token]);

  // Handle URL parameters for pre-filling the form
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const pageParam = searchParams.get('page');

    if ((typeParam || pageParam) && !isAdminView) {
      // Set form type if provided
      if (typeParam === 'bug' || typeParam === 'feature') {
        setFormType(typeParam);
      }

      // Pre-fill title with page name if provided
      if (pageParam) {
        const titlePrefix = typeParam === 'feature' ? 'Feature request for' : 'Issue on';
        setFormTitle(`${titlePrefix} ${pageParam}`);
      }

      // Open the dialog
      setOpenDialog(true);

      // Clear URL parameters to avoid re-triggering
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const loadFeedback = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = isAdminView ? await fetchAdminFeedback(token) : await fetchFeedback(token);
      setFeedbackList(data);
    } catch (error) {
      showSnackbar('Failed to load feedback', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppVersion = async () => {
    try {
      const data = await getAppVersion();
      setAppVersion(data.version);
    } catch (error) {
      console.error('Failed to load app version:', error);
      setAppVersion('1.0.0'); // Fallback
    }
  };

  const handleOpenDialog = () => {
    setFormType('bug');
    setFormTitle('');
    setFormDescription('');
    setFormPriority('medium');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (isAdminView) return;
    if (!formTitle.trim() || !formDescription.trim()) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateFeedbackData = {
        id: nanoid(),
        type: formType,
        title: formTitle.trim(),
        description: formDescription.trim(),
        appVersion,
        browserInfo: navigator.userAgent,
        priority: formPriority,
      };

      const newFeedback = await createFeedback(token, data);
      setFeedbackList((prev) => [newFeedback, ...prev]);
      showSnackbar('Feedback submitted successfully', 'success');
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Failed to submit feedback', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feedback: AdminFeedback) => {
    setEditingId(feedback.id);
    setEditTitle(feedback.title);
    setEditDescription(feedback.description);
    setEditStatus(feedback.status);
    setEditPriority(feedback.priority);
    setEditVersion(feedback.version);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!token) return;
    try {
      const patch = {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
      };
      const updated = isAdminView
        ? await updateAdminFeedback(token, id, editVersion, patch)
        : await updateFeedback(token, id, editVersion, patch);

      setFeedbackList((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showSnackbar('Feedback updated successfully', 'success');
      setEditingId(null);
    } catch (error) {
      if (error instanceof Error && error.message === 'CONFLICT') {
        showSnackbar('Conflict detected. Please refresh and try again.', 'error');
        void loadFeedback();
      } else {
        showSnackbar('Failed to update feedback', 'error');
      }
      console.error(error);
    }
  };

  const filteredFeedback = feedbackList.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isAdminView ? 'Feedback Management' : 'Bug Reports & Feature Requests'}
        </Typography>
        {!isAdminView && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            App Version: {appVersion}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {!isAdminView && (
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            Submit Feedback
          </Button>
        )}

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="bug">Bugs</MenuItem>
            <MenuItem value="feature">Features</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="wont-fix">Won't Fix</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredFeedback.length === 0 ? (
        <Alert severity="info">
          No feedback found. Submit your first bug report or feature request!
        </Alert>
      ) : (
        <Stack spacing={2}>
          {filteredFeedback.map((item) => (
            <Card key={item.id} variant="outlined">
              <CardContent>
                {editingId === item.id ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editStatus}
                          label="Status"
                          onChange={(e) => setEditStatus(e.target.value as FeedbackStatus)}
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                          <MenuItem value="closed">Closed</MenuItem>
                          <MenuItem value="wont-fix">Won't Fix</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={editPriority}
                          label="Priority"
                          onChange={(e) => setEditPriority(e.target.value as FeedbackPriority)}
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveEdit(item.id)}
                      >
                        Save
                      </Button>
                      <Button variant="outlined" size="small" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {item.type === 'bug' ? (
                        <BugReport color="error" />
                      ) : (
                        <Lightbulb color="primary" />
                      )}
                      <Typography variant="h6">{item.title}</Typography>
                      <Chip label={item.status} color={statusColors[item.status]} size="small" />
                      <Chip
                        label={item.priority}
                        color={priorityColors[item.priority]}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
                    >
                      {item.description}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {isAdminView ? `User: ${item.email || item.userId} | ` : ''}
                        Version: {item.appVersion} | Created:{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                      <Button size="small" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Submit Dialog */}
      <Dialog open={!isAdminView && openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Tabs value={formType} onChange={(_, value) => setFormType(value)} sx={{ mb: 2 }}>
              <Tab label="Bug Report" value="bug" icon={<BugReport />} iconPosition="start" />
              <Tab
                label="Feature Request"
                value="feature"
                icon={<Lightbulb />}
                iconPosition="start"
              />
            </Tabs>

            <TextField
              fullWidth
              label="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
              inputProps={{ maxLength: 200 }}
              helperText={`${formTitle.length}/200`}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              sx={{ mb: 2 }}
              required
              placeholder={
                formType === 'bug'
                  ? 'Please describe the bug, steps to reproduce, and expected vs actual behavior...'
                  : 'Please describe the feature you would like to see...'
              }
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formPriority}
                label="Priority"
                onChange={(e) => setFormPriority(e.target.value as FeedbackPriority)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info" sx={{ mb: 2 }}>
              App Version: {appVersion}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formTitle.trim() || !formDescription.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
