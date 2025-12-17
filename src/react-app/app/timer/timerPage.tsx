// HEADER-START
// * Project: Kyokushin
// * Path: src/app/timer/timerPage.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - Core Frameworks: React, Vite
// - UI/Styling: MUI v6, MUI X-Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
// - TypeScript: Strict Mode Enabled
// - Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, UUID, date-fns, tone
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
//          - const getLocalStorageItem = <T,>(key: string, defaultValue: T): T
//          - const setLocalStorageItem = <T,>(key: string, value: T): void
//          - const getLocalStorageItems = <T extends object>(key: string,defaultValue: T[]): T[]
//          - const setLocalStorageItems = <T extends object>(key: string, value: T[]): void
//          - const deleteLocalStorageItemById = <T extends { id: string }>(key: string,id: string): void
// 7. Modularization: Break down large components into smaller, reusable parts.
// 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. Error Handling:
//    - Implement robust error handling.
//    - Provide user-friendly feedback in case of errors.
// 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
// 13. This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
// 14. Avoid Duplicate Rendering during development builds due to React Strict Mode.
// HEADER-END
import {Pause as PauseIcon, PlayArrow as PlayArrowIcon, RestartAlt as RestartAltIcon, Settings as SettingsIcon, SkipNext as SkipNextIcon} from '@mui/icons-material';
import {AppBar, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Toolbar, Typography} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Interval, IntervalConfig, Tempo} from '@/components/Timer/IntervalConfig';
import {IntervalTimeline} from '@/components/Timer/IntervalTimeline';
import {SessionSummary} from '@/components/Timer/SessionSummary';
import {TempControl} from '@/components/Timer/TempControl';
import TimerDisplay from '@/components/Timer/TimerDisplay';
import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

interface CompletedRepeat {
   interval: Interval;
   completedRepetitions: number;
}

const TimerPage: React.FC = () => {
    const [intervals, setIntervals] = useState<Interval[]>([]);
   const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
   const [currentRepeatCount, setCurrentRepeatCount] = useState(0);
   const [currentBPM, setCurrentBPM] = useState(0);
   const [timeLeft, setTimeLeft] = useState(0);
   const [isRunning, setIsRunning] = useState(false);
   const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
   const [completedRepeats, setCompletedRepeats] = useState<CompletedRepeat[]>([]);
   const [sessionHistory, setSessionHistory] = useState<any[]>([]);
   const [openConfig, setOpenConfig] = useState(false);

   const [countdown, setCountdown] = useState(3);
   const [initialCountdown, setInitialCountdown] = useState(3);
   const [isLoading, setIsLoading] = useState(true);

   const timerRef = useRef<NodeJS.Timeout | null>(null);
   const countdownRef = useRef<NodeJS.Timeout | null>(null);

   const [isFirstRun, setIsFirstRun] = useState(true);

   const savedTempos = getLocalStorageItem<Tempo[]>('tempos', [{id: '', bpm: 60, label: 'default BPM'}]);

   const init = useCallback(() => {
      const savedIntervals = getLocalStorageItem<Interval[]>('intervals', []);
      if (savedIntervals.length > 0) {
         setIntervals(savedIntervals);
         setTimeLeft(savedIntervals[0]?.duration || 0);
      } else {
         const defaultIntervals: Interval[] = [
            {
               name: 'Warm-up',
               countDown: 3,
               duration: 60,
               repeat: 1,
               type: 'Action',
            },
            {
               name: 'Exercise',
               countDown: 0,
               duration: 120,
               repeat: 3,
               type: 'Action',
            },
            {name: 'Rest', countDown: 0, duration: 60, repeat: 2, type: 'Pause'},
         ];
         setIntervals(defaultIntervals);
         setTimeLeft(defaultIntervals[0].duration);
         setLocalStorageItem('intervals', defaultIntervals);
         setCountdown(defaultIntervals[0].countDown);
         setInitialCountdown(defaultIntervals[0].countDown);
      }
      setIsLoading(false);
   }, []);

   useEffect(() => {
      init();
      return () => {
         if (timerRef.current) clearTimeout(timerRef.current);
         if (countdownRef.current) clearTimeout(countdownRef.current);
      };
   }, [init]);

   const currentInterval = intervals[currentIntervalIndex];

   const handleRestart = (newIntervals?: Interval[]) => {
      setIsRunning(false);
      setIsFirstRun(true);
      setCurrentIntervalIndex(0);
      setCurrentRepeatCount(0);
      setTimeLeft(newIntervals ? newIntervals[0]?.duration || 0 : intervals[0]?.duration || 0);
      setCompletedRepeats([]);
      setCountdown(newIntervals ? newIntervals[0]?.countDown || 0 : intervals[0]?.countDown || 0);
      setIsMetronomePlaying(false);
   };

   const hasMoreRepetitions = (interval: Interval): boolean => {
      return currentRepeatCount < interval.repeat - 1;
   };

   const hasMoreIntervals = (): boolean => {
      return currentIntervalIndex < intervals.length - 1;
   };

   const handleNextRepetition = (interval: Interval) => {
      setCompletedRepeats(prev => {
         const existing = prev.find(cr => cr.interval.name === interval.name);
         if (existing) {
            return prev.map(cr => (cr.interval.name === interval.name ? {...cr, completedRepetitions: cr.completedRepetitions + 1} : cr));
         }
         return [...prev, {interval, completedRepetitions: 1}];
      });

      setCurrentRepeatCount(prev => prev + 1);
      setTimeLeft(interval.duration);
   };

   const handleNextInterval = (interval: Interval) => {
      setCompletedRepeats(prev => {
         const existing = prev.find(cr => cr.interval.name === interval.name);
         if (existing) {
            return prev.map(cr => (cr.interval.name === interval.name ? {...cr, completedRepetitions: cr.completedRepetitions + 1} : cr));
         }
         return [...prev, {interval, completedRepetitions: currentRepeatCount + 1}];
      });

      setCurrentIntervalIndex(prev => prev + 1);
      setCurrentRepeatCount(0);

      const nextInterval = intervals[currentIntervalIndex + 1];
      setTimeLeft(nextInterval.duration);
   };

   const finalizeSession = (interval: Interval) => {
      setCompletedRepeats(prev => {
         const existing = prev.find(cr => cr.interval.name === interval.name);
         if (existing) {
            return prev.map(cr => (cr.interval.name === interval.name ? {...cr, completedRepetitions: interval.repeat} : cr));
         }
         return [...prev, {interval, completedRepetitions: interval.repeat}];
      });

      setIsRunning(false);
      saveSessionHistory();
      setIsMetronomePlaying(false);
   };

   const shouldRestart = (): boolean => {
      const isLastInterval = currentIntervalIndex === intervals.length - 1;
      const isLastRepetition = currentRepeatCount === (intervals[currentIntervalIndex]?.repeat ?? 1) - 1;
      const isTimeLeftZero = timeLeft === 0;

      return isLastInterval && isLastRepetition && isTimeLeftZero;
   };

   const startTimer = (): void => {
      setIsRunning(true);
      if (isFirstRun) {
         setCountdown(initialCountdown);
         setIsFirstRun(false);
      }
      if (timeLeft === 0) {
         setTimeLeft(currentInterval.duration);
      }
      if (currentInterval.type === 'Action') {
         playSoundPlayback(currentInterval);
      }
   };

   const playSoundPlayback = (interval: Interval): void => {
      const bpm = savedTempos.find(tempo => tempo.id === interval.tempoId)?.bpm || 60;
      setCurrentBPM(bpm);
      setIsMetronomePlaying(true);
   };

   const stopSoundPlayback = (): void => {
      setIsMetronomePlaying(false);
   };

   const handleStart = () => {
      if (shouldRestart()) {
         handleRestart(intervals);
      } else {
         startTimer();
      }
   };

   const handlePause = () => {
      setIsRunning(false);
      stopSoundPlayback();
   };

   const handleSkip = () => {
      handleNextStep();
   };

   const handleNextStep = () => {
      const interval = intervals[currentIntervalIndex];

      if (hasMoreRepetitions(interval)) {
         handleNextRepetition(interval);
         if (interval.type === 'Action') {
            playSoundPlayback(interval);
         } else {
            stopSoundPlayback();
         }
      } else if (hasMoreIntervals()) {
         handleNextInterval(interval);
         const nextInterval = intervals[currentIntervalIndex + 1];
         if (nextInterval.type === 'Action') {
            playSoundPlayback(nextInterval);
         } else {
            stopSoundPlayback();
         }
      } else {
         finalizeSession(interval);
      }
   };

   useEffect(() => {
      if (isRunning) {
         if (countdown > 0) {
            countdownRef.current = setTimeout(() => {
               setCountdown(prev => prev - 1);
            }, 1000);
         } else if (timeLeft > 0) {
            timerRef.current = setTimeout(() => {
               setTimeLeft(prev => prev - 1);
            }, 1000);
         }
      }

      return () => {
         if (countdownRef.current) clearTimeout(countdownRef.current);
         if (timerRef.current) clearTimeout(timerRef.current);
      };
   }, [isRunning, countdown, timeLeft]);

   useEffect(() => {
      if (isRunning && timeLeft === 0) {
         handleNextStep();
      }
   }, [timeLeft, isRunning]);

   const saveSessionHistory = () => {
      const newHistory = [...sessionHistory, {intervals, date: new Date()}];
      setSessionHistory(newHistory);
      setLocalStorageItem('sessionHistory', newHistory);
   };

   const handleOpenConfig = () => setOpenConfig(true);
   const handleCloseConfig = () => setOpenConfig(false);

   const handleSaveConfig = (newIntervals: Interval[]) => {
      setIntervals(newIntervals);
      setLocalStorageItem('intervals', newIntervals);
      setOpenConfig(false);
      handleRestart(newIntervals);
   };

   const upcomingIntervals = isRunning ? intervals.slice(currentIntervalIndex + 1) : intervals;

   const isProgramFinished = currentIntervalIndex === intervals.length - 1 && currentRepeatCount === intervals[currentIntervalIndex]?.repeat - 1 && timeLeft === 0;

   if (isLoading) {
      return <Typography align='center'>Loading...</Typography>;
   }

   return (
      <Container maxWidth='md'>
         <AppBar position='static'>
            <Toolbar>
               <Typography variant='h6' style={{flexGrow: 1}}>
                  Interval Timer
               </Typography>
               <IconButton color='inherit' onClick={handleOpenConfig}>
                  <SettingsIcon />
               </IconButton>
            </Toolbar>
         </AppBar>
         <Grid container spacing={2} alignItems='center' justifyContent='center' style={{marginTop: 20}}>
            <Grid item xs={12}>
               <TimerDisplay timeLeft={timeLeft} isRunning={isRunning} currentInterval={currentInterval} currentRepeatCount={currentRepeatCount} completedRepeats={completedRepeats} upcomingIntervals={upcomingIntervals} countDown={countdown} />
            </Grid>
            <Grid item>
               {isRunning ? (
                  <Button variant='contained' color='secondary' onClick={handlePause} startIcon={<PauseIcon />}>
                     Pause
                  </Button>
               ) : (
                  <Button variant='contained' color='primary' onClick={handleStart} startIcon={<PlayArrowIcon />} disabled={isProgramFinished}>
                     {isProgramFinished ? 'Restart' : 'Start'}
                  </Button>
               )}
            </Grid>
            <Grid item>
               <Button variant='contained' onClick={() => handleRestart(intervals)} startIcon={<RestartAltIcon />} disabled={isProgramFinished}>
                  Restart
               </Button>
            </Grid>
            <Grid item>
               <Button variant='contained' onClick={handleSkip} startIcon={<SkipNextIcon />} disabled={!isRunning || isProgramFinished}>
                  Skip
               </Button>
            </Grid>
            <Grid item xs={12}>
               <IntervalTimeline intervals={intervals} currentIntervalIndex={currentIntervalIndex} currentRepeatCount={currentRepeatCount} timeLeft={timeLeft} completedRepeats={completedRepeats} />
            </Grid>
            <Grid item xs={12}>
               <TempControl />
            </Grid>
            <Grid item xs={12}>
               <SessionSummary intervals={intervals} />
            </Grid>
         </Grid>
         <Dialog open={openConfig} onClose={handleCloseConfig} fullWidth maxWidth='sm'>
            <DialogTitle>Configure Intervals</DialogTitle>
            <DialogContent>
               <IntervalConfig onSave={handleSaveConfig} initialIntervals={intervals} />
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseConfig} color='secondary'>
                  Cancel
               </Button>
            </DialogActions>
         </Dialog>
         {/* MetronomeControl Component */}
         {/* <MetronomeControl
            isPlaying={isMetronomePlaying}
            setIsPlaying={setIsMetronomePlaying}
            tempo={currentBPM}
         /> */}
      </Container>
   );
};

export default TimerPage;