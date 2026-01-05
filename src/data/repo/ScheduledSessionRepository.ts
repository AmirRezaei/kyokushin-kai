import { ScheduledSession } from '../../react-app/types/trainingSessionTypes';

const API_BASE = '/api/v1/scheduled-sessions';

/**
 * Client-side repository for scheduled session data access
 */
export const ScheduledSessionRepository = {
  /**
   * Fetch all scheduled sessions for the authenticated user
   */
  getUserSessions: async (token: string): Promise<ScheduledSession[] | null> => {
    try {
      const res = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Failed to fetch scheduled sessions: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch (error) {
      console.error('Error fetching scheduled sessions:', error);
      return null;
    }
  },

  /**
   * Create a new scheduled session
   */
  createSession: async (token: string, session: ScheduledSession): Promise<boolean> => {
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
        console.error(`Failed to create scheduled session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating scheduled session:', error);
      return false;
    }
  },

  /**
   * Update an existing scheduled session
   */
  updateSession: async (token: string, session: ScheduledSession): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Assuming version property might exist on session or defaulting to 0 if not typed yet
          version: (session as any).version ?? 0,
          name: session.name,
          type: session.type, // Custom or standard type
          startDate: session.startDate,
          endDate: session.endDate,
          startTime: session.startTime,
          durationMinutes: session.durationMinutes,
          recurrence: session.recurrence,
          color: session.color,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          console.warn('Scheduled session conflict detected.');
          return false;
        }
        console.error(`Failed to update scheduled session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating scheduled session:', error);
      return false;
    }
  },

  /**
   * Delete a scheduled session by ID
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
        console.error(`Failed to delete scheduled session: ${res.status} ${res.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting scheduled session:', error);
      return false;
    }
  },
};
