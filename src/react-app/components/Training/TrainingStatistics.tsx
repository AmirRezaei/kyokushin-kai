// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Training/TrainingStatistics.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - Core Frameworks: React, Vite
// - UI/Styling: MUI v6, MUI X Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
// - TypeScript: Strict Mode Enabled
// - Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, UUID
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ! Development Environment:
// - OS: Windows
// - Tools: PowerShell, VSCode
//
// ! Coding Guidelines:
// 1. Purpose Summary: Provide a concise description of the file's role based on the "Purpose" section.
// 2. Code Quality: Ensure code is readable, maintainable, and optimized for performance.
// 3. State Management: Use immutable state updates and minimize state where possible.
// 4. Rendering Optimization: Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
// 5. State Management Libraries: Avoid prop drilling by leveraging Context API or state management libraries.
// 6. Side Effects Management:
//    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    - Clean up side effects in useEffect and manage dependencies carefully.
//    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at @/components/utils/localStorageUtils.ts.
//        - Function Signatures:
//          - 'const getLocalStorageItem = <T,>(key: string, defaultValue: T): T'
//          - 'const setLocalStorageItem = <T,>(key: string, value: T): void'
// 7. Modularization: Break down large components into smaller, reusable parts.
// 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. Error Handling:
//    - Implement robust error handling.
//    - Provide user-friendly feedback in case of errors.
// 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
// 13  This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
// HEADER-END
import {
  AccessTime,
  Bolt,
  Class,
  FitnessCenter,
  LocalFireDepartment,
  Speed,
  Start,
  TimerOutlined,
  EventAvailable,
} from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { ScheduledSession } from '../../types/trainingSessionTypes';
import FutureSessionsStats from './FutureSessionsStats';

interface TrainingSession {
  date: string;
  type: string;
  duration: number; // Duration in minutes
  intensity: string;
}

interface TrainingStatisticsProps {
  sessions: TrainingSession[];
  scheduledSessions?: ScheduledSession[];
}

const TrainingStatistics: React.FC<TrainingStatisticsProps> = React.memo(
  ({ sessions, scheduledSessions }) => {
    const sortedSessions = useMemo(() => {
      return [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [sessions]);

    const statistics = useMemo(() => {
      const totalSessions = sortedSessions.length;

      // Ensure duration is treated as a number
      const totalDuration = sortedSessions.reduce(
        (sum, session) => sum + (Number(session.duration) || 0),
        0,
      );
      const avgDuration = totalSessions > 0 ? (totalDuration / totalSessions).toFixed(2) : '0';

      // Calculate streaks
      let currentStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < sortedSessions.length; i++) {
        const prevDate = new Date(sortedSessions[i - 1].date);
        const currDate = new Date(sortedSessions[i].date);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays === 1) {
          currentStreak += 1;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
        } else {
          currentStreak = 1;
        }
      }

      // Sessions by Type
      const sessionsByType = sortedSessions.reduce<Record<string, number>>((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {});

      // Sessions by Intensity
      const sessionsByIntensity = sortedSessions.reduce<Record<string, number>>((acc, session) => {
        acc[session.intensity] = (acc[session.intensity] || 0) + 1;
        return acc;
      }, {});

      // Total Duration by Type
      const totalDurationByType = sortedSessions.reduce<Record<string, number>>((acc, session) => {
        const type = session.type;
        const duration = Number(session.duration) || 0;
        acc[type] = (acc[type] || 0) + duration;
        return acc;
      }, {});

      // Total Duration by Intensity
      const totalDurationByIntensity = sortedSessions.reduce<Record<string, number>>(
        (acc, session) => {
          const intensity = session.intensity;
          const duration = Number(session.duration) || 0;
          acc[intensity] = (acc[intensity] || 0) + duration;
          return acc;
        },
        {},
      );

      // Average Intensity (assuming Low:1, Medium:2, High:3)
      const intensityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
      const totalIntensity = sortedSessions.reduce(
        (sum, session) => sum + (intensityMap[session.intensity] || 0),
        0,
      );
      const averageIntensity =
        totalSessions > 0 ? (totalIntensity / totalSessions).toFixed(2) : 'N/A';

      // Most Common Type
      const mostCommonTypeEntry = Object.entries(sessionsByType).reduce(
        (a, b) => (a[1] > b[1] ? a : b),
        ['', 0],
      );
      const mostCommonType = mostCommonTypeEntry[0] || 'N/A';

      // Most Common Intensity
      const mostCommonIntensityEntry = Object.entries(sessionsByIntensity).reduce(
        (a, b) => (a[1] > b[1] ? a : b),
        ['', 0],
      );
      const mostCommonIntensity = mostCommonIntensityEntry[0] || 'N/A';

      // First and Last Session Dates
      const firstSessionDate = sortedSessions[0]?.date || 'N/A';
      const lastSessionDate = sortedSessions[sortedSessions.length - 1]?.date || 'N/A';

      // Total Duration per Week
      const totalDurationPerWeek = sortedSessions.reduce<Record<string, number>>((acc, session) => {
        const date = new Date(session.date);
        const week = `${date.getFullYear()}-W${getWeekNumber(date)}`;
        const duration = Number(session.duration) || 0;
        acc[week] = (acc[week] || 0) + duration;
        return acc;
      }, {});

      // Helper function to get week number
      function getWeekNumber(d: Date): number {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return weekNo;
      }

      return {
        totalSessions,
        totalDuration,
        avgDuration,
        maxStreak,
        sessionsByType,
        sessionsByIntensity,
        totalDurationByType,
        totalDurationByIntensity,
        averageIntensity,
        mostCommonType,
        mostCommonIntensity,
        firstSessionDate,
        lastSessionDate,
        totalDurationPerWeek,
      };
    }, [sortedSessions]);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Training Statistics
        </Typography>

        <Grid container spacing={2}>
          {/* Top Row: Future Sessions & Basic stats */}
          {scheduledSessions && (
            <Grid item xs={12} sm={3}>
              <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
                <FutureSessionsStats scheduledSessions={scheduledSessions} />
              </Box>
            </Grid>
          )}

          {/* Basic Statistics */}
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <FitnessCenter color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Total Sessions</Typography>
              </Box>
              <Typography variant="h5">{statistics.totalSessions}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <AccessTime color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Total Duration</Typography>
              </Box>
              <Typography variant="h5">{statistics.totalDuration} mins</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TimerOutlined color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Average Duration</Typography>
              </Box>
              <Typography variant="h5">{statistics.avgDuration} mins</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <LocalFireDepartment color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Longest Streak</Typography>
              </Box>
              <Typography variant="h5">{statistics.maxStreak} days</Typography>
            </Paper>
          </Grid>

          {/* Detailed Statistics */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Sessions by Type
              </Typography>
              {Object.entries(statistics.sessionsByType).map(([type, count]) => (
                <Typography key={type}>
                  {type}: {count}
                </Typography>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Sessions by Intensity
              </Typography>
              {Object.entries(statistics.sessionsByIntensity).map(([intensity, count]) => (
                <Typography key={intensity}>
                  {intensity}: {count}
                </Typography>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Average Intensity</Typography>
              </Box>
              <Typography variant="h5">{statistics.averageIntensity}</Typography>
            </Paper>
          </Grid>

          {/* Most Common Metrics */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Class color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Most Common Type</Typography>
              </Box>
              <Typography variant="h5">{statistics.mostCommonType}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Bolt color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Most Common Intensity</Typography>
              </Box>
              <Typography variant="h5">{statistics.mostCommonIntensity}</Typography>
            </Paper>
          </Grid>

          {/* Total Duration by Type and Intensity */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Duration by Type
              </Typography>
              {Object.entries(statistics.totalDurationByType).map(([type, duration]) => (
                <Typography key={type}>
                  {type}: {duration} mins
                </Typography>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Duration by Intensity
              </Typography>
              {Object.entries(statistics.totalDurationByIntensity).map(([intensity, duration]) => (
                <Typography key={intensity}>
                  {intensity}: {duration} mins
                </Typography>
              ))}
            </Paper>
          </Grid>

          {/* Session Dates */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Start color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">First Session</Typography>
              </Box>
              <Typography variant="h5">{statistics.firstSessionDate}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventAvailable color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Last Session</Typography>
              </Box>
              <Typography variant="h5">{statistics.lastSessionDate}</Typography>
            </Paper>
          </Grid>

          {/* Additional Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Duration per Week
              </Typography>
              {Object.entries(statistics.totalDurationPerWeek).map(([week, duration]) => (
                <Typography key={week}>
                  Week {week}: {duration} mins
                </Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  },
);

export default TrainingStatistics;
