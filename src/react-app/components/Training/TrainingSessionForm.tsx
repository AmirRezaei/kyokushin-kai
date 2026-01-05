import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Chip,
  Stack,
  Autocomplete,
} from '@mui/material';
import React, { useState } from 'react';
import { TrainingSession, ScheduledSession } from '../../types/trainingSessionTypes';
import { isSessionScheduledOnDate } from '../../utils/recurrenceUtils';

interface TrainingSessionFormProps {
  onAddSession: (session: TrainingSession) => void;
  initialData?: TrainingSession;
  isEditMode?: boolean;
  scheduledSessions?: ScheduledSession[];
}

const TrainingSessionForm: React.FC<TrainingSessionFormProps> = ({
  onAddSession,
  initialData,
  isEditMode = false,
  scheduledSessions = [],
}) => {
  const [formData, setFormData] = useState<TrainingSession>(() => {
    if (initialData) return initialData;
    return {
      id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Kihon',
      duration: 60,
      intensity: 'Moderate',
      notes: '',
    };
  });

  const handleChange =
    (field: keyof TrainingSession) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'duration' ? Number(e.target.value) : e.target.value;
      setFormData({ ...formData, [field]: value });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSession(formData);
    if (!isEditMode) {
      setFormData({
        id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Kihon',
        duration: 60,
        intensity: 'Moderate',
        notes: '',
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}.${m}h`;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 500,
        margin: '0 auto',
        backgroundColor: 'background.paper',
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" mb={2}>
          {isEditMode ? 'Edit Training Session' : 'Log Training Session'}
        </Typography>
        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleChange('date')}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        {scheduledSessions.length > 0 && (
          <Box mb={2}>
            {(() => {
              const dateObj = new Date(formData.date);
              const matchingSessions = scheduledSessions.filter((session) =>
                isSessionScheduledOnDate(session, dateObj),
              );

              if (matchingSessions.length === 0) return null;

              return (
                <Box sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Scheduled for this day:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {matchingSessions.map((session) => (
                      <Chip
                        key={session.id}
                        label={session.name}
                        size="small"
                        onClick={() => {
                          setFormData((prev: TrainingSession) => ({
                            ...prev,
                            notes: session.name,
                            duration: session.durationMinutes,
                            type: session.type || prev.type, // Use session type if valid, otherwise keep previous
                          }));
                        }}
                        sx={{
                          bgcolor: session.color,
                          // Ensure text contrast if needed, for now default
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              );
            })()}
          </Box>
        )}
        <Autocomplete
          freeSolo
          options={['Kata', 'Kumite', 'Kihon', 'Conditioning']}
          value={formData.type}
          onInputChange={(_, newValue) => {
            // Handle both selection and typing
            // When typing, newValue is the string input
            setFormData({ ...formData, type: newValue });
          }}
          renderInput={(params) => (
            <TextField {...params} label="Type" fullWidth required sx={{ mb: 2 }} />
          )}
        />
        <TextField
          label="Duration (minutes)"
          type="number"
          value={formData.duration}
          onChange={handleChange('duration')}
          fullWidth
          required
          sx={{ mb: 2 }}
          InputProps={{ inputProps: { step: 15 } }}
          helperText={formatDuration(formData.duration)}
        />
        <TextField
          label="Intensity"
          select
          value={formData.intensity}
          onChange={handleChange('intensity')}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          {['Light', 'Moderate', 'Intense'].map((level) => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Notes"
          multiline
          rows={4}
          value={formData.notes}
          onChange={handleChange('notes')}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          {isEditMode ? 'Update Session' : 'Add Session'}
        </Button>
      </Box>
    </Paper>
  );
};

export default TrainingSessionForm;
