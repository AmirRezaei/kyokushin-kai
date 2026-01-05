import { useCallback } from 'react';
import { ScheduledSessionRepository } from '../../data/repo/ScheduledSessionRepository';
import { ScheduledSession } from '../types/trainingSessionTypes';

export const useScheduledSessionApi = (token: string | null) => {
  const fetchSessions = useCallback(async (): Promise<ScheduledSession[] | null> => {
    if (!token) return null;
    return await ScheduledSessionRepository.getUserSessions(token);
  }, [token]);

  const createSession = useCallback(
    async (session: ScheduledSession): Promise<boolean> => {
      if (!token) return false;
      return await ScheduledSessionRepository.createSession(token, session);
    },
    [token],
  );

  const updateSession = useCallback(
    async (session: ScheduledSession): Promise<ScheduledSession | null> => {
      if (!token) return null;
      return await ScheduledSessionRepository.updateSession(token, session);
    },
    [token],
  );

  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      return await ScheduledSessionRepository.deleteSession(token, id);
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
