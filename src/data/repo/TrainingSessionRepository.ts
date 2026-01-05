import { UserTrainingSession } from '../model/trainingSession';

const API_BASE = '/api/v1/training-sessions';

/**
 * Client-side repository for training session data access
 * Provides abstraction layer over API calls following the repository pattern
 */
export const TrainingSessionRepository = {
  /**
   * Fetch all training sessions for the authenticated user
   * @param token - Authentication token
   * @returns Promise resolving to array of sessions or null on error
   */
  getUserSessions: async (token: string): Promise<UserTrainingSession[] | null> => {
    try {
      const res = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Failed to fetch sessions: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      return Array.isArray(data) ? data : data.sessions || null;
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      return null;
    }
  },

  /**
   * Create a new training session
   * @param token - Authentication token
   * @param session - Training session data
   * @returns Promise resolving to boolean success
   */
  createSession: async (token: string, session: UserTrainingSession): Promise<boolean> => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(session),
      });

      if (!res.ok) {
        console.error(`Failed to create session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating training session:', error);
      return false;
    }
  },

  /**
   * Update an existing training session
   * @param token - Authentication token
   * @param session - Training session data
   * @returns Promise resolving to boolean success
   */
  updateSession: async (token: string, session: UserTrainingSession): Promise<boolean> => {
    try {
      // Use PUT semantics as implemented in worker
      const res = await fetch(`${API_BASE}/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          version: session.version ?? 0,
          date: session.date,
          type: session.type,
          duration: session.duration,
          intensity: session.intensity,
          notes: session.notes,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          console.warn('Training session conflict detected.');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('training-session-conflict'));
          }
          return false;
        }
        console.error(`Failed to update session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating training session:', error);
      return false;
    }
  },

  /**
   * Delete a training session by ID
   * @param token - Authentication token
   * @param sessionId - Session ID to delete
   * @returns Promise resolving to boolean success
   */
  deleteSession: async (token: string, sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Failed to delete session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting training session:', error);
      return false;
    }
  },
};
