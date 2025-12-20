import { UserTrainingSession } from '../../data/model/trainingSession';

/**
 * Training session type alias for component usage
 */
export type TrainingSession = UserTrainingSession;

/**
 * Training session form data (without ID for new sessions)
 */
export type TrainingSessionFormData = Omit<TrainingSession, 'id'>;

/**
 * Training type options
 */
export type TrainingType = 'Kata' | 'Kumite' | 'Kihon' | 'Conditioning';

/**
 * Training intensity levels
 */
export type TrainingIntensity = 'Light' | 'Moderate' | 'Intense';

/**
 * Training session CRUD operation handlers
 */
export interface TrainingSessionHandlers {
  onAdd: (session: TrainingSessionFormData) => Promise<void> | void;
  onEdit: (index: number, session: TrainingSession) => Promise<void> | void;
  onDelete: (indexOrId: number | string) => Promise<void> | void;
}
