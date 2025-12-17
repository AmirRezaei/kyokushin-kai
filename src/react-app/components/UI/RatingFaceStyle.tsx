// HEADER-START
// * Project: Kyokushin
// * Path: src/components/RatingFaceStyle.tsx
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

// ./src/components/RatingFaceStyle.tsx
'use client';
// ./src/components/RatingFaceStyle.tsx
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import Rating, {IconContainerProps} from '@mui/material/Rating';
import {styled} from '@mui/material/styles';
import * as React from 'react';

const RatingFaceStyle = styled(Rating)(({theme}) => ({
   '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
      color: theme.palette.action.disabled,
   },
}));

const customIcons: {
   [index: string]: {
      icon: React.ReactElement;
      label: string;
   };
} = {
   1: {
      icon: <SentimentVeryDissatisfiedIcon color='error' />,
      label: 'Very Dissatisfied',
   },
   2: {
      icon: <SentimentDissatisfiedIcon color='error' />,
      label: 'Dissatisfied',
   },
   3: {
      icon: <SentimentSatisfiedIcon color='warning' />,
      label: 'Neutral',
   },
   4: {
      icon: <SentimentSatisfiedAltIcon color='success' />,
      label: 'Satisfied',
   },
   5: {
      icon: <SentimentVerySatisfiedIcon color='success' />,
      label: 'Very Satisfied',
   },
};

function IconContainer(props: IconContainerProps) {
   const {value, ...other} = props;
   return <span {...other}>{customIcons[value].icon}</span>;
}

export default function RadioGroupRating() {
   return <RatingFaceStyle name='highlight-selected-only' defaultValue={2} IconContainerComponent={IconContainer} getLabelText={(value: number) => customIcons[value].label} highlightSelectedOnly />;
}
