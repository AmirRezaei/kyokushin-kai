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
      return data.sessions || null;
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      return null;
    }
  },

  /**
   * Create or update a training session (upsert)
   * @param token - Authentication token
   * @param session - Training session data
   * @returns Promise resolving to boolean success
   */
  upsertSession: async (token: string, session: UserTrainingSession): Promise<boolean> => {
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
        console.error(`Failed to upsert session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error upserting training session:', error);
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
