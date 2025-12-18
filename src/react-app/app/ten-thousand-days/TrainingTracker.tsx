// File: ./src/app/ten-thousand-days/TrainingTracker.tsx

import {Box, Button, Paper, Slider, Tooltip, Typography} from '@mui/material';
import {CheckCircle2, Footprints, Info, Medal, Trophy} from 'lucide-react';
import React, {useEffect, useMemo,useState} from 'react';

import {SettingsManager} from '@/helper/SettingsManager';
import type {GradeHistoryEntry} from '@/types/settings';
import { KyokushinRepository } from '../../../data/repo/KyokushinRepository';
import { getFormattedGradeName, getBeltColorHex, getBeltName } from '../../../data/repo/gradeHelpers';

import {KYOKUSHIN_SKK_ADULT_RANK_REQUIREMENTS} from './kyokushinRankRequirements';

export const TrainingTracker: React.FC = () => {
    const [daysTrained, setDaysTrained] = useState<number>(() => SettingsManager.getTrainedDays());
    const [history, setHistory] = useState<GradeHistoryEntry[]>(() => SettingsManager.getGradeHistory());
    
    // Initialize check-in state
    const [lastCheckIn, setLastCheckIn] = useState<string | null>(() => SettingsManager.getLastTrainingDate());
    const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
         const storedDate = SettingsManager.getLastTrainingDate();
         if (storedDate) {
             const today = new Date().toDateString();
             return storedDate === today;
         }
         return false;
    });

    const [timelineRange, setTimelineRange] = useState<number>(3000); // Start with 3000 days
    
    const grades = useMemo(() => KyokushinRepository.getCurriculumGrades(), []);

    // Milestones
    const BEGINNER_MILESTONE = 1000;
    const MASTER_MILESTONE = timelineRange;

   // Belt progression milestones based on SKK rank requirements
   const BELT_MILESTONES = useMemo(() => {
      let cumulativeSessions = 0;
      const milestones = [];

      const beltColors: Record<string, string> = {
         '10_kyu': '#ff6b35', // orange
         '9_kyu': '#ff6b35', // orange
         '8_kyu': '#2563eb', // blue
         '7_kyu': '#2563eb', // blue
         '6_kyu': '#eab308', // yellow
         '5_kyu': '#eab308', // yellow
         '4_kyu': '#16a34a', // green
         '3_kyu': '#16a34a', // green
         '2_kyu': '#92400e', // brown
         '1_kyu': '#92400e', // brown
         '1_dan': '#000000', // black
         '2_dan': '#000000', // black
         '3_dan': '#000000', // black
         '4_dan': '#000000', // black
         '5_dan': '#000000', // black
      };

      for (const requirement of KYOKUSHIN_SKK_ADULT_RANK_REQUIREMENTS) {
         if (requirement.minSessionsFromPrevious !== null) {
            // Use specified session count
            cumulativeSessions += requirement.minSessionsFromPrevious;
         } else {
            // Calculate sessions based on time requirement assuming 3 sessions per week
            const months = requirement.minTimeFromPreviousMonths || 0;
            const sessionsPerWeek = 3;
            const weeksPerMonth = 4.3; // approximate
            const approximateSessions = Math.ceil(months * weeksPerMonth * sessionsPerWeek);
            cumulativeSessions += approximateSessions;
         }

         milestones.push({
            days: cumulativeSessions,
            belt: requirement.name,
            color: beltColors[requirement.id] || '#000000',
         });
      }

      return milestones;
   }, []);

    // User Grade History Milestones
    const userMilestones = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return history
            .map(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);

                const diffTime = today.getTime() - entryDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const positionDay = daysTrained - diffDays;

                if (positionDay < 0) return null;

                const grade = grades.find(g => g.id === entry.gradeId);
                if (!grade) return null;

                return {
                    day: positionDay,
                    label: getFormattedGradeName(grade),
                    date: entry.date,
                    color: getBeltColorHex(grade.beltColor),
                    beltName: getBeltName(grade)
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [history, daysTrained, grades]);

   const handleCheckIn = () => {
      const today = new Date().toDateString();
      if (lastCheckIn === today) return;

      const newDays = daysTrained + 1;
      setDaysTrained(newDays);
      setLastCheckIn(today);
      setHasCheckedInToday(true);

      SettingsManager.setTrainedDays(newDays, {lastTrainingDate: today});
   };

   // Calculate progress percentage for visual timeline using linear scaling
   const progress = Math.max(0, Math.min((daysTrained / MASTER_MILESTONE) * 100, 100));

   return (
      <Paper
         elevation={3}
         sx={{
            p: {xs: 3, md: 4},
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
            backdropFilter: 'blur(10px)',
            mb: 3,
         }}>
         <Box
            sx={{
               display: 'flex',
               flexDirection: {xs: 'column', md: 'row'},
               justifyContent: 'space-between',
               alignItems: {xs: 'flex-start', md: 'center'},
               mb: 4,
               gap: 2,
            }}>
            <Box>
               <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                  <Typography variant='h5' sx={{fontWeight: 'bold'}}>
                     The Path to Mastery
                  </Typography>
                  <Tooltip title='"The Martial Way begins with one thousand days and is mastered after ten thousand days of training."' arrow>
                     <Box sx={{color: 'text.secondary', cursor: 'help'}}>
                        <Info />
                     </Box>
                  </Tooltip>
               </Box>
               <Typography variant='body2' color='text.secondary' sx={{fontStyle: 'italic'}}>
                  Track your daily dedication.
               </Typography>
            </Box>

            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  p: 2,
                  border: 1,
                  borderColor: 'grey.200',
               }}>
               <Box sx={{mr: 3, textAlign: 'right'}}>
                  <Typography variant='caption' sx={{textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1}}>
                     Current Streak
                  </Typography>
                  <Typography variant='h4' sx={{fontWeight: 'bold', color: 'primary.main'}}>
                     {daysTrained.toLocaleString()}{' '}
                     <Typography component='span' variant='body1' color='text.secondary'>
                        Days
                     </Typography>
                  </Typography>
               </Box>
               <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, minWidth: 200}}>
                  <Button
                     onClick={handleCheckIn}
                     disabled={hasCheckedInToday}
                     variant='contained'
                     color={hasCheckedInToday ? 'success' : 'primary'}
                     startIcon={hasCheckedInToday ? <CheckCircle2 /> : undefined}
                     sx={{
                        'px': 3,
                        'py': 1.5,
                        'borderRadius': 2,
                        'textTransform': 'uppercase',
                        'fontWeight': 'bold',
                        'fontSize': '0.875rem',
                        'letterSpacing': 1,
                        'boxShadow': hasCheckedInToday ? undefined : 3,
                        '&:hover': {
                           boxShadow: hasCheckedInToday ? undefined : 6,
                        },
                     }}>
                     {hasCheckedInToday ? 'Recorded' : 'Osu! Check In'}
                  </Button>

                  <Box sx={{px: 1}}>
                     <Typography variant='caption' sx={{textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1, textAlign: 'center', display: 'block'}}>
                        Timeline Range
                     </Typography>
                     <Slider
                        value={timelineRange}
                        onChange={(_, value) => setTimelineRange(value as number)}
                        min={1000}
                        max={10000}
                        step={1000}
                     />
                  </Box>
               </Box>
            </Box>
         </Box>

         {/* Visual Timeline Illustration */}
         <Box sx={{position: 'relative', pt: 4, pb: 2, userSelect: 'none'}}>
            {/* Shared track + markers container */}
            <Box sx={{position: 'relative', height: 112}}>
               {/* Progress Bar Background */}
               <Box
                  sx={{
                     position: 'absolute',
                     top: '50%',
                     left: 0,
                     width: '100%',
                     height: 4,
                     bgcolor: 'grey.300',
                     borderRadius: 2,
                     transform: 'translateY(-50%)',
                  }}
               />

               {/* Active Progress Bar */}
               <Box
                  sx={{
                     position: 'absolute',
                     top: '50%',
                     left: 0,
                     height: 4,
                     bgcolor: 'primary.main',
                     borderRadius: 2,
                     transform: 'translateY(-50%)',
                     transition: 'width 1s ease-out',
                     width: `${progress}%`,
                  }}
               />

               {/* Start Point (Day 1) */}
               <Box
                  sx={{
                     position: 'absolute',
                     top: '50%',
                     left: 0,
                     transform: 'translateX(-50%)',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                  }}>
                  <Box
                     sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 2,
                        borderColor: daysTrained >= 0 ? 'primary.main' : 'grey.400',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 0.5,
                        zIndex: 10,
                        transition: 'border-color 0.5s',
                        transform: 'translateY(-24px)',
                     }}>
                     <Footprints size={16} />
                  </Box>
                  <Typography variant='caption' sx={{fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center'}}>
                     Day 1
                  </Typography>
               </Box>

               {/* 1,000 Days Point */}
               {BEGINNER_MILESTONE <= MASTER_MILESTONE && (
                  <Box
                     sx={{
                        position: 'absolute',
                        top: '50%',
                        left: `${(BEGINNER_MILESTONE / MASTER_MILESTONE) * 100}%`,
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                     }}>
                  <Box
                     sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 2,
                        borderColor: daysTrained >= BEGINNER_MILESTONE ? 'text.primary' : 'grey.400',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 0.5,
                        zIndex: 10,
                        transition: 'all 0.5s',
                        transform: 'translateY(-24px)',
                     }}>
                     <Medal size={16} />
                  </Box>
                  <Typography
                     variant='caption'
                     sx={{
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        color: daysTrained >= BEGINNER_MILESTONE ? 'text.primary' : 'text.secondary',
                        textAlign: 'center',
                     }}>
                     1,000 Days
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{fontSize: '0.625rem', mt: 0.25, textAlign: 'center'}}>
                     (The Beginner)
                  </Typography>
               </Box>
               )}

               {/* 10,000 Days Point - only show when timeline range includes it */}
               {timelineRange >= 10000 && (
                  <Box
                     sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '100%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                     }}>
                     <Box
                        sx={{
                           width: 24,
                           height: 24,
                           borderRadius: '50%',
                           border: 2,
                           borderColor: daysTrained >= 10000 ? 'warning.main' : 'grey.400',
                           bgcolor: 'background.paper',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           mb: 0.5,
                           zIndex: 10,
                           transition: 'border-color 0.5s',
                           transform: 'translateY(-24px)',
                        }}>
                        <Trophy size={16} />
                     </Box>
                     <Typography
                        variant='caption'
                        sx={{
                           fontWeight: 'bold',
                           textTransform: 'uppercase',
                           letterSpacing: 1,
                           color: daysTrained >= 10000 ? 'warning.main' : 'text.secondary',
                           textAlign: 'center',
                        }}>
                        10,000 Days
                     </Typography>
                     <Typography variant='caption' color='text.secondary' sx={{fontSize: '0.625rem', mt: 0.25, textAlign: 'center'}}>
                        (The Master)
                     </Typography>
                  </Box>
               )}

               {/* Belt Milestone Flags */}
               {BELT_MILESTONES.filter(milestone => milestone.days <= MASTER_MILESTONE).map((milestone, index) => {
                  // Use linear scaling across the current view range
                  const milestoneProgress = Math.max(0, Math.min((milestone.days / MASTER_MILESTONE) * 100, 100));
                  return (
                     <Box
                        key={index}
                        sx={{
                           position: 'absolute',
                           top: '50%',
                           left: `${milestoneProgress}%`,
                           transform: 'translateX(-50%) translateY(-40px)',
                           zIndex: 15,
                        }}>
                        <Tooltip title={`${milestone.belt} (${milestone.days} days)`} arrow>
                           <Box
                              sx={{
                                 width: 0,
                                 height: 0,
                                 borderLeft: '8px solid transparent',
                                 borderRight: '8px solid transparent',
                                 borderBottom: `16px solid ${milestone.color}`,
                                 filter: daysTrained >= milestone.days ? 'none' : 'grayscale(100%) opacity(0.5)',
                                 transition: 'filter 0.3s',
                              }}
                           />
                        </Tooltip>
                     </Box>
                  );
               })}

               {/* User Grade History Markers */}
               {userMilestones.map((milestone, index) => {
                  const milestoneProgress = Math.max(0, Math.min((milestone.day / MASTER_MILESTONE) * 100, 100));
                  // Offset these slightly or change visual to distinguish from theoretical milestones
                  // Maybe put them on top or bottom? Or just different shape.
                  // Theoretical are triangles pointing up (border-bottom).
                  // Let's make actual grades simple circles or markers pointing down.
                  
                  return (
                     <Box
                        key={`user-${index}`}
                        sx={{
                           position: 'absolute',
                           top: '50%',
                           left: `${milestoneProgress}%`,
                           transform: 'translateX(-50%) translateY(20px)', // Below the line
                           zIndex: 16,
                        }}>
                        <Tooltip title={
                             <Box sx={{ textAlign: 'center' }}>
                                 <Typography variant="body2" fontWeight="bold">{milestone.label}</Typography>
                                 <Typography variant="caption">{milestone.beltName}</Typography>
                                 <br/>
                                 <Typography variant="caption">Date: {milestone.date}</Typography>
                                 <br/>
                                 <Typography variant="caption">Day: {milestone.day}</Typography>
                             </Box>
                        } arrow placement="bottom">
                           <Box
                              sx={{
                                 width: 16,
                                 height: 16,
                                 bgcolor: milestone.color,
                                 borderRadius: '50%', // Circle for user grade
                                 border: '2px solid white',
                                 boxShadow: 2,
                                 cursor: 'pointer',
                                 '&:hover': {
                                     transform: 'scale(1.2)',
                                 },
                                 transition: 'transform 0.2s',
                              }}
                           />
                        </Tooltip>
                     </Box>
                  );
               })}


               {/* Moving Avatar */}
               <Box
                  sx={{
                     position: 'absolute',
                     top: '50%',
                     transform: 'translateX(-50%) translateY(-24px)',
                     transition: 'left 1s ease-out',
                     zIndex: 20,
                     left: `${progress}%`,
                  }}>
                  <Tooltip title='You are here' arrow>
                     <Box
                        sx={{
                           width: 24,
                           height: 24,
                           bgcolor: 'transparent',
                           border: 2,
                           borderColor: 'primary.main',
                           borderRadius: '50%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           boxShadow: 3,
                           cursor: 'pointer',
                        }}>
                        <Box
                           sx={{
                              width: 8,
                              height: 8,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              animation: 'pulse 2s infinite',
                           }}
                        />
                     </Box>
                  </Tooltip>
               </Box>
            </Box>
         </Box>
      </Paper>
   );
};
