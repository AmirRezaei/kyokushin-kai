import { Box, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import {
  ScheduledSession,
  TrainingSession,
  TrainingSessionFormData,
} from '../../types/trainingSessionTypes';
import TrainingHistory from './TrainingHistory';
import TrainingSessionForm from './TrainingSessionForm';

interface TrainingSessionManagerProps {
  onAddSession: (session: TrainingSessionFormData) => Promise<void> | void;
  scheduledSessions?: ScheduledSession[];
  sessions: TrainingSession[];
  onDeleteSession: (index: number) => void;
  onEditSession: (index: number, updatedSession: TrainingSession) => void;
}

/**
 * Manager component for training sessions
 * Wraps form for new sessions and history list for existing sessions
 */
const TrainingSessionManager: React.FC<TrainingSessionManagerProps> = ({
  onAddSession,
  scheduledSessions,
  sessions,
  onDeleteSession,
  onEditSession,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="session management tabs">
          <Tab label="New Session" />
          <Tab label="History" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <TrainingSessionForm onAddSession={onAddSession} scheduledSessions={scheduledSessions} />
      )}

      {activeTab === 1 && (
        <TrainingHistory
          sessions={sessions}
          onDeleteSession={onDeleteSession}
          onEditSession={onEditSession}
        />
      )}
    </Box>
  );
};

export default TrainingSessionManager;
