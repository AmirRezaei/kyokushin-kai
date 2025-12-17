// HEADER-START
// * Project: Kyokushin
// * Path: src/components/UI/ScoreUI.tsx
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

// ./src/components/UI/ScoreUI.tsx
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import Box from '@mui/material/Box';
import {SxProps, Theme, useTheme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, {useEffect, useRef, useState} from 'react';

interface ScoreComponentProps {
   initialScore?: number;
   storageKey: string;
   score?: number;
   onScoreChange?: (newScore: number) => void;
   sx?: SxProps<Theme>;
}

const ScoreUI: React.FC<ScoreComponentProps> = ({initialScore = 0, storageKey, score: controlledScore, onScoreChange, sx = {}}) => {
   const isControlled = controlledScore !== undefined;
   const [uncontrolledScore, setUncontrolledScore] = useState<number>(initialScore);
   const [isAnimating, setIsAnimating] = useState(false);
   const [addedScore, setAddedScore] = useState<number | null>(null);
   const [triggerAnimation, setTriggerAnimation] = useState(false);
   const previousScoreRef = useRef<number>(initialScore);

   const score = isControlled ? controlledScore : uncontrolledScore;
   const theme = useTheme();

   useEffect(() => {
      if (isControlled) return;
      try {
         const storedScore = localStorage.getItem(storageKey);
         if (storedScore !== null) {
            const parsedScore = parseInt(storedScore, 10);
            if (!isNaN(parsedScore)) {
               setUncontrolledScore(parsedScore);
            }
         }
      } catch (error) {
         console.error(`Error loading score from localStorage with key "${storageKey}":`, error);
      }
   }, [storageKey, isControlled]);

   useEffect(() => {
      if (isControlled) return;
      try {
         localStorage.setItem(storageKey, score.toString());
      } catch (error) {
         console.error(`Error saving score to localStorage with key "${storageKey}":`, error);
      }
   }, [storageKey, score, isControlled]);

   useEffect(() => {
      if (!isControlled) {
         setUncontrolledScore(initialScore);
      }
   }, [initialScore, isControlled]);

   useEffect(() => {
      const previousScore = previousScoreRef.current;
      if (score > previousScore) {
         setAddedScore(score - previousScore);
         setTriggerAnimation(false); // Reset addedScore animation
         requestAnimationFrame(() => setTriggerAnimation(true)); // Trigger addedScore animation
         setIsAnimating(true); // Trigger scale animation
      }
      previousScoreRef.current = score;

      const timeout = setTimeout(() => {
         setIsAnimating(false); // End scale animation after a short duration
         setAddedScore(null);
      }, 2000); // Match addedScore animation duration

      return () => clearTimeout(timeout);
   }, [theme, score]);

   return (
      <Box
         position='relative'
         display='inline-flex'
         alignItems='center'
         bgcolor={theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.paper}
         borderRadius={2}
         padding={1.5}
         boxShadow={1}
         sx={{
            'cursor': 'pointer',
            'userSelect': 'none',
            'animation': isAnimating ? `scaleInOut 0.4s ease-in-out` : 'none', // Scale animation
            '@keyframes scaleInOut': {
               '0%, 100%': {transform: 'scale(1)'},
               '50%': {transform: 'scale(1.2)'},
            },
            ...sx,
         }}
         aria-label={`Score: ${score}`}>
         <StarsRoundedIcon color='primary' />
         <Typography variant='body1' color='textPrimary' marginLeft={0.5}>
            {score} pts
         </Typography>
         {addedScore !== null && (
            <Box
               position='absolute'
               right='-5%'
               top='5%'
               sx={{
                  'zIndex': 1000,
                  'transform': 'translate(50%, -50%)',
                  'animation': triggerAnimation ? `moveUp 3.0s ease-out forwards` : 'none', // Separate moveUp animation
                  '@keyframes moveUp': {
                     from: {opacity: 1, transform: 'translate(50%, -50%)'},
                     to: {opacity: 0, transform: 'translate(50%, -45px)'},
                  },
               }}>
               <Typography variant='caption' color='success.main'>
                  +{addedScore}
               </Typography>
            </Box>
         )}
      </Box>
   );
};

export default ScoreUI;
