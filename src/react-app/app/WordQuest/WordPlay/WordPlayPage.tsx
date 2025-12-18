// File: ./src/app/WordQuest/WordPlay/WordPlayPage.tsx

// HEADER-START
// * Path: ./src/app/WordQuest/WordPlay/WordPlayPage.tsx
// HEADER-END
import {DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';
import {SelectChangeEvent} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {Stack} from '@mui/system';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { useAuth } from '@/components/context/AuthContext';

import {Technique} from '@/app/Technique/TechniqueData';
import ChallengingTechniquesModal from '@/app/WordQuest/WordPlay/ChallengingTechniquesModal';
import ProgressBar from '@/app/WordQuest/WordPlay/ProgressBar';
import Achievements from '@/components/Achievements';
import DragAndDropZone from '@/components/drag/DragAndDropZone';
import {arraysAreEqual, shuffleArray} from '@/components/helper/helper';
import BeltCircular from '@/components/UI/KarateBelt';
import ScoreUI from '@/components/UI/ScoreUI';
// import {Grade} from '@/data/Grade'; // Removed
// import {gradeData} from '@/data/gradeData'; // Removed
import { KyokushinRepository } from '../../../../data/repo/KyokushinRepository';
import { getLevelNumber, getStripeNumber } from '../../../../data/repo/gradeHelpers';
import { usePreventBodyScroll } from '../../../components/drag/usePreventBodyScroll';
import LevelSelector from './LevelSelector';
import { TechniqueType } from '@/app/Technique/TechniqueData';

/**
 * Main Component
 */
const WordPlayPage: React.FC = () => {
   const distractorCount = 3;
   /**
    * Initialize Techniques starting from grade[1]
    */
   const grades = useMemo(() => KyokushinRepository.getCurriculumGrades(), []);
   /**
    * Map techniques by grade ID for easy access
    */
   const techniqueMap = useMemo(() => {
        const map = new Map<string, Technique[]>();
        grades.forEach(grade => {
            const gradeTechniques = grade.techniques.map(t => new Technique(
                t.id, 
                t.kind as TechniqueType,
                t.name.romaji || '',
                t.name.en, 
                t.name.sv,
                t.name.ja,
                t.history?.en,
                t.detailedDescription?.en,
                t.mediaIds?.find((m: string) => m.startsWith('yt:'))?.replace('yt:', ''),
                undefined,
                t.tags
            ));
            map.set(grade.id, gradeTechniques);
        });
        return map;
   }, [grades]);

   const allTechniques: Technique[] = useMemo(() => {
        return Array.from(techniqueMap.values()).flat();
   }, [techniqueMap]);

   /**
    * State Variables
    */
   /**
    * State Variables
    */
   const [currentTechnique, setCurrentTechnique] = useState<Technique | null>(() => {
       if (grades.length > 0) {
           const techList = techniqueMap.get(grades[0].id) || [];
           return techList[0] || null;
       }
       return null;
   });
   
   const [items, setItems] = useState<{
      [key: string]: string[];
   }>({
      availableWords: [],
      assembledWords: [],
   });
   const [currentIndex, setCurrentIndex] = useState<number>(0);
   const [score, setScore] = useState<number>(0);
   const [revealAnswerUsed, setRevealAnswerUsed] = useState<boolean>(false);
   const [solved, setSolved] = useState<boolean>(false);
   const [challengingTechniques, setChallengingTechniques] = useState<Set<string>>(new Set());
   const [attempted, setAttempted] = useState<boolean>(false);
   const [progressCompleted, setProgressCompleted] = useState<boolean>(false);
   const [techniquesToShow, setTechniquesToShow] = useState<Technique[]>(() => {
       if (grades.length > 0) {
           return techniqueMap.get(grades[0].id) || [];
       }
       return [];
   });
   const [isReviewingChallengingTechniques, setIsReviewingChallengingTechniques] = useState<boolean>(false);
   const [openChallengingTechniquesModal, setOpenChallengingTechniquesModal] = useState<boolean>(false);
   const [activeId, setActiveId] = useState<string | null>(null);

   // State for hinted words
   const [hintedWordIds, setHintedWordIds] = useState<string[]>([]);

   // State for known techniques
   const [knownTechniqueIds, setKnownTechniqueIds] = useState<Set<string>>(new Set());
   const [knownGradeIds, setKnownGradeIds] = useState<Set<string>>(new Set());

   // State for selected level
   const [selectedLevel, setSelectedLevel] = useState<number>(() => {
       return getLevelNumber(grades.find(g => g.techniques.length > 0)!) || 1;
   });

   /**
    * Sensors for Drag and Drop
    */
   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 10, // Adjust this value as needed
         },
      }),
   );

   /**
    * Get previous grade techniques for distractors
    */
   const previousGradeTechniques = useMemo(() => {
      const previousGrades = grades.filter(grade => getLevelNumber(grade) < selectedLevel);
      return previousGrades.flatMap(grade => techniqueMap.get(grade.id) || []);
   }, [grades, selectedLevel, techniqueMap]);

   /**
    * Get Distractor Words Function
    */
   const getDistractorWords = useCallback((currentTechnique: Technique, count: number, previousGradeTechniques: Technique[]): string[] => {
      const currentType = currentTechnique.type;

      const nearbyTechniques = previousGradeTechniques.filter(tech => tech.type === currentType && tech.id !== currentTechnique.id);

      const distractorWords: string[] = [];

      const existingTexts = new Set(currentTechnique.words);

      for (let i = 0; i < nearbyTechniques.length && distractorWords.length < count; i++) {
         const technique = nearbyTechniques[i];

         technique.words.forEach(wordText => {
            if (distractorWords.length < count && !existingTexts.has(wordText) && !distractorWords.includes(wordText)) {
               distractorWords.push(wordText);
               existingTexts.add(wordText);
            }
         });
      }

      return distractorWords;
   }, []);

   /**
    * Initialize Words
    */
   useEffect(() => {
      if (!currentTechnique) {
         setItems({
            availableWords: [],
            assembledWords: [],
         });
         setHintedWordIds([]);
         return;
      }

      const allWords = [...currentTechnique.words, ...getDistractorWords(currentTechnique, distractorCount, previousGradeTechniques)];
      setItems({
         availableWords: shuffleArray(allWords),
         assembledWords: [],
      });
      setHintedWordIds([]);
   }, [currentTechnique, distractorCount, previousGradeTechniques, getDistractorWords]);

   /**
    * Handle Level Change
    */
   const handleLevelChangeByLevelNumber = useCallback((newLevel: number) => {
      setSelectedLevel(newLevel);
      const grade = grades.find(grade => getLevelNumber(grade) === newLevel);
      if (grade) {
         const newTechniques = techniqueMap.get(grade.id) || [];
         setTechniquesToShow(newTechniques);
         setCurrentIndex(0);
         setCurrentTechnique(newTechniques[0] || null);
         setRevealAnswerUsed(false);
         setSolved(false);
         setAttempted(false);
         setHintedWordIds([]);
         setProgressCompleted(false);
         setIsReviewingChallengingTechniques(false);
      } else {
         setTechniquesToShow([]);
         setCurrentTechnique(null);
      }
   }, [grades, techniqueMap]);

   const { token } = useAuth();

   /**
    * Load knownTechniqueIds from API or localStorage on mount
    */
   useEffect(() => {
      const loadProgress = async () => {
         let loadedIds: string[] = [];
         
         if (token) {
            try {
                const res = await fetch('/api/v1/wordquest/progress', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    loadedIds = data.solvedIds || [];
                }
            } catch (err) {
                console.warn('Failed to load progress from API', err);
            }
         }

         if (loadedIds.length === 0) {
             const storedKnownTechniques = localStorage.getItem('knownTechniqueIds');
             if (storedKnownTechniques) {
                try {
                   loadedIds = JSON.parse(storedKnownTechniques);
                } catch { }
             }
         }

         if (loadedIds.length > 0) {
             const updatedKnownTechniqueIds = new Set(loadedIds);
             setKnownTechniqueIds(updatedKnownTechniqueIds);
             
             // Update the selected level based on known techniques
             const levelNumber = grades.find(grade => !grade.techniques.every(tech => updatedKnownTechniqueIds.has(tech.id))) 
                ? getLevelNumber(grades.find(grade => !grade.techniques.every(tech => updatedKnownTechniqueIds.has(tech.id)))!) 
                : grades.find(g => g.techniques.length > 0) 
                   ? getLevelNumber(grades.find(g => g.techniques.length > 0)!) 
                   : 1;

             const knownGradeIds = grades.filter(grade => grade.techniques.length > 0 && grade.techniques.every(tech => updatedKnownTechniqueIds.has(tech.id))).map(grade => grade.id);
             setKnownGradeIds(new Set(knownGradeIds));
             setSelectedLevel(levelNumber);
             handleLevelChangeByLevelNumber(levelNumber);
         }
      };
      
      loadProgress();
   }, [grades, handleLevelChangeByLevelNumber, token]);

   /**
    * Save knownTechniqueIds to API and localStorage whenever it changes
    */
   useEffect(() => {
      if (knownTechniqueIds.size > 0) {
         try {
            localStorage.setItem('knownTechniqueIds', JSON.stringify(Array.from(knownTechniqueIds)));
         } catch { }
      }
   }, [knownTechniqueIds]);

   // Save newly solved technique to API
   useEffect(() => {
       if (!solved || !currentTechnique || !token) return;
       
       fetch('/api/v1/wordquest/progress', {
           method: 'POST',
           headers: { 
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}` 
            },
           body: JSON.stringify({ techniqueId: currentTechnique.id })
       }).catch(err => console.error('Failed to save progress', err));
   }, [solved, currentTechnique, token]);

   /**
    * Load/Save Score
    */
   useEffect(() => {
       if (!token) {
           const storedScore = localStorage.getItem('Score');
           if (storedScore) setScore(parseInt(storedScore, 10) || 0);
           return;
       }

       fetch('/api/v1/wordquest/state/wordquest', {
           headers: { Authorization: `Bearer ${token}` }
       })
       .then(res => res.ok ? res.json() : {})
       .then((data: {state?: {score: number}}) => {
           if (data.state?.score) {
               setScore(data.state.score);
           }
       })
       .catch(err => console.warn('Failed to load score', err));
   }, [token]);

   useEffect(() => {
       if (score === 0) return; // Skip initial

       if (!token) {
           localStorage.setItem('Score', score.toString());
           return;
       }

       // Debounce saving score if needed, but for now save on change (optimize later if spammy)
       const handler = setTimeout(() => {
           fetch('/api/v1/wordquest/state/wordquest', {
               method: 'POST',
               headers: { 
                   'Content-Type': 'application/json',
                   Authorization: `Bearer ${token}` 
                },
               body: JSON.stringify({ score })
           }).catch(err => console.error('Failed to save score', err));
       }, 1000);

       return () => clearTimeout(handler);
   }, [score, token]);
   /**
    * Handle Level Change
    */
   const handleLevelChange = (event: SelectChangeEvent<number>) => {
      const newLevel = event.target.value as number;
      handleLevelChangeByLevelNumber(newLevel);
   };

   const [isDragging, setIsDragging] = useState(false);
   usePreventBodyScroll(isDragging);

   /**
    * Handle Drag Start Event
    */
   const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id.toString());
      setIsDragging(true); // Disable scrolling when dragging starts
   };

   /**
    * Handle Drag End Event
    */
   const handleDragEnd = (event: DragEndEvent) => {
      const {active, over} = event;
      setActiveId(null);
      setIsDragging(false); // Re-enable scrolling when dragging ends

      if (!over) {
         return;
      }

      const activeIdStr = active.id.toString();
      const overIdStr = over.id.toString();

      const sourceContainer = findContainer(activeIdStr);
      const destinationContainer = findContainer(overIdStr);

      if (!sourceContainer || !destinationContainer) {
         return;
      }

      const activeWord = activeIdStr.split('-')[0];
      const overWord = overIdStr.split('-')[0];

      if (sourceContainer === destinationContainer) {
         const sourceItems = items[sourceContainer];
         const oldIndex = sourceItems.indexOf(activeWord);
         const newIndex = sourceItems.indexOf(overWord);
         if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newItems = arrayMove(sourceItems, oldIndex, newIndex);
            setItems(prev => ({
               ...prev,
               [sourceContainer]: newItems,
            }));
            setAttempted(true);
         }
      } else {
         const sourceItems = [...items[sourceContainer]];
         const destinationItems = [...items[destinationContainer]];

         const movedItemIndex = sourceItems.indexOf(activeWord);
         if (movedItemIndex === -1) return;
         const [movedItem] = sourceItems.splice(movedItemIndex, 1);

         let overIndex = destinationItems.indexOf(overWord);
         if (overIndex === -1) {
            overIndex = destinationItems.length;
         }

         destinationItems.splice(overIndex, 0, movedItem);

         setItems(prev => ({
            ...prev,
            [sourceContainer]: sourceItems,
            [destinationContainer]: destinationItems,
         }));
         setAttempted(true);
      }
   };

   /**
    * Helper to find which container an item is in
    */
   const findContainer = (id: string): 'availableWords' | 'assembledWords' | null => {
      if (id === 'availableWords' || id === 'assembledWords') return id as 'availableWords' | 'assembledWords';
      const word = id.split('-')[0]; // Extract word from id like "Uchi-0"
      if (items.availableWords.includes(word)) return 'availableWords';
      if (items.assembledWords.includes(word)) return 'assembledWords';
      return null;
   };

   /**
    * Check if the current order is correct
    */
   const isCorrectOrder = useMemo(() => {
      if (!currentTechnique || !currentTechnique.correctOrder) {
         return false;
      }

      return arraysAreEqual(items.assembledWords, currentTechnique.correctOrder);
   }, [items.assembledWords, currentTechnique]);

   /**
    * Move to Next Technique
    */
   const nextTechnique = () => {
      if (!currentTechnique) return;
      if (currentIndex < techniquesToShow.length - 1) {
         const nextIndex = currentIndex + 1;
         setCurrentIndex(nextIndex);
         const newTechnique = techniquesToShow[nextIndex];
         setCurrentTechnique(newTechnique || null);
         setRevealAnswerUsed(false);
         setSolved(false);
         setAttempted(false);
         setHintedWordIds([]);
      } else {
         setProgressCompleted(true);
      }
   };

   /**
    * Review Challenging Techniques
    */
   const reviewChallengingTechniques = () => {
      const challengingTechniqueList = allTechniques.filter(technique => challengingTechniques.has(technique.id));

      if (challengingTechniqueList.length > 0) {
         setTechniquesToShow(challengingTechniqueList);
         setCurrentIndex(0);
         const firstChallengingTechnique = challengingTechniqueList[0];
         setCurrentTechnique(firstChallengingTechnique);
         setRevealAnswerUsed(false);
         setSolved(false);
         setAttempted(false);
         setProgressCompleted(false);
         setIsReviewingChallengingTechniques(true);
         setHintedWordIds([]);
      }
   };

   /**
    * Use RevealAnswer Function
    */
   const useRevealAnswer = () => {
      if (!currentTechnique || revealAnswerUsed) return;

      // Mark the answer as revealed
      setRevealAnswerUsed(true);

      // Update the items with the correct order
      setItems({
         availableWords: [],
         assembledWords: [...currentTechnique.correctOrder],
      });

      // Add the current technique to challenging techniques
      setChallengingTechniques(prev => new Set(prev).add(currentTechnique.id));
   };

   /**
    * Handle Hint Button Click
    */
   const handleHint = () => {
      if (!currentTechnique) return;
      const firstMissingWord = currentTechnique.correctOrder.find(word => items.availableWords.includes(word) && !hintedWordIds.includes(word));

      if (firstMissingWord) {
         setHintedWordIds(prev => [...prev, firstMissingWord]);

         const pointsToDeduct = Math.ceil(10 / currentTechnique.correctOrder.length);
         setScore(prevScore => Math.max(prevScore - pointsToDeduct, 0));
      }
   };

   /**
    * Effect to Update Score When Correct Order is Achieved
    */
   useEffect(() => {
      if (!currentTechnique || !currentTechnique.correctOrder) return;

      if (isCorrectOrder && !solved) {
         const baseScore = 10;
         const scoreToReduce = Math.ceil((baseScore * hintedWordIds.length) / currentTechnique.correctOrder.length);
         setScore(prevScore => (revealAnswerUsed ? Math.max(0, prevScore - baseScore) : prevScore + baseScore - scoreToReduce));
         setSolved(true);

         setKnownTechniqueIds(prev => new Set(prev).add(currentTechnique.id));
      }
   }, [isCorrectOrder, solved, revealAnswerUsed, hintedWordIds.length, currentTechnique]);

   /**
    * Calculate Progress Percentage
    */
   const progressPercentage = useMemo(() => {
      const totalTechniques = techniquesToShow.length;
      return Math.min(Math.round(((currentIndex + (progressCompleted ? 1 : 0)) / totalTechniques) * 100), 100);
   }, [currentIndex, techniquesToShow.length, progressCompleted]);

   /**
    * Handle Restart Functionality
    */
   const handleRestart = () => {
      const grade = grades.find(grade => getLevelNumber(grade) === selectedLevel);
      if (grade) {
         const newTechniques = techniqueMap.get(grade.id) || [];
         setTechniquesToShow(newTechniques);
         setCurrentIndex(0);
         setCurrentTechnique(newTechniques[0] || null);
         setRevealAnswerUsed(false);
         setSolved(false);
         setAttempted(false);
         setHintedWordIds([]);
         setProgressCompleted(false);
         setIsReviewingChallengingTechniques(false);
      }
   };

   /**
    * Show Challenging Techniques Modal
    */
   const showChallengingTechniques = () => {
      setOpenChallengingTechniquesModal(true);
   };

   /**
    * Early Return if No Techniques Available
    */
   if (allTechniques.length === 0) {
      return (
         <Box sx={{p: 4}}>
            <Typography variant='h4' gutterBottom>
               No Techniques Available
            </Typography>
            <Typography variant='body1'>Please check the data source or try again later.</Typography>
         </Box>
      );
   }



   /**
    * Render Component
    */
   return (
      <Box>
         <Box display='flex' justifyContent='center' sx={{mt: 0.5, mb: 0.5}}>
            {/* storageKey is required but we manage persistence in parent now, so we pass a dummy key or rely on sync */}
            <ScoreUI initialScore={score} storageKey='Score_Sync' /> 
         </Box>
         <Stack
            direction={'row'}
            sx={{
               display: 'flex',
               justifyContent: 'center',
               width: '100%',
            }}>
            {Array.from(knownGradeIds).map(id => {
               const grade = grades.find(x => x.id === id)!; // `!` asserts that `grade` will not be null
               const stripes = getStripeNumber(grade);
               return (
                  <BeltCircular
                     key={id} // Always provide a unique key when mapping
                     sx={{width: '1em', height: '1em'}}
                     color={grade.beltColor}
                     borderRadius='100%'
                     stripes={stripes}
                     thickness={'0.25em'}
                     borderWidth='0.1em'
                  />
               );
            })}
         </Stack>

         <DragAndDropZone items={items} currentTechnique={currentTechnique} sensors={sensors} activeId={activeId} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} hintedWordIds={hintedWordIds} />

         <Box sx={{ml: 1, mr: 1}}>
            <ProgressBar progressPercentage={progressPercentage} challengingTechniquesSize={challengingTechniques.size} currentIndex={currentIndex} techniquesToShowLength={techniquesToShow.length} />
            {progressCompleted ? (
               <Box>
                  <Typography color='primary' sx={{mt: 2}}>
                     {isReviewingChallengingTechniques ? 'Well done! You have reviewed all challenging techniques.' : "Well done! You've completed all techniques in this level."}
                  </Typography>
                  <Button variant='contained' color='success' onClick={handleRestart} sx={{mt: 2}}>
                     Restart Level
                  </Button>
                  {isReviewingChallengingTechniques && (
                     <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                           const gradeIndex = grades.findIndex(grade => getLevelNumber(grade) === selectedLevel);
                           if (gradeIndex !== -1) {
                              setIsReviewingChallengingTechniques(false);
                              const grade = grades[gradeIndex];
                              const newTechniques = techniqueMap.get(grade.id) || [];
                              setTechniquesToShow(newTechniques);
                              setCurrentIndex(0);
                              setCurrentTechnique(newTechniques[0] || null);
                              setRevealAnswerUsed(false);
                              setSolved(false);
                              setAttempted(false);
                              setProgressCompleted(false);
                           }
                        }}
                        sx={{mt: 2, ml: 2}}>
                        Back to Level Techniques
                     </Button>
                  )}
               </Box>
            ) : (
               <Box>
                  {attempted && (isCorrectOrder ? <Typography color='success.main'>Correct Order! Great job!</Typography> : <Typography color='error.main'>Incorrect Order. Try again!</Typography>)}
                  {isCorrectOrder && !progressCompleted && (
                     <Button variant='contained' color='info' onClick={nextTechnique} sx={{mt: 1, mr: 1}}>
                        Next Technique
                     </Button>
                  )}
                  {!isCorrectOrder && !progressCompleted && (
                     <Button variant='contained' color='primary' disabled sx={{mt: 2, mr: 2}}>
                        Next Technique
                     </Button>
                  )}
                  <Button variant='contained' color='primary' onClick={useRevealAnswer} disabled={revealAnswerUsed || !currentTechnique} sx={{mt: 1, mr: 1}}>
                     {revealAnswerUsed ? 'Answer Revealed' : 'Reveal Answer'}
                  </Button>
                  <Button variant='contained' color='warning' onClick={handleHint} disabled={!currentTechnique || currentTechnique.correctOrder.filter(word => items.availableWords.includes(word)).length === hintedWordIds.length} sx={{mt: 1, mr: 1}}>
                     Hint
                  </Button>
                  {challengingTechniques.size > 0 && (
                     <>
                        <Button variant='contained' color='warning' onClick={reviewChallengingTechniques} sx={{mt: 1}}>
                           Review Challenging Techniques
                        </Button>
                        <Button variant='contained' color='warning' onClick={showChallengingTechniques} sx={{mt: 1, ml: 1}}>
                           Show Challenging Techniques
                        </Button>
                     </>
                  )}
               </Box>
            )}
            <LevelSelector grades={grades} selectedLevel={selectedLevel} handleLevelChange={handleLevelChange} knownTechniqueIds={knownTechniqueIds} />
         </Box>

         <ChallengingTechniquesModal open={openChallengingTechniquesModal} onClose={() => setOpenChallengingTechniquesModal(false)} challengingTechniques={challengingTechniques} allTechniques={allTechniques} />

         <Achievements knownTechniqueIds={Array.from(knownTechniqueIds)} currentLevelNumber={selectedLevel} />
      </Box>
   );
};

export default WordPlayPage;
