import { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from '@/components/context/SnackbarContext';
import { ScheduledSession, ScheduledSessionFormData } from '@/types/trainingSessionTypes';
import { useScheduledSessionApi } from './useScheduledSessionApi';

const STORAGE_KEY = 'scheduledTrainingSessions';

/**
 * Custom hook to manage scheduled training sessions with API persistence
 */
export const useScheduledSessions = (token: string | null) => {
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const isInitialMount = useRef(true);
  const { showSnackbar } = useSnackbar();

  const api = useScheduledSessionApi(token);
  const { fetchSessions, createSession, updateSession, deleteSession } = api;

  // Initial Data Load
  useEffect(() => {
    const loadSessions = async () => {
      if (token) {
        const apiData = await fetchSessions();
        if (apiData) {
          setScheduledSessions(apiData);
          return;
        }
      }

      // Fallback or Guest
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setScheduledSessions(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load local scheduled sessions', e);
      }
    };
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sync to LocalStorage (Guest only)
  useEffect(() => {
    if (!token && !isInitialMount.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledSessions));
    } else if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledSessions, token]);

  const addScheduledSession = useCallback(
    async (data: ScheduledSessionFormData) => {
      const newSession: ScheduledSession = {
        ...data,
        id: uuidv4(),
      };

      setScheduledSessions((prev) => [...prev, newSession]);

      if (token) {
        const success = await createSession(newSession);
        if (!success) {
          setScheduledSessions((prev) => prev.filter((s) => s.id !== newSession.id));
          showSnackbar('Failed to save schedule remotely', 'error');
        } else {
          showSnackbar('Schedule saved', 'success');
        }
      } else {
        showSnackbar('Schedule saved locally', 'info');
      }
    },
    [token, createSession, showSnackbar],
  );

  const updateScheduledSession = useCallback(
    async (id: string, data: ScheduledSessionFormData) => {
      const originalSession = scheduledSessions.find((s) => s.id === id);
      if (!originalSession) return;

      // Optimistic update
      const updatedSession = { ...originalSession, ...data };
      setScheduledSessions((prev) => prev.map((s) => (s.id === id ? updatedSession : s)));

      if (token) {
        const updatedFromApi = await updateSession(updatedSession);
        if (!updatedFromApi) {
          // Rollback
          setScheduledSessions((prev) => prev.map((s) => (s.id === id ? originalSession : s)));
          showSnackbar('Failed to update schedule remotely', 'error');
        } else {
          // Update with server version (crucial for optimistic concurrency)
          setScheduledSessions((prev) => prev.map((s) => (s.id === id ? updatedFromApi : s)));
          showSnackbar('Schedule updated', 'success');
        }
      } else {
        showSnackbar('Schedule updated locally', 'info');
      }
    },
    [scheduledSessions, token, updateSession, showSnackbar],
  );

  const deleteScheduledSession = useCallback(
    async (id: string) => {
      const originalSession = scheduledSessions.find((s) => s.id === id);
      if (!originalSession) return;

      setScheduledSessions((prev) => prev.filter((s) => s.id !== id));

      if (token) {
        const success = await deleteSession(id);
        if (!success) {
          setScheduledSessions((prev) => [...prev, originalSession]);
          showSnackbar('Failed to delete schedule remotely', 'error');
        } else {
          showSnackbar('Schedule deleted', 'success');
        }
      } else {
        showSnackbar('Schedule deleted locally', 'info');
      }
    },
    [scheduledSessions, token, deleteSession, showSnackbar],
  );

  return {
    scheduledSessions,
    addScheduledSession,
    updateScheduledSession,
    deleteScheduledSession,
  };
};
