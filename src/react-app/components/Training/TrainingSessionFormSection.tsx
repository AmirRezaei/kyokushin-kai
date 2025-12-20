import React from 'react';
import { TrainingSessionFormData } from '../../types/trainingSessionTypes';
import TrainingSessionForm from './TrainingSessionForm';

interface TrainingSessionFormSectionProps {
  onAddSession: (session: TrainingSessionFormData) => Promise<void> | void;
}

/**
 * Section component wrapping the training session form
 * Provides consistent layout for the form
 */
const TrainingSessionFormSection: React.FC<TrainingSessionFormSectionProps> = ({
  onAddSession,
}) => {
  return <TrainingSessionForm onAddSession={onAddSession} />;
};

export default TrainingSessionFormSection;
