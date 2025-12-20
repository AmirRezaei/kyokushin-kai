import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import {
  addDays,
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  getMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import React, { useMemo } from 'react';

import { Contribution } from './types';

interface ContributionCalendarProps {
  contributions: Contribution[];
  year?: number;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

interface DayData {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of contributions
  categoryIds: string[]; // Array of unique category IDs
}

// Constants
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const DAYS_IN_WEEK = {
  0: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const, // Sunday start
  1: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const, // Monday start
  2: ['T', 'W', 'T', 'F', 'S', 'S', 'M'] as const,
  3: ['W', 'T', 'F', 'S', 'S', 'M', 'T'] as const,
  4: ['T', 'F', 'S', 'S', 'M', 'T', 'W'] as const,
  5: ['F', 'S', 'S', 'M', 'T', 'W', 'T'] as const,
  6: ['S', 'S', 'M', 'T', 'W', 'T', 'F'] as const,
};

const ContributionCalendar: React.FC<ContributionCalendarProps> = ({
  contributions,
  year = new Date().getFullYear(),
  weekStartDay = 1, // Default to Monday
}) => {
  const theme = useTheme();

  // Select day labels based on week start
  const dayLabels = DAYS_IN_WEEK[weekStartDay];

  // Generate calendar data
  const calendarData = useMemo(() => {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    const daysMap: Record<string, { count: number; categoryIds: string[] }> = {};

    eachDayOfInterval({ start: startDate, end: endDate }).forEach((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      daysMap[dateKey] = { count: 0, categoryIds: [] };
    });

    contributions.forEach((contribution) => {
      const contributionDate = format(new Date(contribution.date), 'yyyy-MM-dd');
      if (daysMap[contributionDate]) {
        daysMap[contributionDate].count += 1;
        if (
          contribution.category &&
          !daysMap[contributionDate].categoryIds.includes(contribution.category)
        ) {
          daysMap[contributionDate].categoryIds.push(contribution.category);
        }
      }
    });

    return daysMap;
  }, [contributions, year]);

  // Calculate monthly contribution counts
  const monthlyContributions = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    Object.entries(calendarData).forEach(([date, data]) => {
      const month = format(new Date(date), 'MMM');
      monthCounts[month] = (monthCounts[month] || 0) + data.count;
    });
    return monthCounts;
  }, [calendarData]);

  // Determine day color
  const getDayColor = (day: DayData): string => {
    const { count, categoryIds } = day;
    if (count === 0) {
      const month = getMonth(new Date(day.date));
      return month % 2 === 0 ? theme.palette.grey[200] : theme.palette.grey[100];
    }
    if (categoryIds.length > 1) return theme.palette.warning.light;

    switch (true) {
      case count >= 3:
        return theme.palette.success.dark;
      case count === 2:
        return theme.palette.success.main;
      case count === 1:
        return theme.palette.success.light;
      default:
        return theme.palette.grey[200];
    }
  };

  // Generate weeks array with configurable start day
  const weeks = useMemo(() => {
    const weeksArray: DayData[][] = [];
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const weekStart = startOfWeek(yearStart, { weekStartsOn: weekStartDay });

    let currentDate = weekStart;
    let currentWeek: DayData[] = [];

    while (currentDate <= yearEnd) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayData = calendarData[dateKey] || { count: 0, categoryIds: [] };
      currentWeek.push({
        date: dateKey,
        count: dayData.count,
        categoryIds: dayData.categoryIds,
      });

      if (getDay(currentDate) === (weekStartDay + 6) % 7 || currentDate >= yearEnd) {
        while (currentWeek.length < 7) {
          const nextDay = addDays(currentDate, currentWeek.length - getDay(currentDate));
          const nextDateKey = format(nextDay, 'yyyy-MM-dd');
          currentWeek.push({
            date: nextDateKey,
            count: calendarData[nextDateKey]?.count || 0,
            categoryIds: calendarData[nextDateKey]?.categoryIds || [],
          });
        }
        weeksArray.push([...currentWeek]);
        currentWeek = [];
      }
      currentDate = addDays(currentDate, 1);
    }

    return weeksArray;
  }, [calendarData, year, weekStartDay]);

  // Calculate month spans
  const monthSpans = useMemo(() => {
    const spans: { month: string; weekCount: number; startColumn: number }[] = [];
    let currentColumn = 2;

    weeks.forEach((week) => {
      const daysInMonth: Record<string, number> = {};
      week.forEach((day) => {
        const monthNum = format(new Date(day.date), 'MM');
        daysInMonth[monthNum] = (daysInMonth[monthNum] || 0) + 1;
      });

      const majorityMonth = Object.entries(daysInMonth).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      const monthName = MONTHS[parseInt(majorityMonth, 10) - 1];

      const lastSpan = spans[spans.length - 1];
      if (!lastSpan || lastSpan.month !== monthName) {
        spans.push({ month: monthName, weekCount: 1, startColumn: currentColumn });
      } else {
        lastSpan.weekCount += 1;
      }
      currentColumn += 1;
    });

    return spans;
  }, [weeks]);

  const totalWeeks = weeks.length;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
        Contribution Calendar {year}
      </Typography>
      {contributions.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          No contributions recorded for {year}
        </Typography>
      ) : (
        <>
          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Box sx={{ overflow: 'visible' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `1em repeat(${totalWeeks}, 1em)`,
                  gridTemplateRows: 'auto repeat(7, 1em)',
                  gap: 0.2,
                  minWidth: 'max-content',
                }}
              >
                {/* Month Labels with Tooltips */}
                {monthSpans.map((span) => (
                  <Tooltip
                    key={`${span.month}-${span.startColumn}`}
                    title={`${span.month}: ${monthlyContributions[span.month] || 0} contributions`}
                    placement="top"
                    arrow
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        gridRow: 1,
                        gridColumn: `${span.startColumn} / span ${span.weekCount}`,
                        textAlign: 'center',
                        color: theme.palette.text.secondary,
                        cursor: 'pointer',
                      }}
                    >
                      {span.month}
                    </Typography>
                  </Tooltip>
                ))}

                {/* Day Labels */}
                {dayLabels.map((day, index) => (
                  <Box
                    key={`daylabel-${weekStartDay}-${index}`}
                    sx={{
                      gridRow: index + 2,
                      gridColumn: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '1em',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {day}
                    </Typography>
                  </Box>
                ))}

                {/* Calendar Days */}
                {weeks.flatMap((week, weekIndex) =>
                  week.map((day, dayIndex) => (
                    <Box
                      key={`${weekIndex}-${day.date}`}
                      sx={{
                        gridRow: dayIndex + 2,
                        gridColumn: weekIndex + 2,
                        width: '1em',
                        height: '1em',
                        bgcolor: getDayColor(day),
                        borderRadius: 1,
                        border: day.count > 0 ? `1px solid ${theme.palette.grey[400]}` : 'none',
                      }}
                    >
                      <Tooltip title={`${day.date} (${dayLabels[dayIndex]})`} placement="top" arrow>
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      </Tooltip>
                    </Box>
                  )),
                )}
              </Box>
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{ width: 14, height: 14, bgcolor: theme.palette.grey[200], borderRadius: 1 }}
              />
              <Typography variant="caption">No contributions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  bgcolor: theme.palette.success.light,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption">1 contribution</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{ width: 14, height: 14, bgcolor: theme.palette.success.main, borderRadius: 1 }}
              />
              <Typography variant="caption">2 contributions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{ width: 14, height: 14, bgcolor: theme.palette.success.dark, borderRadius: 1 }}
              />
              <Typography variant="caption">3+ contributions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  bgcolor: theme.palette.warning.light,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption">Multiple categories</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            Daily contribution activity. Color intensity shows contribution count, special color for
            multiple categories in a day.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default ContributionCalendar;
