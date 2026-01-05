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

/**
 * Scheduled recurring training session
 */
export interface ScheduledSession {
  id: string;
  name: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate?: string; // Optional ISO Date YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly';
  color?: string; // Optional background color for calendar visualization
  type?: string; // Standard or custom training type
  selectedWeekdays?: number[]; // Array of day indices (0=Sunday, 1=Monday, etc.) for 'weekly' recurrence
  version?: number; // Optimistic concurrency version
}

export type ScheduledSessionFormData = Omit<ScheduledSession, 'id'>;
