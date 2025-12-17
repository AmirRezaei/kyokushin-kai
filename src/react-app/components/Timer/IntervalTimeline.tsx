// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Timer/IntervalTimeline.tsx
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

import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import React from 'react';

import {Interval} from './IntervalConfig';

interface CompletedRepeat {
   interval: Interval;
   completedRepetitions: number;
}
interface IntervalOverviewProps {
   intervals: Interval[];
   currentIntervalIndex: number;
   currentRepeatCount: number;
   timeLeft: number;
   completedRepeats: CompletedRepeat[];
}

const IntervalTimelineItem: React.FC<{
   interval: Interval;
   isActive: boolean;
   isCompleted: boolean;
   completedRepetitions: number;
   progress: number;
   currentRepeatCount: number;
}> = ({interval, isActive, isCompleted, completedRepetitions, progress, currentRepeatCount}) => (
   <TimelineItem>
      <TimelineOppositeContent
         sx={{
            m: 'auto 0',
            color: isActive ? 'primary.main' : 'text.secondary',
         }}>
         <Typography variant='body1'>{`Repeats: ${completedRepetitions}/${interval.repeat}`}</Typography>
      </TimelineOppositeContent>

      <TimelineSeparator>
         <TimelineDot color={isActive ? 'primary' : isCompleted ? 'success' : 'grey'} variant={isActive || isCompleted ? 'filled' : 'outlined'} />
         <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{py: '12px', px: 2}}>
         <Typography variant='h6' component='span' color={isActive ? 'primary' : 'text.primary'}>
            {interval.name}
         </Typography>
         <Typography>Duration: {interval.duration}s</Typography>
         {isActive && (
            <Box mt={1}>
               <LinearProgress variant='determinate' value={progress} sx={{height: '10px', borderRadius: '5px'}} />
            </Box>
         )}
      </TimelineContent>
   </TimelineItem>
);

const calculateProgress = (timeLeft: number, duration: number): number => Math.min(Math.max(((duration - timeLeft) / duration) * 100, 0), 100);

export const IntervalTimeline: React.FC<IntervalOverviewProps> = ({intervals, currentIntervalIndex, currentRepeatCount, timeLeft, completedRepeats}) => {
   if (!intervals.length) {
      return <Typography align='center'>No intervals available</Typography>;
   }

   return (
      <Box mt={4}>
         <Typography variant='h5' align='center' gutterBottom>
            Interval Timeline
         </Typography>
         <Timeline position='alternate'>
            {intervals.map((interval, index) => {
               const isActive = index === currentIntervalIndex;
               const completedRepeat = completedRepeats.find(cr => cr.interval.name === interval.name);
               const isCompleted = !!completedRepeat && completedRepeat.completedRepetitions > 0;
               const progress = isActive ? calculateProgress(timeLeft, interval.duration) : 0;
               const completedRepetitions = completedRepeat?.completedRepetitions ?? 0;

               return <IntervalTimelineItem key={index} interval={interval} isActive={isActive} isCompleted={isCompleted} completedRepetitions={completedRepetitions} progress={progress} currentRepeatCount={currentRepeatCount} />;
            })}
         </Timeline>
      </Box>
   );
};
