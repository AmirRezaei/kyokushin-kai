// HEADER-START
// * Project: Kyokushin
// * Path: src/components/UI/RatingBar.tsx
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

// ./src/components/UI/RatingBar.tsx
'use client';
// ./src/components/RatingBar.tsx
// import * as React from 'react';
// import { styled } from '@mui/material/styles';
// import Box from '@mui/material/Box';
// import Rating from '@mui/material/Rating';
// import StarIcon from '@mui/icons-material/Star';
// import StarBorderIcon from '@mui/icons-material/StarBorder';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// const StyledRating = styled(Rating)({
//   '& .MuiRating-iconFilled': {
//     color: '#ff6d75',
//   },
//   '& .MuiRating-iconHover': {
//     color: '#ff3d47',
//   },
// });

// export default function CustomizedRating() {
//   return (
//     <Box
//       sx={{
//         '& > legend': { mt: 2 },
//       }}
//     >
//       {/* <Typography component="legend">Custom icon and color</Typography> */}
//       <StyledRating
//         name="customized-color"
//         defaultValue={2}
//         getLabelText={(value: number) => `${value} Heart${value !== 1 ? 's' : ''}`}
//         precision={0.5}
//         icon={<StarIcon fontSize="inherit" />}
//         emptyIcon={<StarBorderIcon fontSize="inherit" />}
//       />
//       {/* <Rating name="customized-10" defaultValue={0} max={5} /> */}
//     </Box>
//   );
// }
import RectangleBorderIcon from '@mui/icons-material/Crop54Sharp';
import RectangleIcon from '@mui/icons-material/RectangleSharp';
import Box from '@mui/material/Box';
import Rating, {IconContainerProps} from '@mui/material/Rating';
import {styled} from '@mui/material/styles';
import * as React from 'react';

// Utility function to get color based on rating value
const getColorForRating = (rating: number): string => {
   switch (true) {
      case rating <= 1:
         return '#f48c06';
      case rating <= 2:
         return '#ffba08';
      case rating <= 3:
         return '#a7c957';
      case rating <= 4:
         return '#6a994e';
      case rating <= 5:
         return '#386641';
      default:
         return 'gray';
   }
};

// Styled component for icon container
const StyledIconContainer = styled('div')<{ratingValue: number}>(({ratingValue}) => ({
   color: getColorForRating(ratingValue),
}));

// Custom icon container component
const CustomIconContainer: React.FC<IconContainerProps> = ({value, children, ...other}) => (
   <StyledIconContainer {...other} ratingValue={value as number}>
      {children}
   </StyledIconContainer>
);

interface RatingBarProps {
   id: string;
}

// RatingBar component
const RatingBar: React.FC<RatingBarProps> = ({id}) => {
   const [value, setValue] = React.useState<number | null>(null);

   // Effect to load the rating value from localStorage
   React.useEffect(() => {
      const storedValue = localStorage.getItem(`rating-value-${id}`);
      if (storedValue !== null) {
         setValue(parseFloat(storedValue));
      }
   }, [id]);

   // Handler for rating change
   const handleChange = (event: React.SyntheticEvent, newValue: number | null) => {
      setValue(newValue);
      localStorage.setItem(`rating-value-${id}`, newValue !== null ? newValue.toString() : '0');
   };

   return (
      <Box
         sx={{
            '& > legend': {
               mt: 2,
            },
         }}>
         <Rating
            name={`customized-color-${id}`}
            value={value}
            onChange={handleChange}
            getLabelText={(value: number) => `${value} Star${value !== 1 ? 's' : ''}`}
            precision={0.5}
            IconContainerComponent={CustomIconContainer}
            icon={<RectangleIcon fontSize='inherit' />}
            emptyIcon={<RectangleBorderIcon fontSize='inherit' />}
         />
      </Box>
   );
};

export default RatingBar;
