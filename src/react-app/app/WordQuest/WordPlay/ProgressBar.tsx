// HEADER-START
// * Project: Kyokushin
// * Path: src/components/WordPlay/ProgressBar.tsx
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
import {Box, LinearProgress, linearProgressClasses, styled, Typography} from '@mui/material';
import React from 'react';

interface ProgressBarProps {
   progressPercentage: number;
   challengingTechniquesSize: number;
   currentIndex: number;
   techniquesToShowLength: number;
}

const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
   height: 20,
   borderRadius: 5,
   [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[200],
      ...(theme.palette.mode === 'dark' && {
         backgroundColor: theme.palette.grey[800],
      }),
   },
   [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: '#1a90ff',
      ...(theme.palette.mode === 'dark' && {
         backgroundColor: '#308fe8',
      }),
   },
}));

const ProgressBar: React.FC<ProgressBarProps> = ({progressPercentage, challengingTechniquesSize, currentIndex, techniquesToShowLength}) => {
   return (
      <Box sx={{width: '100%', mt: 4}}>
         <BorderLinearProgress variant='determinate' value={progressPercentage} />
         <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
            <Typography variant='body2' color='textSecondary'>
               Challenging Techniques: {challengingTechniquesSize}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
               {progressPercentage}% Completed ({Math.min(currentIndex + 1, techniquesToShowLength)} / {techniquesToShowLength} Techniques)
            </Typography>
         </Box>
      </Box>
   );
};

export default ProgressBar;
