import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useState } from 'react';

import { ScheduledSession, ScheduledSessionFormData } from '@/types/trainingSessionTypes';

interface ScheduledSessionManagerProps {
  scheduledSessions: ScheduledSession[];
  onAdd: (data: ScheduledSessionFormData) => void;
  onUpdate: (id: string, data: ScheduledSessionFormData) => void;
  onDelete: (id: string) => void;
}

const ScheduledSessionManager: React.FC<ScheduledSessionManagerProps> = ({
  scheduledSessions,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduledSessionFormData>({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '18:00',
    durationMinutes: 90,
    recurrence: 'weekly',
    color: '#e3f2fd',
    type: 'Kihon',
    selectedWeekdays: [],
  });

  const handleOpenDialog = (session?: ScheduledSession) => {
    if (session) {
      setEditingId(session.id);
      setFormData({
        name: session.name,
        startDate: session.startDate,
        endDate: session.endDate,
        startTime: session.startTime,
        durationMinutes: session.durationMinutes,
        recurrence: session.recurrence,
        color: session.color || '#e3f2fd',
        type: session.type || '',
        selectedWeekdays: session.selectedWeekdays || [],
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '18:00',
        durationMinutes: 90,
        recurrence: 'weekly',
        color: '#e3f2fd',
        type: 'Kihon',
        selectedWeekdays: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const calculateHours = (minutes: number) => {
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours}h` : `${hours}h`; // e.g., 1.5h
  };

  const handleSubmit = () => {
    if (editingId) {
      onUpdate(editingId, formData);
    } else {
      onAdd(formData);
    }
    handleCloseDialog();
  };

  const getRecurrenceLabel = (session: ScheduledSession) => {
    if (
      session.recurrence === 'weekly' &&
      session.selectedWeekdays &&
      session.selectedWeekdays.length > 0
    ) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Sort weekdays to be in order
      const sorted = [...session.selectedWeekdays].sort((a, b) => a - b);
      return `Weekly on ${sorted.map((d) => days[d]).join(', ')}`;
    }

    switch (session.recurrence) {
      case 'daily':
        return 'Every Day';
      case 'weekly':
        return 'Every Week';
      case 'monthly':
        return 'Every Month';
      case 'yearly':
        return 'Every Year';
      default:
        return session.recurrence;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const activeSessions = scheduledSessions.filter(
    (session) => !session.endDate || session.endDate >= today,
  );

  const archivedSessions = scheduledSessions.filter(
    (session) => session.endDate && session.endDate < today,
  );

  const handleWeekdaysChange = (_event: React.MouseEvent<HTMLElement>, newWeekdays: number[]) => {
    setFormData({ ...formData, selectedWeekdays: newWeekdays });
  };

  const renderSessionCard = (session: ScheduledSession) => (
    <Card key={session.id} variant="outlined">
      <CardContent sx={{ pb: '16px !important' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
              {session.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<EventIcon sx={{ fontSize: '1rem !important' }} />}
                label={`${getRecurrenceLabel(session)} at ${session.startTime}`}
                size="small"
                variant="outlined"
              />
              {session.type && (
                <Chip label={session.type} size="small" variant="outlined" color="primary" />
              )}
              <Chip
                label={`${calculateHours(session.durationMinutes)} (${session.durationMinutes}min)`}
                size="small"
                variant="outlined"
              />
              <Chip label={`From ${session.startDate}`} size="small" variant="outlined" />
              {session.endDate && (
                <Chip
                  label={`Until ${session.endDate}`}
                  size="small"
                  variant="outlined"
                  color={session.endDate < today ? 'default' : 'secondary'}
                />
              )}
              {session.color && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: session.color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              )}
            </Stack>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => handleOpenDialog(session)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(session.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Scheduled Sessions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Add Schedule
        </Button>
      </Box>

      {scheduledSessions.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No scheduled sessions found. Create one to get started!
        </Typography>
      ) : (
        <Stack spacing={4}>
          {activeSessions.length > 0 && (
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 600, mb: 1, display: 'block' }}
              >
                Active Sessions ({activeSessions.length})
              </Typography>
              <Stack spacing={2}>{activeSessions.map(renderSessionCard)}</Stack>
            </Box>
          )}

          {archivedSessions.length > 0 && (
            <Box>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 600, mb: 1, display: 'block' }}
              >
                Archived Sessions (Ended) ({archivedSessions.length})
              </Typography>
              <Stack spacing={2} sx={{ opacity: 0.7 }}>
                {archivedSessions.map(renderSessionCard)}
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'aaaEdit Schedule' : 'New Schedule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Session Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={['Kata', 'Kumite', 'Kihon', 'Conditioning']}
                value={formData.type || ''}
                onInputChange={(_, newValue) => {
                  setFormData({ ...formData, type: newValue });
                }}
                renderInput={(params) => <TextField {...params} label="Training Type" fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Recurrence</InputLabel>
                <Select
                  value={formData.recurrence}
                  label="Recurrence"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrence: e.target.value as ScheduledSession['recurrence'],
                    })
                  }
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly / Specific Days</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.recurrence === 'weekly' && (
              <Grid item xs={12}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Days
                  </Typography>
                  <Typography variant="caption" color="text.secondary" mb={1}>
                    Leave empty for "Every Week" (or select all 7 days).
                  </Typography>

                  <ToggleButtonGroup
                    value={formData.selectedWeekdays}
                    onChange={handleWeekdaysChange}
                    aria-label="weekdays"
                    fullWidth
                    size="small"
                    sx={{ mb: 1.5 }}
                  >
                    <ToggleButton value={1} aria-label="Monday">
                      M
                    </ToggleButton>
                    <ToggleButton value={2} aria-label="Tuesday">
                      T
                    </ToggleButton>
                    <ToggleButton value={3} aria-label="Wednesday">
                      W
                    </ToggleButton>
                    <ToggleButton value={4} aria-label="Thursday">
                      T
                    </ToggleButton>
                    <ToggleButton value={5} aria-label="Friday">
                      F
                    </ToggleButton>
                    <ToggleButton value={6} aria-label="Saturday">
                      S
                    </ToggleButton>
                    <ToggleButton value={0} aria-label="Sunday">
                      S
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                    <Chip
                      label="Weekdays"
                      onClick={() =>
                        setFormData({ ...formData, selectedWeekdays: [1, 2, 3, 4, 5] })
                      }
                      size="small"
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label="Weekend"
                      onClick={() => setFormData({ ...formData, selectedWeekdays: [6, 0] })}
                      size="small"
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label="MWF"
                      onClick={() => setFormData({ ...formData, selectedWeekdays: [1, 3, 5] })}
                      size="small"
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label="Clear"
                      onClick={() => setFormData({ ...formData, selectedWeekdays: [] })}
                      size="small"
                      variant="outlined"
                      clickable
                      color="warning"
                    />
                  </Stack>
                </Box>
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date (Optional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
                }
                helperText={`~ ${calculateHours(formData.durationMinutes)}`}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Color"
                type="color"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#e3f2fd'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduledSessionManager;
