// HEADER-START
// * Project: Kyokushin
// * Path: src/components/PointCounter.tsx
// ! Purpose: [Action Required: Update this description to summarize the component or file purpose.]
// * Tech Stack: React, Next.js, MUI, TypeScript (Strict), TailwindCSS
// * Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, LINQ, UUID
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ? LLM Action Items:
// 1. Update the "Purpose" section with a concise summary of the component's role.
// 2. Identify potential issues in the file and suggest improvements.
// 3. Suggest enhancements for code readability, maintainability, or scalability.
// 4. Optimize for performance where applicable (e.g., memoization, render efficiency).
// 5. Identify missing error handling and recommend robust solutions.
// 6. Highlight any potential security vulnerabilities (e.g., XSS, injection attacks).
// 7. Do not include header section into your code.
// 8. Always provide compact code with minimum formatting.
// HEADER-END

// ./src/components/PointCounter.tsx
'use client';
// ./src/components/PointCounter.tsx
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';

interface PointCounterProps {
   initialPoints?: number;
   storageKey?: string;
}

const PointCounter: React.FC<PointCounterProps> = ({initialPoints = 0, storageKey = 'pointCounter'}) => {
   const [points, setPoints] = useState<number>(initialPoints);

   // Load points from localStorage on component mount
   useEffect(() => {
      const storedPoints = localStorage.getItem(storageKey);
      if (storedPoints !== null) {
         setPoints(parseInt(storedPoints, 10));
      }
   }, [storageKey]);

   // Update localStorage whenever points change
   useEffect(() => {
      localStorage.setItem(storageKey, points.toString());
   }, [points, storageKey]);

   const increment = () => setPoints(prev => prev + 1);
   const decrement = () => setPoints(prev => (prev > 0 ? prev - 1 : 0));

   return (
      <Box display='flex' alignItems='center' bgcolor='white' borderRadius={8} padding={2} boxShadow={1}>
         <StarsRoundedIcon color='primary' />
         <Typography variant='h6' component='span' ml={1}>
            {points} pts
         </Typography>
         <Box ml={2} display='flex' alignItems='center'>
            <IconButton aria-label='increment points' size='small' onClick={increment} color='primary'>
               <AddIcon fontSize='inherit' />
            </IconButton>
            <IconButton aria-label='decrement points' size='small' onClick={decrement} color='secondary'>
               <RemoveIcon fontSize='inherit' />
            </IconButton>
         </Box>
      </Box>
   );
};

export default PointCounter;
