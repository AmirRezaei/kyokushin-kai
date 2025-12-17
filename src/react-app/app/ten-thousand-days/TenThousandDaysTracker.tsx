// File: ./src/components/kyokushin/TenThousandDaysTracker.tsx

import {Box, Button, LinearProgress, Paper, Stack, Tooltip, Typography} from '@mui/material';
import * as React from 'react';

const STORAGE_KEY = 'kyokushin.tenThousandDaysTracker.v1';
const MAX_DAYS = 10_000;
const BEGINNER_DAYS = 1_000;

interface TrackerState {
   totalDays: number;
   streak: number;
   lastCheckInDate: string | null; // YYYY-MM-DD
}

export interface TenThousandDaysTrackerProps {
   title?: string;
}

/**
 * A visual "10,000 days" journey tracker with:
 * - Daily check-in button
 * - Streak counter
 * - Total days / 10,000 progress
 * - Milestone at 1,000 days (Beginner) and final goal at 10,000 days (Master)
 * - SVG timeline with mountains and a little "traveller" moving from left (day 0) to right (day 10,000)
 */
export const TenThousandDaysTracker: React.FC<TenThousandDaysTrackerProps> = ({title = '10,000 Days Tracker'}) => {
   const [state, setState] = React.useState<TrackerState>({
      totalDays: 0,
      streak: 0,
      lastCheckInDate: null,
   });

   // --- Helpers for date handling ------------------------------------------------

   const getTodayKey = React.useCallback((): string => {
      const now = new Date();
      // Use local date; we only care about calendar day, not time
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
   }, []);

   const getYesterdayKey = React.useCallback((): string => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
   }, []);

   // --- Load / save from localStorage -------------------------------------------

   React.useEffect(() => {
      if (typeof window === 'undefined') return;

      try {
         const raw = window.localStorage.getItem(STORAGE_KEY);
         if (!raw) return;
         const parsed = JSON.parse(raw) as Partial<TrackerState>;
         setState(prev => ({
            totalDays: typeof parsed.totalDays === 'number' && parsed.totalDays >= 0 ? parsed.totalDays : prev.totalDays,
            streak: typeof parsed.streak === 'number' && parsed.streak >= 0 ? parsed.streak : prev.streak,
            lastCheckInDate: typeof parsed.lastCheckInDate === 'string' ? parsed.lastCheckInDate : prev.lastCheckInDate,
         }));
      } catch {
         // ignore corrupted storage
      }
   }, []);

   const persistState = React.useCallback((next: TrackerState) => {
      if (typeof window === 'undefined') return;
      try {
         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
         // ignore storage errors
      }
   }, []);

   // --- Derived values -----------------------------------------------------------

   const todayKey = getTodayKey();
   const yesterdayKey = getYesterdayKey();
   const alreadyCheckedInToday = state.lastCheckInDate === todayKey;

   const progressRatio = Math.max(0, Math.min(state.totalDays / MAX_DAYS, 1));
   const progressPercent = progressRatio * 100;

   const beginnerRatio = BEGINNER_DAYS / MAX_DAYS;

   const daysToBeginner = Math.max(0, BEGINNER_DAYS - state.totalDays);
   const daysToMaster = Math.max(0, MAX_DAYS - state.totalDays);

   const currentStageLabel = React.useMemo(() => {
      if (state.totalDays >= MAX_DAYS) {
         return 'Master of Routine';
      }
      if (state.totalDays >= BEGINNER_DAYS) {
         return 'Dedicated Practitioner';
      }
      if (state.totalDays > 0) {
         return 'On the Path';
      }
      return 'Standing at the Cliff Edge';
   }, [state.totalDays]);

   const currentStageDescription = React.useMemo(() => {
      if (state.totalDays >= MAX_DAYS) {
         return 'You have symbolically completed 10,000 days of check-ins. The journey never truly ends, but your discipline now defines who you are.';
      }
      if (state.totalDays >= BEGINNER_DAYS) {
         return 'You have moved beyond the early novelty phase. Training is part of your identity, and you keep climbing even on ordinary days.';
      }
      if (state.totalDays > 0) {
         return 'You have taken the first steps away from theory and into lived routine. Each check-in is another handhold on the cliff.';
      }
      return 'Your journey is still in front of you. One sincere day of practice is all it takes to begin climbing.';
   }, [state.totalDays]);

   // --- Check-in logic -----------------------------------------------------------

   const handleCheckIn = React.useCallback(() => {
      if (alreadyCheckedInToday) return;

      setState(prev => {
         const nextTotal = prev.totalDays + 1;

         let nextStreak = 1;
         if (prev.lastCheckInDate === yesterdayKey) {
            nextStreak = prev.streak + 1;
         } else if (prev.lastCheckInDate === todayKey) {
            nextStreak = prev.streak; // should not happen due to guard
         }

         const nextState: TrackerState = {
            totalDays: nextTotal,
            streak: nextStreak,
            lastCheckInDate: todayKey,
         };

         persistState(nextState);
         return nextState;
      });
   }, [alreadyCheckedInToday, persistState, todayKey, yesterdayKey]);

   // --- SVG layout constants -----------------------------------------------------

   const svgWidth = 800;
   const svgHeight = 220;
   const trackY = 150;
   const trackStartX = 80;
   const trackEndX = svgWidth - 80;

   const personX = trackStartX + (trackEndX - trackStartX) * progressRatio;
   const beginnerX = trackStartX + (trackEndX - trackStartX) * beginnerRatio;

   return (
      <Paper
         elevation={4}
         sx={{
            p: 3,
            borderRadius: 4,
            background: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at bottom right, rgba(0,0,0,0.25), transparent 55%)',
            backdropFilter: 'blur(6px)',
         }}>
         <Stack spacing={2.5}>
            <Stack direction='row' justifyContent='space-between' alignItems='baseline'>
               <Box>
                  <Typography variant='h5' fontWeight={700}>
                     {title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                     Visualising the Kyokushin idea that mastery is built one day at a time.
                  </Typography>
               </Box>

               <Stack spacing={0.5} alignItems='flex-end'>
                  <Typography variant='caption' color='text.secondary'>
                     Total check-ins
                  </Typography>
                  <Typography variant='h6' fontWeight={700}>
                     {state.totalDays.toLocaleString()} / {MAX_DAYS.toLocaleString()}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                     Streak: <strong>{state.streak}</strong> day{state.streak === 1 ? '' : 's'}
                  </Typography>
               </Stack>
            </Stack>

            {/* Progress bar + labels */}
            <Stack spacing={1.2}>
               <LinearProgress
                  variant='determinate'
                  value={progressPercent}
                  sx={{
                     'height': 8,
                     'borderRadius': 999,
                     '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                     },
                  }}
               />
               <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Box>
                     <Typography variant='caption' color='text.secondary'>
                        Current Stage
                     </Typography>
                     <Typography variant='subtitle2' fontWeight={600}>
                        {currentStageLabel}
                     </Typography>
                  </Box>
                  <Box textAlign='right'>
                     <Typography variant='caption' color='text.secondary'>
                        To Beginner (1,000 days)
                     </Typography>
                     <Typography variant='body2'>{daysToBeginner === 0 ? 'Reached' : `${daysToBeginner} day${daysToBeginner === 1 ? '' : 's'} left`}</Typography>
                  </Box>
                  <Box textAlign='right'>
                     <Typography variant='caption' color='text.secondary'>
                        To Master (10,000 days)
                     </Typography>
                     <Typography variant='body2'>{daysToMaster === 0 ? 'Symbolically complete' : `${daysToMaster} day${daysToMaster === 1 ? '' : 's'} left`}</Typography>
                  </Box>
               </Stack>
            </Stack>

            {/* SVG Journey Visualization */}
            <Box
               sx={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0,0,0,0.15)',
               }}>
               <Box
                  component='svg'
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  sx={{
                     width: '100%',
                     height: 'auto',
                     display: 'block',
                  }}>
                  <defs>
                     <linearGradient id='skyGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                        <stop offset='0%' stopColor='#243b6b' />
                        <stop offset='50%' stopColor='#1a2542' />
                        <stop offset='100%' stopColor='#121827' />
                     </linearGradient>
                     <linearGradient id='trackGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                        <stop offset='0%' stopColor='#94a3b8' />
                        <stop offset='50%' stopColor='#e5e7eb' />
                        <stop offset='100%' stopColor='#facc15' />
                     </linearGradient>
                     <linearGradient id='sunGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                        <stop offset='0%' stopColor='#facc15' />
                        <stop offset='100%' stopColor='#f97316' />
                     </linearGradient>
                     <linearGradient id='mountainNear' x1='0%' y1='0%' x2='0%' y2='100%'>
                        <stop offset='0%' stopColor='#1e293b' />
                        <stop offset='100%' stopColor='#020617' />
                     </linearGradient>
                     <linearGradient id='mountainFar' x1='0%' y1='0%' x2='0%' y2='100%'>
                        <stop offset='0%' stopColor='#475569' />
                        <stop offset='100%' stopColor='#020617' />
                     </linearGradient>
                  </defs>

                  {/* Sky */}
                  <rect x={0} y={0} width={svgWidth} height={svgHeight} fill='url(#skyGradient)' />

                  {/* Sun over the "Master" peak */}
                  <circle cx={trackEndX + 30} cy={70} r={32} fill='url(#sunGradient)' opacity={0.9} />

                  {/* Far mountains */}
                  <polygon points={`0,170 160,70 320,170`} fill='url(#mountainFar)' opacity={0.6} />
                  <polygon points={`240,180 440,60 640,180`} fill='url(#mountainFar)' opacity={0.65} />
                  <polygon points={`520,190 700,80 880,190`} fill='url(#mountainFar)' opacity={0.6} />

                  {/* Near mountains */}
                  <polygon points={`-40,200 140,90 360,200`} fill='url(#mountainNear)' opacity={0.85} />
                  <polygon points={`260,210 480,80 740,210`} fill='url(#mountainNear)' opacity={0.9} />

                  {/* Ground */}
                  <rect x={0} y={trackY + 10} width={svgWidth} height={svgHeight - (trackY + 10)} fill='#020617' opacity={0.92} />

                  {/* Timeline track */}
                  <line x1={trackStartX} y1={trackY} x2={trackEndX} y2={trackY} stroke='url(#trackGradient)' strokeWidth={6} strokeLinecap='round' />

                  {/* Start marker */}
                  <circle cx={trackStartX} cy={trackY} r={7} fill='#e5e7eb' stroke='#0f172a' strokeWidth={2} />
                  <text x={trackStartX} y={trackY + 22} textAnchor='middle' fontSize={10} fill='#cbd5f5'>
                     Day 0
                  </text>

                  {/* Beginner (1,000 days) milestone */}
                  <line x1={beginnerX} y1={trackY - 12} x2={beginnerX} y2={trackY + 12} stroke='#38bdf8' strokeWidth={3} strokeLinecap='round' />
                  <circle cx={beginnerX} cy={trackY} r={5} fill='#0ea5e9' />
                  <text x={beginnerX} y={trackY - 20} textAnchor='middle' fontSize={10} fill='#e0f2fe'>
                     1,000 days
                  </text>
                  <text x={beginnerX} y={trackY - 8} textAnchor='middle' fontSize={10} fill='#bae6fd'>
                     Beginner
                  </text>

                  {/* Master (10,000 days) marker */}
                  <circle cx={trackEndX} cy={trackY} r={8} fill='#facc15' stroke='#f97316' strokeWidth={2} />
                  <text x={trackEndX} y={trackY + 22} textAnchor='middle' fontSize={10} fill='#fee89a'>
                     10,000 days
                  </text>
                  <text x={trackEndX} y={trackY + 34} textAnchor='middle' fontSize={10} fill='#fed7aa'>
                     Master
                  </text>

                  {/* Traveller / person avatar */}
                  <g transform={`translate(${personX}, ${trackY - 10})`}>
                     {/* Shadow on the track */}
                     <ellipse cx={0} cy={16} rx={10} ry={4} fill='black' opacity={0.35} />
                     {/* Body */}
                     <line x1={0} y1={-4} x2={0} y2={10} stroke='#e5e7eb' strokeWidth={2.5} strokeLinecap='round' />
                     {/* Arms */}
                     <line x1={-7} y1={3} x2={7} y2={-1} stroke='#e5e7eb' strokeWidth={2} strokeLinecap='round' />
                     {/* Legs */}
                     <line x1={0} y1={10} x2={-7} y2={18} stroke='#e5e7eb' strokeWidth={2} strokeLinecap='round' />
                     <line x1={0} y1={10} x2={7} y2={18} stroke='#e5e7eb' strokeWidth={2} strokeLinecap='round' />
                     {/* Head */}
                     <circle cx={0} cy={-10} r={6} fill='#fee2e2' stroke='#fecaca' strokeWidth={1.5} />
                     {/* Belt / obi */}
                     <line x1={-6.5} y1={7} x2={6.5} y2={7} stroke='#f97316' strokeWidth={2.2} strokeLinecap='round' />
                  </g>
               </Box>

               {/* Small overlay labels in the corner of the illustration */}
               <Box
                  sx={{
                     position: 'absolute',
                     top: 8,
                     left: 12,
                     px: 1.2,
                     py: 0.6,
                     borderRadius: 999,
                     bgcolor: 'rgba(15,23,42,0.78)',
                     border: '1px solid rgba(148,163,184,0.5)',
                  }}>
                  <Typography variant='caption' color='grey.200'>
                     Each check-in = one step along the mountain path.
                  </Typography>
               </Box>
            </Box>

            {/* Stage description + check-in */}
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems={{xs: 'stretch', sm: 'center'}} justifyContent='space-between'>
               <Box>
                  <Typography variant='subtitle2' gutterBottom>
                     Journey Insight
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                     {currentStageDescription}
                  </Typography>
               </Box>

               <Stack spacing={0.5} alignItems={{xs: 'flex-start', sm: 'flex-end'}}>
                  <Tooltip title={alreadyCheckedInToday ? 'You have already checked in today. Come back tomorrow to keep climbing.' : 'Mark today as a day of practice. One day, one step.'}>
                     <span>
                        <Button
                           variant='contained'
                           color='warning'
                           size='medium'
                           onClick={handleCheckIn}
                           disabled={alreadyCheckedInToday}
                           sx={{
                              minWidth: 180,
                              borderRadius: 999,
                              textTransform: 'none',
                              fontWeight: 600,
                              boxShadow: '0 8px 20px rgba(250, 204, 21, 0.35)',
                           }}>
                           {alreadyCheckedInToday ? 'Checked in today' : 'Check in for today'}
                        </Button>
                     </span>
                  </Tooltip>
                  <Typography variant='caption' color='text.secondary'>
                     Last check-in: {state.lastCheckInDate ? state.lastCheckInDate : 'Not yet started – your first click begins the 10,000-day journey.'}
                  </Typography>
               </Stack>
            </Stack>
         </Stack>
      </Paper>
   );
};
