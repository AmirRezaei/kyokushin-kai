// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Training/TrainingTypeBreakdownChart.tsx
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
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import React, { useMemo, useState } from 'react';

import { TrainingSession } from './TrainingSessionList';

interface TrainingTypeBreakdownChartProps {
  sessions: TrainingSession[];
}

type TimeScale = 'day' | 'week' | 'month';

const TrainingTypeBreakdownChart: React.FC<TrainingTypeBreakdownChartProps> = React.memo(
  ({ sessions }) => {
    // State for time scale and number of months
    const [timeScale, setTimeScale] = useState<TimeScale>('month');
    const [numMonths, setNumMonths] = useState<number>(6);

    // Handle changes in time scale
    const handleTimeScaleChange = (event: SelectChangeEvent<TimeScale>) => {
      const value = event.target.value as TimeScale;
      setTimeScale(value);
    };

    // Handle changes in number of months
    const handleNumMonthsChange = (event: SelectChangeEvent<number>) => {
      const value = parseInt(event.target.value as string, 10);
      setNumMonths(value);
    };

    // Calculate the cutoff date based on the number of months selected
    const cutoffDate = useMemo(() => {
      const date = new Date();
      date.setMonth(date.getMonth() - numMonths);
      return date;
    }, [numMonths]);

    // Filter sessions to include only those within the selected number of months
    const filteredSessions = useMemo(() => {
      return sessions.filter((session) => new Date(session.date) >= cutoffDate);
    }, [sessions, cutoffDate]);

    // Aggregate data based on the selected time scale
    const aggregatedData = useMemo(() => {
      const dataMap: Record<string, number> = {};

      filteredSessions.forEach((session) => {
        let key: string;
        const sessionDate = new Date(session.date);
        switch (timeScale) {
          case 'day':
            key = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD
            break;
          case 'week': {
            const weekNumber = getWeekNumber(sessionDate);
            key = `${sessionDate.getFullYear()}-W${weekNumber}`;
            break;
          }
          case 'month':
          default:
            key = `${sessionDate.getFullYear()}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
            break;
        }
        dataMap[key] = (dataMap[key] || 0) + 1; // Increment count for the key
      });

      // Generate all possible keys within the range and ensure continuity
      const allKeys: string[] = [];
      const startDate = new Date(cutoffDate);
      const currentDate = new Date(startDate);

      while (currentDate <= new Date()) {
        let key: string;
        switch (timeScale) {
          case 'day':
            key = currentDate.toISOString().split('T')[0];
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'week': {
            const weekNum = getWeekNumber(currentDate);
            key = `${currentDate.getFullYear()}-W${weekNum}`;
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          }
          case 'month':
          default:
            key = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
        allKeys.push(key);
      }

      const finalData = allKeys.map((key) => ({
        x: key,
        y: dataMap[key] || 0, // Use the count from dataMap, default to 0 if not found
      }));

      return finalData;
    }, [filteredSessions, timeScale, cutoffDate]);

    // Series data for the BarChart
    const series = useMemo(() => {
      return [
        {
          label: 'Training Sessions',
          data: aggregatedData.map((dataPoint) => dataPoint.y),
        },
      ];
    }, [aggregatedData]);

    return (
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: 'background.paper',
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Training Sessions Over Time
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl variant="outlined" size="small">
              <InputLabel id="time-scale-label">Time Scale</InputLabel>
              <Select
                labelId="time-scale-label"
                value={timeScale}
                onChange={handleTimeScaleChange}
                label="Time Scale"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small">
              <InputLabel id="num-months-label">Latest Months</InputLabel>
              <Select
                labelId="num-months-label"
                value={numMonths}
                onChange={handleNumMonthsChange}
                label="Latest Months"
              >
                {[3, 6, 12, 24].map((month) => (
                  <MenuItem key={month} value={month}>
                    {month} {month === 1 ? 'Month' : 'Months'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ height: 400 }}>
            <BarChart
              series={series}
              xAxis={[
                {
                  scaleType: 'band',
                  data: aggregatedData.map((dataPoint) => dataPoint.x),
                },
              ]}
              colors={['#1976d2']}
            />
          </Box>
        </Box>
      </Paper>
    );
  },
);

// Utility function to get ISO week number
function getWeekNumber(d: Date): number {
  // Copy date so don't modify original
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  // Calculate week number
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

export default TrainingTypeBreakdownChart;
