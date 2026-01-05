import { getDay } from 'date-fns';
import { ScheduledSession } from '../types/trainingSessionTypes';

/**
 * Checks if a given date matches a scheduled session's recurrence pattern.
 * Use this to verify if a session should occur on a specific date.
 */
export const isSessionScheduledOnDate = (session: ScheduledSession, date: Date): boolean => {
  // Parse YYYY-MM-DD to local date midnight to match 'date' iterator
  const [startY, startM, startD] = session.startDate.split('-').map(Number);
  const sessionStart = new Date(startY, startM - 1, startD);

  let sessionEnd: Date | null = null;
  if (session.endDate) {
    const [endY, endM, endD] = session.endDate.split('-').map(Number);
    sessionEnd = new Date(endY, endM - 1, endD);
  }

  // Check if date is within range
  // Compare timestamps to be safe (safeguard against hours/minutes diffs, though should be 00:00)
  // We set the input date to midnight to ensure fair comparison
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  // sessionStart is already at 00:00 based on our parsing
  if (compareDate.getTime() < sessionStart.getTime()) return false;

  if (sessionEnd) {
    // sessionEnd is at 00:00, so we should compare strictly greater
    // But since we want inclusive end date, let's verify logic
    // If date is Oct 5, sessionEnd is Oct 5 00:00 -> valid
    // If date is Oct 6, sessionEnd is Oct 5 00:00 -> invalid (date > sessionEnd)
    if (compareDate.getTime() > sessionEnd.getTime()) return false;
  }

  // Check recurrence
  if (session.recurrence === 'daily') return true;
  if (session.recurrence === 'weekly') {
    return getDay(compareDate) === getDay(sessionStart);
  }
  if (session.recurrence === 'monthly') {
    return compareDate.getDate() === sessionStart.getDate();
  }
  if (session.recurrence === 'yearly') {
    return (
      compareDate.getDate() === sessionStart.getDate() &&
      compareDate.getMonth() === sessionStart.getMonth()
    );
  }
  return false;
};
