import { useCallback } from 'react';
import { TrainingSessionRepository } from '../../data/repo/TrainingSessionRepository';
import { UserTrainingSession } from '../../data/model/trainingSession';

/**
 * Custom hook for training session API operations
 * Delegates to TrainingSessionRepository for data access
 */
export const useTrainingSessionApi = (token: string | null) => {
  /**
   * Fetch all training sessions from the API
   */
  const fetchSessions = useCallback(async (): Promise<UserTrainingSession[] | null> => {
    if (!token) return null;
    return await TrainingSessionRepository.getUserSessions(token);
  }, [token]);

  /**
   * Create a new training session via API
   */
  const createSession = useCallback(
    async (session: UserTrainingSession): Promise<boolean> => {
      if (!token) return false;
      return await TrainingSessionRepository.createSession(token, session);
    },
    [token],
  );

  /**
   * Update an existing training session via API
   */
  const updateSession = useCallback(
    async (session: UserTrainingSession): Promise<boolean> => {
      if (!token) return false;
      return await TrainingSessionRepository.updateSession(token, session);
    },
    [token],
  );

  /**
   * Delete a training session via API
   */
  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      return await TrainingSessionRepository.deleteSession(token, id);
    },
    [token],
  );

  return {
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
};
