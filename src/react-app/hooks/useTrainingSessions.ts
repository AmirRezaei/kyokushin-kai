import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from '@/components/context/SnackbarContext';
import { TrainingSession, TrainingSessionFormData } from '../types/trainingSessionTypes';
import { useTrainingSessionApi } from './useTrainingSessionApi';
import { useTrainingSessionStorage } from './useTrainingSessionStorage';

/**
 * Main custom hook for managing training sessions
 * Orchestrates API and localStorage operations based on authentication status
 *
 * @param token - Authentication token (null for guest users)
 * @returns Training sessions and CRUD operations
 */
export const useTrainingSessions = (token: string | null) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const isInitialMount = useRef(true);
  const { showSnackbar } = useSnackbar();

  // Get API methods
  const api = useTrainingSessionApi(token);
  const { fetchSessions, createSession, updateSession, deleteSession } = api;

  // Get storage methods
  const storage = useTrainingSessionStorage();
  const { loadFromStorage, saveToStorage } = storage;

  /**
   * Initial data load - fetch from API or localStorage
   */
  useEffect(() => {
    const loadSessions = async () => {
      if (token) {
        // Authenticated user: try to fetch from API
        const apiSessions = await fetchSessions();
        if (apiSessions) {
          setSessions(apiSessions);
          return;
        }
      }

      // Guest user or API failed: load from localStorage
      const localSessions = loadFromStorage();
      if (!token) {
        setSessions(localSessions);
      }
    };

    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token to avoid infinite loops

  /**
   * Sync to localStorage for guest users (skip initial mount)
   */
  useEffect(() => {
    if (!token && !isInitialMount.current) {
      saveToStorage(sessions);
    } else if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, token]); // Only sessions and token, saveToStorage is stable

  /**
   * Add a new training session
   */
  const handleAddSession = useCallback(
    async (sessionData: TrainingSessionFormData) => {
      const newSession: TrainingSession = {
        ...sessionData,
        id: uuidv4(),
      };

      // Optimistic update
      setSessions((prev) => [newSession, ...prev]);

      // Persist to backend if authenticated
      if (token) {
        const success = await createSession(newSession);

        // Rollback on failure
        if (!success) {
          setSessions((prev) => prev.filter((s) => s.id !== newSession.id));
          showSnackbar('Failed to save training session', 'error');
        } else {
          showSnackbar('Training session saved successfully', 'success');
        }
      } else {
        // Guest user - localStorage only
        showSnackbar('Training session saved locally', 'info');
      }
    },
    [token, createSession, showSnackbar],
  );

  /**
   * Delete a training session by index or ID
   */
  const handleDeleteSession = useCallback(
    async (idOrIndex: number | string) => {
      let idToDelete: string | undefined;
      let deletedSession: TrainingSession | undefined;
      let originalIndex: number | undefined;
      let newSessions: TrainingSession[] = [];

      if (typeof idOrIndex === 'number') {
        // Index-based deletion
        const session = sessions[idOrIndex];
        if (session) {
          idToDelete = session.id;
          deletedSession = session;
          originalIndex = idOrIndex;
        }
        newSessions = sessions.filter((_, i) => i !== idOrIndex);
      } else {
        // ID-based deletion
        idToDelete = idOrIndex;
        deletedSession = sessions.find((s) => s.id === idOrIndex);
        newSessions = sessions.filter((s) => s.id !== idOrIndex);
      }

      // Optimistic update
      setSessions(newSessions);

      // Persist to backend if authenticated
      if (token && idToDelete) {
        const success = await deleteSession(idToDelete);

        // Rollback on failure - restore to original position
        if (!success && deletedSession) {
          if (originalIndex !== undefined) {
            // Restore at original index for index-based deletion
            setSessions((prev) => {
              const newArray = [...prev];
              newArray.splice(originalIndex, 0, deletedSession);
              return newArray;
            });
          } else {
            // For ID-based deletion, append to end (position unknown)
            setSessions((prev) => [...prev, deletedSession]);
          }
          showSnackbar('Failed to delete training session', 'error');
        } else {
          showSnackbar('Training session deleted', 'success');
        }
      } else if (!token) {
        // Guest user - localStorage only
        showSnackbar('Training session deleted', 'success');
      }
    },
    [sessions, token, deleteSession, showSnackbar],
  );

  /**
   * Edit an existing training session
   */
  const handleEditSession = useCallback(
    async (index: number, updatedSession: TrainingSession) => {
      // Create new object instead of mutating parameter
      const sessionToSave: TrainingSession = updatedSession.id
        ? updatedSession
        : {
            ...updatedSession,
            id: sessions[index]?.id || uuidv4(),
          };

      // Store old session for rollback
      const oldSession = sessions[index];

      // Optimistic update
      const updatedSessions = sessions.map((session, i) => (i === index ? sessionToSave : session));
      setSessions(updatedSessions);

      // Persist to backend if authenticated
      if (token) {
        const success = await updateSession(sessionToSave);

        // Rollback on failure
        if (!success && oldSession) {
          setSessions((prev) => prev.map((session, i) => (i === index ? oldSession : session)));
          showSnackbar('Failed to update training session', 'error');
        } else {
          showSnackbar('Training session updated successfully', 'success');
        }
      } else {
        // Guest user - localStorage only
        showSnackbar('Training session updated locally', 'info');
      }
    },
    [sessions, token, updateSession, showSnackbar],
  );

  return {
    sessions,
    handleAddSession,
    handleEditSession,
    handleDeleteSession,
  };
};
