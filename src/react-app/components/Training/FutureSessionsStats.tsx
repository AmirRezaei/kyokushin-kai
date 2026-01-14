import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  compareAsc,
  differenceInDays,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns';
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ScheduledSession } from '../../types/trainingSessionTypes';

interface FutureSessionsStatsProps {
  scheduledSessions: ScheduledSession[];
}

interface UpcomingSession {
  date: Date;
  session: ScheduledSession;
}

const getDateMatch = (d1: Date, d2: Date) => d1.getDate() === d2.getDate();
const getMonthDateMatch = (d1: Date, d2: Date) =>
  d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();

const FutureSessionsStats: React.FC<FutureSessionsStatsProps> = ({ scheduledSessions }) => {
  const upcomingSessions = (() => {
    const today = startOfDay(new Date());
    const sessions: UpcomingSession[] = [];
    const limitDate = addMonths(today, 6); // Look ahead 6 months

    scheduledSessions.forEach((session) => {
      const currentDate = parseISO(session.startDate);
      const endDate = session.endDate ? parseISO(session.endDate) : limitDate;
      const effectiveEndDate = isBefore(endDate, limitDate) ? endDate : limitDate;

      // Skip invalid dates
      if (isNaN(currentDate.getTime())) return;

      // Advance to today if start date is in past
      if (isBefore(currentDate, today)) {
        // Optimization: Jump closer to today instead of iterating day by day from 2020
        // This is complex for complex recurrences, so simple daily iteration from start is safest for correctness
        // unless start is very old. For now, we'll iterate efficiently.
      }

      let iterator = currentDate;

      while (isBefore(iterator, today)) {
        // Fast forward logic could go here, but for robustness we loop
        // For weekly, we can align to week
        if (session.recurrence === 'daily') {
          const diff = differenceInDays(today, iterator);
          if (diff > 0) iterator = addDays(iterator, diff);
        } else if (session.recurrence === 'weekly') {
          const diff = differenceInDays(today, iterator);
          if (diff > 7) iterator = addWeeks(iterator, Math.floor(diff / 7));
          else iterator = addDays(iterator, 1);
        } else if (session.recurrence === 'monthly') {
          iterator = addMonths(iterator, 1);
        } else if (session.recurrence === 'yearly') {
          iterator = addYears(iterator, 1);
        } else {
          iterator = addDays(iterator, 1); // Fallback
        }
      }

      // Generate future dates
      while (isBefore(iterator, effectiveEndDate) || isSameDay(iterator, effectiveEndDate)) {
        if (isAfter(iterator, today) || isSameDay(iterator, today)) {
          let matches = false;

          if (session.recurrence === 'daily') {
            matches = true;
          } else if (session.recurrence === 'weekly') {
            if (session.selectedWeekdays && session.selectedWeekdays.length > 0) {
              // getDay returns 0 for Sunday, 1 for Monday
              // selectedWeekdays likely uses same (0-6)
              const day = getDay(iterator);
              if (session.selectedWeekdays.includes(day)) {
                matches = true;
              }
            } else {
              // Every week on star day? Or every day of week?
              // Usually "Weekly" without specific days implies the same day of week as start date
              const startDay = getDay(parseISO(session.startDate));
              if (getDay(iterator) === startDay) matches = true;
            }
          } else if (session.recurrence === 'monthly') {
            if (getDateMatch(iterator, parseISO(session.startDate))) matches = true;
          } else if (session.recurrence === 'yearly') {
            if (getMonthDateMatch(iterator, parseISO(session.startDate))) matches = true;
          }

          if (matches) {
            console.log('Match found:', format(iterator, 'yyyy-MM-dd'), session.name);
            sessions.push({
              date: iterator,
              session: session,
            });
          }
        }

        // Advance iterator
        if (session.recurrence === 'daily') iterator = addDays(iterator, 1);
        else if (session.recurrence === 'weekly')
          iterator = addDays(iterator, 1); // Check every day for weekly because of multiple selectedWeekdays
        else if (session.recurrence === 'monthly') iterator = addMonths(iterator, 1);
        else if (session.recurrence === 'yearly') iterator = addYears(iterator, 1);
      }
    });

    // console.log('Total calculated sessions:', sessions.length);
    return sessions.sort((a, b) => compareAsc(a.date, b.date));
  })();

  const totalUpcoming = upcomingSessions.length;
  const hasLimit = scheduledSessions.some((s) => !s.endDate);

  return (
    <Card variant="outlined" sx={{ width: 'fit-content', minWidth: 200 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            Future Sessions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            {totalUpcoming}
          </Typography>
          {hasLimit && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              / 6 mos
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FutureSessionsStats;
