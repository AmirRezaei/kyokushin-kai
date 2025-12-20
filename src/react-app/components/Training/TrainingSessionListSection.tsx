import React from 'react';
import { TrainingSession } from '../../types/trainingSessionTypes';
import TrainingSessionList from './TrainingSessionList';

interface TrainingSessionListSectionProps {
  sessions: TrainingSession[];
  onDeleteSession: (index: number) => void;
  onEditSession: (index: number, updatedSession: TrainingSession) => void;
}

/**
 * Section component for the training session list
 * Displays the list of training sessions in a clean layout
 */
const TrainingSessionListSection: React.FC<TrainingSessionListSectionProps> = ({
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

export default TrainingSessionListSection;
