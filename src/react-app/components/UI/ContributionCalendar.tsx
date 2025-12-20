import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { addDays, eachDayOfInterval, endOfYear, format, getDay, startOfYear } from 'date-fns';
import React, { useMemo } from 'react';

import { Contribution } from '../../types/contribution';

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

// Size configuration - adjust this to change the overall size of calendar cells
// Using rem units for accessibility (respects user browser font size preferences)
// Default browser font size is 16px, so 1rem = 16px
const DAY_CELL_SIZE = {
  xs: 0.875, // Mobile: 0.875rem (14px at default)
  sm: 1, // Tablet: 1rem (16px at default)
  md: 1.125, // Desktop: 1.125rem (18px at default)
} as const;

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

  // Determine day color with theme support
  const getDayColor = (day: DayData): string => {
    const { count, categoryIds } = day;
    const isDark = theme.palette.mode === 'dark';

    if (count === 0) {
      // Use consistent color for all empty days
      return isDark ? theme.palette.grey[800] : theme.palette.grey[200];
    }

    if (categoryIds.length > 1) {
      return isDark ? theme.palette.warning.dark : theme.palette.warning.light;
    }

    switch (true) {
      case count >= 3:
        return theme.palette.success.dark;
      case count === 2:
        return theme.palette.success.main;
      case count === 1:
        return isDark ? theme.palette.success.dark : theme.palette.success.light;
      default:
        return isDark ? theme.palette.grey[700] : theme.palette.grey[200];
    }
  };

  // Group weeks by month for wrapping layout - generate proper month calendars
  const monthlyData = useMemo(() => {
    const monthsArray: Array<{
      month: string;
      monthNum: number;
      weeks: DayData[][];
      startOffset: number; // Column offset for first day
    }> = [];

    // Generate calendar for each month
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0); // Last day of month
      const monthName = MONTHS[monthIndex];

      // Get the day of week for the first day of the month
      const firstDayOfWeek = getDay(monthStart);
      const startOffset = (firstDayOfWeek - weekStartDay + 7) % 7;

      const weeks: DayData[][] = [];
      let currentWeek: DayData[] = [];

      // Add all days of the month (no empty placeholders)
      let currentDate = monthStart;
      while (currentDate <= monthEnd) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const dayData = calendarData[dateKey] || { count: 0, categoryIds: [] };

        currentWeek.push({
          date: dateKey,
          count: dayData.count,
          categoryIds: dayData.categoryIds,
        });

        // If week is complete, push it and start a new week
        if (currentWeek.length === 7) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }

        currentDate = addDays(currentDate, 1);
      }

      // Add remaining days to last week if any
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }

      monthsArray.push({
        month: monthName,
        monthNum: monthIndex + 1,
        weeks,
        startOffset,
      });
    }

    return monthsArray;
  }, [calendarData, year, weekStartDay]);

  // Calculate maximum number of weeks across all months for consistent width
  const maxWeeksInMonth = useMemo(() => {
    return Math.max(...monthlyData.map((m) => m.weeks.length));
  }, [monthlyData]);

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
          {/* Months grid - wraps on overflow */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              pb: 2,
            }}
          >
            {monthlyData.map(({ month, weeks: monthWeeks, startOffset }) => (
              <Box
                key={month}
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.60)',
                  borderRadius: 2,
                  p: 2,
                  border: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)'
                  }`,
                }}
              >
                {/* Month Header */}
                <Tooltip
                  title={`${monthlyContributions[month] || 0} contributions`}
                  placement="top"
                  arrow
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: theme.palette.text.primary,
                      mb: 1.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {month}
                  </Typography>
                </Tooltip>

                {/* Calendar Grid for this month */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `${DAY_CELL_SIZE.xs}rem repeat(${maxWeeksInMonth}, ${DAY_CELL_SIZE.xs}rem)`,
                    gridTemplateRows: `repeat(7, ${DAY_CELL_SIZE.xs}rem)`,
                    gap: { xs: 0.3, sm: 0.4 },
                    '@media (min-width: 600px)': {
                      gridTemplateColumns: `${DAY_CELL_SIZE.sm}rem repeat(${maxWeeksInMonth}, ${DAY_CELL_SIZE.sm}rem)`,
                      gridTemplateRows: `repeat(7, ${DAY_CELL_SIZE.sm}rem)`,
                    },
                    '@media (min-width: 900px)': {
                      gridTemplateColumns: `${DAY_CELL_SIZE.md}rem repeat(${maxWeeksInMonth}, ${DAY_CELL_SIZE.md}rem)`,
                      gridTemplateRows: `repeat(7, ${DAY_CELL_SIZE.md}rem)`,
                    },
                  }}
                >
                  {/* Day Labels */}
                  {dayLabels.map((day, index) => (
                    <Box
                      key={`${month}-daylabel-${weekStartDay}-${index}`}
                      sx={{
                        gridRow: index + 1,
                        gridColumn: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { xs: '12px', sm: '16px' },
                        minHeight: { xs: '12px', sm: '16px' },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        }}
                      >
                        {day}
                      </Typography>
                    </Box>
                  ))}

                  {/* Calendar Days */}
                  {monthWeeks.flatMap((week, weekIndex) =>
                    week.map((day, dayIndexInWeek) => {
                      // Calculate the actual day of week for grid positioning
                      // First week: days start at startOffset position
                      // Subsequent weeks: days fill normally
                      const totalDaysSoFar = weekIndex * 7 + dayIndexInWeek;
                      const dayOfWeek = (startOffset + totalDaysSoFar) % 7;
                      const gridWeekIndex = Math.floor((startOffset + totalDaysSoFar) / 7);

                      return (
                        <Tooltip
                          key={`${month}-${weekIndex}-${dayIndexInWeek}-${day.date}`}
                          title={`${day.date} (${dayLabels[dayOfWeek]}): ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                          placement="top"
                          arrow
                        >
                          <Box
                            sx={{
                              gridRow: dayOfWeek + 1,
                              gridColumn: gridWeekIndex + 2,
                              width: '100%',
                              aspectRatio: '1 / 1',
                              bgcolor: getDayColor(day),
                              borderRadius: { xs: 0.5, sm: 1 },
                              border:
                                day.count > 0
                                  ? `1px solid ${
                                      theme.palette.mode === 'dark'
                                        ? theme.palette.grey[600]
                                        : theme.palette.grey[400]
                                    }`
                                  : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.15)',
                                zIndex: 1,
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    }),
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: { xs: 1.5, sm: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: { xs: 12, sm: 14 },
                  height: { xs: 12, sm: 14 },
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                No contributions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: { xs: 12, sm: 14 },
                  height: { xs: 12, sm: 14 },
                  bgcolor: theme.palette.success.light,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                1 contribution
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: { xs: 12, sm: 14 },
                  height: { xs: 12, sm: 14 },
                  bgcolor: theme.palette.success.main,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                2 contributions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: { xs: 12, sm: 14 },
                  height: { xs: 12, sm: 14 },
                  bgcolor: theme.palette.success.dark,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                3+ contributions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: { xs: 12, sm: 14 },
                  height: { xs: 12, sm: 14 },
                  bgcolor: theme.palette.warning.light,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Multiple categories
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Daily contribution activity. Color intensity shows contribution count, special color for
            multiple categories in a day.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default ContributionCalendar;
