// HEADER-START
// * Project: Kyokushin
// * Path: src/components/IconCircleWrapper.tsx
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

// ./src/components/IconCircleWrapper.tsx
'use client';
// ./src/components/IconCircleWrapper.tsx
import {Box} from '@mui/material';
import React from 'react';

interface IconCircleProps {
   icon: React.ReactNode;
   bgColor?: string;
   size?: string;
   borderRadius?: string;
}

export const IconCircleWrapper: React.FC<IconCircleProps> = ({icon, borderRadius = '50%', bgColor = 'lightGray', size = '2em'}) => {
   return (
      <Box
         sx={{
            backgroundColor: bgColor,
            borderRadius: borderRadius,
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
         }}>
         {icon}
      </Box>
   );
};
