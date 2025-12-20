import {
  TrainingIntensity,
  TrainingType,
  TrainingSessionFormData,
} from '../types/trainingSessionTypes';

/**
 * LocalStorage key for training sessions
 */
export const TRAINING_SESSIONS_STORAGE_KEY = 'trainingSessions';

/**
 * Available training types
 */
export const TRAINING_TYPES: TrainingType[] = ['Kata', 'Kumite', 'Kihon', 'Conditioning'];

/**
 * Available intensity levels
 */
export const TRAINING_INTENSITIES: TrainingIntensity[] = ['Light', 'Moderate', 'Intense'];

/**
 * Default form values for new training session
 */
export const DEFAULT_TRAINING_SESSION: TrainingSessionFormData = {
  date: new Date().toISOString().split('T')[0],
  type: 'Kihon',
  duration: 60,
  intensity: 'Moderate',
  notes: '',
};
