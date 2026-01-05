import { ScheduledSession, TrainingSessionFormData } from '../../types/trainingSessionTypes';
import TrainingSessionForm from './TrainingSessionForm';

interface TrainingSessionFormSectionProps {
  onAddSession: (session: TrainingSessionFormData) => Promise<void> | void;
  scheduledSessions?: ScheduledSession[];
}

/**
 * Section component wrapping the training session form
 * Provides consistent layout for the form
 */
const TrainingSessionFormSection: React.FC<TrainingSessionFormSectionProps> = ({
  onAddSession,
  scheduledSessions,
}) => {
  return <TrainingSessionForm onAddSession={onAddSession} scheduledSessions={scheduledSessions} />;
};

export default TrainingSessionFormSection;
