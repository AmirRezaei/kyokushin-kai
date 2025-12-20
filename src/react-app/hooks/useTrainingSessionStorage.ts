import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getLocalStorageItem, setLocalStorageItem } from '../components/utils/localStorageUtils';
import { TRAINING_SESSIONS_STORAGE_KEY } from '../constants/trainingSessionConstants';
import { TrainingSession } from '../types/trainingSessionTypes';

/**
 * Custom hook for training session localStorage operations
 * Handles data persistence and migration for guest users
 */
export const useTrainingSessionStorage = () => {
  /**
   * Load training sessions from localStorage with data migration
   * Ensures all sessions have valid IDs
   */
  const loadFromStorage = useCallback((): TrainingSession[] => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localData = getLocalStorageItem<any[]>(TRAINING_SESSIONS_STORAGE_KEY, []);

      // Track if migration is needed
      let needsMigration = false;

      // Migrate old data that might lack IDs
      const migrated = localData.map((s) => {
        const needsId = !s.id;
        const needsNotes = !s.notes;

        if (needsId || needsNotes) {
          needsMigration = true;
        }

        return {
          id: s.id || uuidv4(),
          date: s.date,
          type: s.type,
          duration: s.duration,
          intensity: s.intensity,
          notes: s.notes || '',
        };
      });

      // Save migrated data back only if migration occurred
      if (needsMigration) {
        setLocalStorageItem(TRAINING_SESSIONS_STORAGE_KEY, migrated);
      }

      return migrated;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }, []);

  /**
   * Save training sessions to localStorage
   */
  const saveToStorage = useCallback((sessions: TrainingSession[]): void => {
    try {
      setLocalStorageItem(TRAINING_SESSIONS_STORAGE_KEY, sessions);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  /**
   * Clear training sessions from localStorage
   */
  const clearStorage = useCallback((): void => {
    try {
      setLocalStorageItem(TRAINING_SESSIONS_STORAGE_KEY, []);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  return {
    loadFromStorage,
    saveToStorage,
    clearStorage,
  };
};
