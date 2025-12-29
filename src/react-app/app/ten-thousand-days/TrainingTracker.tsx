// File: ./src/app/ten-thousand-days/TrainingTracker.tsx

import {
  Box,
  Button,
  Paper,
  Slider,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { CheckCircle2, Footprints, Info, Medal, Trophy, Calendar, Target } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { SettingsManager } from '@/helper/SettingsManager';
import type { GradeHistoryEntry } from '@/types/settings';
import { KyokushinRepository } from '../../../data/repo/KyokushinRepository';
import {
  getFormattedGradeName,
  getBeltColorHex,
  getBeltName,
} from '../../../data/repo/gradeHelpers';

import { KYOKUSHIN_SKK_ADULT_RANK_REQUIREMENTS } from './kyokushinRankRequirements';

export const TrainingTracker: React.FC = () => {
  const theme = useTheme();
  const [daysTrained, setDaysTrained] = useState<number>(() => SettingsManager.getTrainedDays());
  const history = useState<GradeHistoryEntry[]>(() => SettingsManager.getGradeHistory())[0];

  // Initialize check-in state
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(() =>
    SettingsManager.getLastTrainingDate(),
  );
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
        cumulativeSessions += requirement.minSessionsFromPrevious;
      } else {
        const months = requirement.minTimeFromPreviousMonths || 0;
        const sessionsPerWeek = 3;
        const weeksPerMonth = 4.3;
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
      .map((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - entryDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const positionDay = daysTrained - diffDays;

        if (positionDay < 0) return null;

        const grade = grades.find((g) => g.id === entry.gradeId);
        if (!grade) return null;

        return {
          day: positionDay,
          label: getFormattedGradeName(grade),
          date: entry.date,
          color: getBeltColorHex(grade.beltColor),
          beltName: getBeltName(grade),
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

    SettingsManager.setTrainedDays(newDays, { lastTrainingDate: today });
  };

  // Calculate progress percentage for visual timeline using linear scaling
  const progress = Math.max(0, Math.min((daysTrained / MASTER_MILESTONE) * 100, 100));

  // Calculate stats
  const daysToBeginnerMilestone = Math.max(0, BEGINNER_MILESTONE - daysTrained);
  const daysToMasterMilestone = Math.max(0, 10000 - daysTrained);
  const progressPercentage = ((daysTrained / 10000) * 100).toFixed(1);

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                theme.palette.primary.main,
                0.05,
              )} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  CURRENT STREAK
                </Typography>
                <Calendar size={20} color={theme.palette.primary.main} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {daysTrained.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Days Trained
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(
                theme.palette.success.main,
                0.05,
              )} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  PROGRESS
                </Typography>
                <Target size={20} color={theme.palette.success.main} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {progressPercentage}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                To Mastery
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(
                theme.palette.warning.main,
                0.05,
              )} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TO BEGINNER
                </Typography>
                <Medal size={20} color={theme.palette.warning.main} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {daysToBeginnerMilestone.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Days Remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(
                theme.palette.error.main,
                0.05,
              )} 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TO MASTER
                </Typography>
                <Trophy size={20} color={theme.palette.error.main} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {daysToMasterMilestone.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Days Remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tracker */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
            theme.palette.background.default,
            0.5,
          )} 100%)`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                The Path to Mastery
              </Typography>
              <Tooltip
                title='"The Martial Way begins with one thousand days and is mastered after ten thousand days of training."'
                arrow
              >
                <Box sx={{ color: 'text.secondary', cursor: 'help' }}>
                  <Info size={20} />
                </Box>
              </Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Track your daily dedication and progress
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: { xs: '100%', md: 250 },
            }}
          >
            <Button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday}
              variant="contained"
              size="large"
              color={hasCheckedInToday ? 'success' : 'primary'}
              startIcon={hasCheckedInToday ? <CheckCircle2 /> : <Footprints />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 1.5,
                boxShadow: hasCheckedInToday ? 2 : 4,
                '&:hover': {
                  boxShadow: hasCheckedInToday ? 2 : 8,
                  transform: hasCheckedInToday ? 'none' : 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {hasCheckedInToday ? 'Recorded Today' : 'Osu! Check In'}
            </Button>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: 1,
                  textAlign: 'center',
                  display: 'block',
                  mb: 1,
                }}
              >
                Timeline Range: {timelineRange.toLocaleString()} Days
              </Typography>
              <Slider
                value={timelineRange}
                onChange={(_, value) => setTimelineRange(value as number)}
                min={1000}
                max={10000}
                step={1000}
                marks
                sx={{
                  '& .MuiSlider-thumb': {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Visual Timeline Illustration */}
        <Box
          sx={{
            position: 'relative',
            pt: 6,
            pb: 4,
            px: { xs: 2, md: 4 },
            userSelect: 'none',
            background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.3)} 0%, ${alpha(
              theme.palette.background.paper,
              0,
            )} 100%)`,
            borderRadius: 2,
            mt: 3,
          }}
        >
          <Box sx={{ position: 'relative', height: 140 }}>
            {/* Timeline Axis Background with tick marks */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: '100%',
                transform: 'translateY(-50%)',
              }}
            >
              {/* Main axis line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  width: '100%',
                  height: 2,
                  background: `linear-gradient(90deg, 
                        ${alpha(theme.palette.divider, 0.3)} 0%, 
                        ${alpha(theme.palette.divider, 0.5)} 50%, 
                        ${alpha(theme.palette.divider, 0.3)} 100%)`,
                  transform: 'translateY(-50%)',
                  boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
              />

              {/* Tick marks every 10% */}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((percent) => {
                const isMajor = percent % 50 === 0; // 0%, 50%, 100% are major ticks
                const isMedium = percent % 25 === 0 && !isMajor; // 25%, 75% are medium ticks
                const dayValue = Math.round((percent / 100) * MASTER_MILESTONE);

                return (
                  <Box
                    key={percent}
                    sx={{
                      position: 'absolute',
                      left: `${percent}%`,
                      top: '50%',
                      transform: 'translateX(-50%) translateY(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 3,
                    }}
                  >
                    {/* Tick mark */}
                    <Box
                      sx={{
                        width: 2,
                        height: isMajor ? 16 : isMedium ? 12 : 8,
                        bgcolor: isMajor
                          ? alpha(theme.palette.text.primary, 0.4)
                          : isMedium
                            ? alpha(theme.palette.text.secondary, 0.3)
                            : alpha(theme.palette.divider, 0.4),
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    />
                    {/* Day label for major and medium ticks */}
                    {(isMajor || isMedium) && percent !== 0 && percent !== 100 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMajor ? '0.65rem' : '0.55rem',
                          color: isMajor
                            ? 'text.secondary'
                            : alpha(theme.palette.text.secondary, 0.6),
                          fontWeight: isMajor ? 600 : 400,
                          mt: 0.5,
                          userSelect: 'none',
                        }}
                      >
                        {dayValue.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Progress Bar Track (sits on top of axis) */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: '100%',
                height: 10,
                background: `linear-gradient(90deg, 
                     ${alpha(theme.palette.background.default, 0.6)} 0%, 
                     ${alpha(theme.palette.background.paper, 0.8)} 50%, 
                     ${alpha(theme.palette.background.default, 0.6)} 100%)`,
                borderRadius: 5,
                transform: 'translateY(-50%)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `
                     inset 0 2px 4px ${alpha(theme.palette.common.black, 0.1)},
                     0 1px 2px ${alpha(theme.palette.common.white, 0.1)}
                  `,
                zIndex: 4,
              }}
            />

            {/* Active Progress Bar with animated gradient */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                height: 10,
                background: `linear-gradient(90deg, 
                     ${theme.palette.primary.main} 0%, 
                     ${theme.palette.primary.light} 30%,
                     ${theme.palette.secondary.light} 70%,
                     ${theme.palette.secondary.main} 100%)`,
                borderRadius: 5,
                transform: 'translateY(-50%)',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                width: `${progress}%`,
                boxShadow: `
                     0 0 30px ${alpha(theme.palette.primary.main, 0.6)},
                     0 4px 12px ${alpha(theme.palette.primary.main, 0.4)},
                     inset 0 1px 0 ${alpha(theme.palette.common.white, 0.3)}
                  `,
                zIndex: 6,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, 
                        transparent 0%, 
                        ${alpha(theme.palette.common.white, 0.3)} 50%, 
                        transparent 100%)`,
                  borderRadius: 5,
                  animation: 'shimmer 3s infinite',
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                  },
                },
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
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 3,
                  borderColor: 'primary.main',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  zIndex: 10,
                  transition: 'all 0.5s',
                  transform: 'translateY(-36px)',
                  boxShadow: `
                           0 4px 12px ${alpha(theme.palette.primary.main, 0.3)},
                           0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}
                        `,
                }}
              >
                <Footprints size={18} color={theme.palette.primary.main} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  textAlign: 'center',
                  color: 'primary.main',
                  textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
              >
                Start
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem' }}>
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
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: 3,
                    borderColor: daysTrained >= BEGINNER_MILESTONE ? 'warning.main' : 'grey.400',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    zIndex: 10,
                    transition: 'all 0.5s',
                    transform: 'translateY(-36px)',
                    boxShadow:
                      daysTrained >= BEGINNER_MILESTONE
                        ? `
                              0 4px 16px ${alpha(theme.palette.warning.main, 0.4)},
                              0 0 0 4px ${alpha(theme.palette.warning.main, 0.15)},
                              0 0 30px ${alpha(theme.palette.warning.main, 0.3)}
                           `
                        : `0 2px 8px ${alpha(theme.palette.grey[500], 0.2)}`,
                  }}
                >
                  <Medal
                    size={18}
                    color={
                      daysTrained >= BEGINNER_MILESTONE
                        ? theme.palette.warning.main
                        : theme.palette.grey[400]
                    }
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    color: daysTrained >= BEGINNER_MILESTONE ? 'warning.main' : 'text.secondary',
                    textAlign: 'center',
                    textShadow:
                      daysTrained >= BEGINNER_MILESTONE
                        ? `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`
                        : 'none',
                  }}
                >
                  Beginner
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem' }}>
                  1,000 Days
                </Typography>
              </Box>
            )}

            {/* 10,000 Days Point */}
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
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: 3,
                    borderColor: daysTrained >= 10000 ? 'error.main' : 'grey.400',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    zIndex: 10,
                    transition: 'all 0.5s',
                    transform: 'translateY(-36px)',
                    boxShadow:
                      daysTrained >= 10000
                        ? `
                              0 4px 20px ${alpha(theme.palette.error.main, 0.5)},
                              0 0 0 4px ${alpha(theme.palette.error.main, 0.2)},
                              0 0 40px ${alpha(theme.palette.error.main, 0.4)}
                           `
                        : `0 2px 8px ${alpha(theme.palette.grey[500], 0.2)}`,
                  }}
                >
                  <Trophy
                    size={18}
                    color={
                      daysTrained >= 10000 ? theme.palette.error.main : theme.palette.grey[400]
                    }
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    color: daysTrained >= 10000 ? 'error.main' : 'text.secondary',
                    textAlign: 'center',
                    textShadow:
                      daysTrained >= 10000
                        ? `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`
                        : 'none',
                  }}
                >
                  Master
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem' }}>
                  10,000 Days
                </Typography>
              </Box>
            )}

            {/* Belt Milestone Markers - Belt Stripes */}
            {BELT_MILESTONES.filter((milestone) => milestone.days <= MASTER_MILESTONE).map(
              (milestone, index) => {
                const milestoneProgress = Math.max(
                  0,
                  Math.min((milestone.days / MASTER_MILESTONE) * 100, 100),
                );
                const isAchieved = daysTrained >= milestone.days;

                return (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: `${milestoneProgress}%`,
                      transform: 'translateX(-50%) translateY(-50%)',
                      zIndex: isAchieved ? 12 : 5, // Achieved belts appear above unachieved, but below major milestones
                    }}
                  >
                    <Tooltip
                      title={
                        <Box sx={{ textAlign: 'center', p: 0.5 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {milestone.belt}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {milestone.days.toLocaleString()} days
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: 4,
                          height: 24,
                          bgcolor: milestone.color,
                          borderRadius: 1,
                          filter: isAchieved ? 'none' : 'grayscale(80%) opacity(0.3)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          boxShadow: isAchieved
                            ? `
                                       0 0 12px ${alpha(milestone.color, 0.6)},
                                       0 2px 8px ${alpha(milestone.color, 0.4)},
                                       inset 0 1px 0 ${alpha(theme.palette.common.white, 0.3)}
                                    `
                            : `0 1px 3px ${alpha(theme.palette.common.black, 0.2)}`,
                          '&:hover': {
                            filter: 'none',
                            transform: 'scaleY(1.3) scaleX(1.5)',
                            boxShadow: `
                                       0 0 20px ${alpha(milestone.color, 0.8)},
                                       0 4px 12px ${alpha(milestone.color, 0.6)},
                                       inset 0 1px 0 ${alpha(theme.palette.common.white, 0.4)}
                                    `,
                            zIndex: 25, // Bring to front on hover
                          },
                          // Add belt stripe effect
                          '&::before': isAchieved
                            ? {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: 0,
                                right: 0,
                                height: '2px',
                                bgcolor: alpha(theme.palette.common.white, 0.4),
                                transform: 'translateY(-50%)',
                              }
                            : {},
                        }}
                      />
                    </Tooltip>
                  </Box>
                );
              },
            )}

            {/* User Grade History Markers */}
            {userMilestones.map((milestone, index) => {
              const milestoneProgress = Math.max(
                0,
                Math.min((milestone.day / MASTER_MILESTONE) * 100, 100),
              );

              return (
                <Box
                  key={`user-${index}`}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: `${milestoneProgress}%`,
                    transform: 'translateX(-50%) translateY(24px)',
                    zIndex: 16,
                  }}
                >
                  <Tooltip
                    title={
                      <Box sx={{ textAlign: 'center', p: 0.5 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {milestone.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {milestone.beltName}
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {milestone.date}
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Day {milestone.day}
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="bottom"
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: milestone.color,
                        borderRadius: '50%',
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: `
                                    0 4px 12px ${alpha(milestone.color, 0.4)},
                                    0 0 0 2px ${alpha(milestone.color, 0.2)}
                                 `,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.4)',
                          boxShadow: `
                                       0 6px 16px ${alpha(milestone.color, 0.6)},
                                       0 0 0 3px ${alpha(milestone.color, 0.3)}
                                    `,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </Tooltip>
                </Box>
              );
            })}

            {/* Moving Avatar - Current Position */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateX(-50%) translateY(-36px)',
                transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 20,
                left: `${progress}%`,
              }}
            >
              <Tooltip title={`You are here - Day ${daysTrained}`} arrow>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'background.paper',
                    border: 3,
                    borderColor: 'primary.main',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `
                              0 0 30px ${alpha(theme.palette.primary.main, 0.7)},
                              0 4px 16px ${alpha(theme.palette.primary.main, 0.5)},
                              0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}
                           `,
                    cursor: 'pointer',
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': {
                        transform: 'translateY(0)',
                      },
                      '50%': {
                        transform: 'translateY(-4px)',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 1,
                          transform: 'scale(1)',
                        },
                        '50%': {
                          opacity: 0.6,
                          transform: 'scale(0.7)',
                        },
                      },
                    }}
                  />
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
