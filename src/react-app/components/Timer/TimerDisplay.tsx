// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Timer/TimerDisplay.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - **Core Frameworks:** React, Next.js
// - **UI/Styling:** MUI v6, TailwindCSS
// - **TypeScript:** Strict Mode Enabled
// - **Package Manager:** Yarn
//
// ? Additional Libraries:
// - **Drag-and-Drop:** @dnd-kit/core, @dnd-kit/sortable
// - **Utilities:** Lodash, UUID
// - **Data Handling:** XLSX, react-papaparse
// - **Icons:** MUI Icons, React Icons
// - **Routing:** React Router DOM
//
// ! Development Environment:
// - **OS:** Windows
// - **Tools:** PowerShell, VSCode
//
// ! Coding Guidelines:
// 1. **Purpose Summary:** Provide a concise description of the file's role based on the "Purpose" section.
// 2. **Code Quality:** Ensure code is readable, maintainable, and optimized for performance.
// 3. **State Management:** Use immutable state updates and minimize state where possible.
// 4. **Rendering Optimization:** Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
// 5. **State Management Libraries:** Avoid prop drilling by leveraging Context API or state management libraries.
// 6. **Side Effects Management:**
//    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    - Clean up side effects in useEffect and manage dependencies carefully.
//    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at src/components/utils/localStorageUtils.ts.
//        - **Function Signatures:**
//          - 'const getLocalStorageItem = <T,>(key: string, defaultValue: T): T'
//          - 'const setLocalStorageItem = <T,>(key: string, value: T): void'
// 7. **Modularization:** Break down large components into smaller, reusable parts.
// 8. **Semantic HTML & Styling:** Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. **Error Handling:**
//    - Implement robust error handling.
//    - Use the Error Boundary component located at src/components/utils/ErrorBoundary.tsx to catch and handle JavaScript errors in the component tree.
//    - Provide user-friendly feedback in case of errors.
// 10. **Reactive State:** Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. **Security:** Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. **Code Conciseness:** Ensure all generated code is concise and excludes this header.
// HEADER-END
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import React, {useMemo} from 'react';

import {Interval} from './IntervalConfig';

interface CompletedRepeat {
   interval: Interval; // The interval corresponding to this repeat.
   completedRepetitions: number; // Number of completed repetitions.
}

interface TimerDisplayProps {
   timeLeft: number; // Remaining time in seconds for the current interval.
   isRunning: boolean; // Indicates if the timer is active.
   currentInterval: Interval; // Details of the current interval.
   currentRepeatCount?: number; // Current repetition count, optional with default.
   completedRepeats?: CompletedRepeat[]; // List of completed intervals and their repetitions.
   upcomingIntervals?: Interval[]; // List of upcoming intervals.
   countDown: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(({timeLeft, isRunning, currentInterval, currentRepeatCount = 1, completedRepeats = [], upcomingIntervals = [], countDown}) => {
   // Determine if the countdown is active
   const isCountdownActive = countDown > 0;

   // Memoize progress calculation to optimize performance
   const progress = useMemo(() => {
      if (isCountdownActive) {
         // Progress for countdown
         return ((currentInterval.countDown - countDown) / countDown) * 100;
      } else if (currentInterval) {
         // Progress for current interval
         return ((currentInterval.duration - timeLeft) / currentInterval.duration) * 100;
      }
      return 0;
   }, [isCountdownActive, countDown, currentInterval, timeLeft]);

   // Determine the display label based on countdown
   const displayLabel = useMemo(() => {
      if (isCountdownActive) {
         return `Starting in ${countDown}s`;
      }
      return currentInterval ? currentInterval.name : 'No Interval';
   }, [isCountdownActive, countDown, currentInterval]);

   // Determine the sub-label based on countdown and interval type
   const subLabel = useMemo(() => {
      if (isCountdownActive) {
         return null; // No sub-label during countdown
      }
      if (currentInterval) {
         return currentInterval.type === 'Action' ? `Repetition: ${currentRepeatCount}/${currentInterval.repeat}` : `Pause Duration: ${currentInterval.duration}s`;
      }
      return null;
   }, [isCountdownActive, currentInterval, currentRepeatCount]);

   return (
      <>
         {/* Current Interval or Countdown Display */}
         <Typography variant='h4' align='center' sx={{marginBottom: 2}}>
            {displayLabel}
         </Typography>
         {!isCountdownActive && subLabel && (
            <Typography variant='body1' align='center'>
               {subLabel}
            </Typography>
         )}
         <Typography
            variant='h2'
            align='center'
            sx={{
               fontWeight: 'bold',
               color: isRunning ? 'primary.main' : 'text.secondary',
            }}
            aria-live='polite'>
            {isCountdownActive ? `${countDown}s` : `${timeLeft}s`}
         </Typography>
         {currentInterval && (
            <LinearProgress
               variant='determinate'
               value={progress}
               sx={{
                  height: 10,
                  borderRadius: 5,
                  marginTop: 2,
               }}
               aria-label={isCountdownActive ? `Countdown Progress: ${Math.round(progress)}%` : `Interval Progress: ${Math.round(progress)}%`}
            />
         )}
      </>
   );
});

export default TimerDisplay;
