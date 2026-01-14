/**
 * Component for displaying and managing training session history
 */
import React from 'react';
import { TrainingSession } from '../../types/trainingSessionTypes';
import TrainingSessionList from './TrainingSessionList';

interface TrainingHistoryProps {
  sessions: TrainingSession[];
  onDeleteSession: (index: number) => void;
  onEditSession: (index: number, updatedSession: TrainingSession) => void;
}

const TrainingHistory: React.FC<TrainingHistoryProps> = ({
  sessions,
  onDeleteSession,
  onEditSession,
}) => {
  return (
    <TrainingSessionList
      sessions={sessions}
      onDeleteSession={onDeleteSession}
      onEditSession={onEditSession}
    />
  );
};

export default TrainingHistory;
