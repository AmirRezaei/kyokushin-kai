// HEADER-START
// * Path: ./src/components/Achievements.tsx
// HEADER-END

// ./src/components/Achievements.tsx
'use client';
// ./src/components/Achievements.tsx
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import {styled} from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import React, {useEffect, useMemo, useState} from 'react';

import { KyokushinRepository, GradeWithContent } from '../../data/repo/KyokushinRepository';
import { getFormattedGradeName, getLevelNumber } from '../../data/repo/gradeHelpers';
import { TechniqueRecord } from '../../data/model/technique';

/**
 * Interface for Achievements Props
 */
interface AchievementsProps {
   knownTechniqueIds: string[];
   currentLevelNumber: number;
}

/**
 * Interface for Achievement Counts
 */
interface AchievementCounts {
   [key: string]: number;
}

/**
 * Styled Components
 */
const StyledCard = styled(Card)(({theme}) => ({
   minWidth: 275,
   margin: theme.spacing(2),
   borderRadius: theme.shape.borderRadius,
   boxShadow: theme.shadows[3],
}));

const TechniqueTypeBox = styled(Box)(({theme}) => ({
   display: 'flex',
   alignItems: 'center',
   marginTop: theme.spacing(1),
}));

const ProgressLabel = styled(Typography)(({theme}) => ({
   marginLeft: theme.spacing(1),
}));

const MajorAchievementBox = styled(Box)(({theme}) => ({
   display: 'flex',
   alignItems: 'center',
   marginTop: theme.spacing(1),
}));

const ExpandButton = styled(IconButton)(() => ({
   marginLeft: 'auto',
}));

const ToggleContainer = styled(Box)(({theme}) => ({
   display: 'flex',
   justifyContent: 'center',
   marginBottom: theme.spacing(4),
}));

/**
 * AchievementItem Component
 */
const AchievementItem: React.FC<{
   grade: GradeWithContent;
   subAchievements: {
      techniqueType: string;
      total: number;
      achieved: number;
   }[];
   majorAchievement: {
      total: number;
      achieved: number;
   };
   achievementCounts: AchievementCounts;
}> = ({grade, subAchievements, majorAchievement, achievementCounts}) => {
   const [expanded, setExpanded] = useState<boolean>(false);

   const handleExpandClick = () => {
      setExpanded(!expanded);
   };

   /**
    * Helper to get Technique Type Color
    */
   const getTechniqueTypeColor = (achieved: boolean) => (achieved ? 'success.main' : 'grey.500');

   /**
    * Helper to get Major Achievement Status
    */
   const getMajorAchievementStatus = (achieved: number, total: number): boolean => achieved === total;

   /**
    * Generate Unique Keys for Achievements
    */
   const majorAchievementKey = `major-${grade.id}`;

   const rankName = getFormattedGradeName(grade);

   return (
      <StyledCard>
         <CardContent>
            <Box display='flex' alignItems='center'>
               <Avatar
                  sx={{
                     bgcolor: getMajorAchievementStatus(majorAchievement.achieved, majorAchievement.total) ? 'success.main' : 'grey.500',
                     mr: 2,
                  }}>
                  {getMajorAchievementStatus(majorAchievement.achieved, majorAchievement.total) ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
               </Avatar>
               <Typography variant='h6'>{rankName}</Typography>
               <ExpandButton onClick={handleExpandClick}>{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</ExpandButton>
            </Box>
            <MajorAchievementBox>
               <Typography variant='body2' color='textSecondary'>
                  {getMajorAchievementStatus(majorAchievement.achieved, majorAchievement.total) ? 'All Techniques Mastered' : `${majorAchievement.achieved} / ${majorAchievement.total} Techniques Mastered`}
               </Typography>
               {/* Display Achievement Count */}
               <Typography
                  variant='body2'
                  color='textSecondary'
                  sx={{
                     marginLeft: 'auto',
                  }}>
                  Completed {achievementCounts[majorAchievementKey] || 0} times
               </Typography>
            </MajorAchievementBox>
            <LinearProgress
               variant='determinate'
               value={(majorAchievement.achieved / majorAchievement.total) * 100}
               sx={{
                  mt: 1,
                  height: 10,
                  borderRadius: 5,
               }}
               color={getMajorAchievementStatus(majorAchievement.achieved, majorAchievement.total) ? 'success' : 'primary'}
            />
            <Collapse in={expanded} timeout='auto' unmountOnExit>
               <Box
                  sx={{
                     mt: 3,
                  }}>
                  <Typography variant='h6' gutterBottom>
                     Sub Achievements
                  </Typography>
                  <Grid container spacing={2}>
                     {subAchievements.map(subAch => {
                        const {techniqueType, total, achieved} = subAch;
                        const progress = (achieved / total) * 100;
                        const isCompleted = achieved === total;

                        // Generate Unique Key for Sub-Achievement
                        const subAchievementKey = `sub-${grade.id}-${techniqueType}`;

                        return (
                           <Grid item xs={12} sm={6} md={4} key={subAchievementKey}>
                              <StyledCard variant='outlined'>
                                 <CardContent>
                                    <Typography variant='subtitle1' gutterBottom>
                                       {techniqueType} Techniques
                                    </Typography>
                                    <TechniqueTypeBox>
                                       <Avatar
                                          sx={{
                                             bgcolor: getTechniqueTypeColor(isCompleted),
                                          }}>
                                          {isCompleted ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
                                       </Avatar>
                                       <ProgressLabel variant='body2'>
                                          {achieved} / {total}
                                       </ProgressLabel>
                                    </TechniqueTypeBox>
                                    <LinearProgress
                                       variant='determinate'
                                       value={progress}
                                       sx={{
                                          mt: 1,
                                          height: 10,
                                          borderRadius: 5,
                                       }}
                                       color={isCompleted ? 'success' : 'primary'}
                                    />
                                    {/* Display Sub-Achievement Count */}
                                    <Typography
                                       variant='body2'
                                       color='textSecondary'
                                       sx={{
                                          mt: 1,
                                       }}>
                                       Completed {achievementCounts[subAchievementKey] || 0} times
                                    </Typography>
                                 </CardContent>
                              </StyledCard>
                           </Grid>
                        );
                     })}
                  </Grid>
               </Box>
            </Collapse>
         </CardContent>
      </StyledCard>
   );
};

/**
 * Achievements Component
 */
const Achievements: React.FC<AchievementsProps> = ({knownTechniqueIds, currentLevelNumber}) => {
   const [viewMode, setViewMode] = useState<'all' | 'current'>('current');
   const [achievementCounts, setAchievementCounts] = useState<AchievementCounts>({});
   const [achievedAchievements, setAchievedAchievements] = useState<string[]>([]);
   
   // Initialize data
   const grades = useMemo(() => KyokushinRepository.getCurriculumGrades(), []);

   /**
    * Handle Toggle Change
    */
   const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'all' | 'current' | null) => {
      if (newViewMode !== null) {
         setViewMode(newViewMode);
      }
   };

   /**
    * Calculate Achievements Data
    */
   const achievementsData = useMemo(() => {
      return grades.map((grade) => {
         // Group techniques by their type
         const techniquesByType: {
            [type: string]: TechniqueRecord[];
         } = {};

         grade.techniques.forEach((technique) => {
            const type = technique.kind; // Use kind as type
            if (!techniquesByType[type]) {
               techniquesByType[type] = [];
            }
            techniquesByType[type].push(technique);
         });

         // Calculate sub-achievements for each technique type
         const subAchievements = Object.entries(techniquesByType).map(([type, techniques]) => {
            const achievedCount = techniques.filter(tech => knownTechniqueIds.includes(tech.id)).length;
            return {
               techniqueType: type,
               total: techniques.length,
               achieved: achievedCount,
            };
         });

         // Calculate major achievements for the entire grade
         const achievedTechniques = grade.techniques.filter(tech => knownTechniqueIds.includes(tech.id)).length;
         const majorAchievement = {
            total: grade.techniques.length,
            achieved: achievedTechniques,
         };

         return {
            grade,
            subAchievements,
            majorAchievement,
         };
      });
   }, [knownTechniqueIds, grades]);

   /**
    * Filter Achievements Based on View Mode
    */
   const filteredAchievements = useMemo(() => {
      if (viewMode === 'all') {
         return achievementsData;
      }
      return achievementsData.filter(ach => getLevelNumber(ach.grade) === currentLevelNumber);
   }, [viewMode, achievementsData, currentLevelNumber]);

   /**
    * Effect to Track and Update Achievement Counts
    */
   useEffect(() => {
      // Ensure achievedAchievements has been loaded
      if (achievedAchievements === null) {
         return;
      }

      const newCounts: AchievementCounts = {
         ...achievementCounts,
      };
      let achievementsChanged = false;
      const updatedAchievements = [...achievedAchievements];

      achievementsData.forEach(({grade, subAchievements, majorAchievement}) => {
         // Major Achievement Key
         const majorKey = `major-${grade.id}`;
         const isMajorAchieved = majorAchievement.achieved === majorAchievement.total;

         if (isMajorAchieved && !achievedAchievements.includes(majorKey)) {
            newCounts[majorKey] = (newCounts[majorKey] || 0) + 1;
            updatedAchievements.push(majorKey);
            achievementsChanged = true;
         }

         // Sub Achievements
         subAchievements.forEach(subAch => {
            const subKey = `sub-${grade.id}-${subAch.techniqueType}`;
            const isSubAchieved = subAch.achieved === subAch.total;

            if (isSubAchieved && !achievedAchievements.includes(subKey)) {
               newCounts[subKey] = (newCounts[subKey] || 0) + 1;
               updatedAchievements.push(subKey);
               achievementsChanged = true;
            }
         });
      });

      if (achievementsChanged) {
         setAchievementCounts(newCounts);
         setAchievedAchievements(updatedAchievements);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [knownTechniqueIds, achievedAchievements]);

   /**
    * Render Achievements
    */
   return (
      <Box sx={{p: 1}}>
         {/* Toggle Button Group */}
         <ToggleContainer>
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} aria-label='View Mode'>
               <ToggleButton value='all' aria-label='All Achievements'>
                  All Achievements
               </ToggleButton>
               <ToggleButton value='current' aria-label='Current Achievement'>
                  Current Achievement
               </ToggleButton>
            </ToggleButtonGroup>
         </ToggleContainer>

         {/* Achievements Grid */}
         {filteredAchievements.length > 0 ? (
            filteredAchievements.map(({grade, subAchievements, majorAchievement}) => <AchievementItem key={grade.id} grade={grade} subAchievements={subAchievements} majorAchievement={majorAchievement} achievementCounts={achievementCounts} />)
         ) : (
            <Typography variant='body1' color='textSecondary'>
               No achievements to display.
            </Typography>
         )}
      </Box>
   );
};

export default Achievements;
