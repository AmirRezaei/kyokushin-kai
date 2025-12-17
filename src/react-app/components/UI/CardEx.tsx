// HEADER-START
// * Path: ./src/components/UI/CardEx.tsx
// HEADER-END

import {Box} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import {useTheme} from '@mui/material/styles'; // Import useTheme
import Typography from '@mui/material/Typography';
import * as React from 'react';

import {Grade} from '@/data/Grade';
import {Kata} from '@/data/Kata';

import KarateBelt from './KarateBelt';

interface MediaCardProps {
   kata: Kata;
   grade: Grade;
   isExpanded: boolean;
   onExpand: () => void;
}

const CardEx: React.FC<MediaCardProps> = ({kata, grade, isExpanded, onExpand}) => {
   const theme = useTheme(); // Initialize theme
   const handleCardClick = () => {
      if (isExpanded) {
         window.open(`https://www.youtube.com/watch?v=${kata.youtubeKey}`, '_blank', 'noopener,noreferrer');
      } else {
         onExpand();
      }
   };

   return (
      <Box
         // Add class name for targeting
         onClick={handleCardClick}
         sx={{
            margin: 0.5,
            border: 1,
            backgroundImage: `url(${kata.poster})`, // Use poster as background image
            backgroundRepeat: 'no-repeat', // No repeat background image
            backgroundSize: 'cover', // Cover background area completely
            borderColor: theme.palette.divider, // Use theme.palette.divider
            borderRadius: theme.shape.borderRadius, // Use theme.shape.borderRadius
            overflow: 'hidden', // Hide overflow content
            flex: isExpanded ? '0 0 600px' : '0 0 100px', // Adjust flex based on state
            display: 'block', // Arrange cards vertically
            height: isExpanded ? '600px' : '100px', // Toggle height based on state
            marginBottom: '1em', // Space between cards
            position: 'relative', // Add relative positioning
            boxShadow: isExpanded ? theme.shadows[2] : 'none', // Use theme.shadows
            transition: 'height 0.3s ease-in-out, flex 0.3s ease-in-out', // Animate height and flex change
         }}>
         <Box
            sx={{
               width: '100%',
               color: 'text.primary',
               position: 'absolute', // Position at bottom
               bottom: 0, // Position at bottom
            }}>
            <Typography
               gutterBottom
               variant='h5'
               sx={{
                  pr: 2, // Add right padding
                  mt: 2, // Add top margin
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  color: 'text.primary',
                  textAlign: 'right',
               }}>
               {kata.japanese}
            </Typography>
            <Typography
               variant='h6'
               color='text.secondary'
               sx={{
                  pr: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  color: 'text.secondary',
                  textAlign: 'right', // Align text to right
               }}>
               {kata.description}
            </Typography>
            <KarateBelt sx={{m: 0, width: '100%', height: '1.5em', alignItems: 'flex-end'}} borderRadius='0' borderWidth='0.1em' thickness={'0.5em'} stripes={grade.stripeNumber} color={grade.beltColor} />
         </Box>

         {/* <Box sx={{overflow: 'hidden'}} title={kata.english}> */}
         {/* <Box
               key='img'
               className='card-media-inner'
               component='img'
               sx={{
                  // height: '100%',
                  width: '100%',
                  // objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out', // Increased transition duration
                  cursor: 'pointer', // Indicates clickable area
               }}
               src={kata.poster}
               alt={kata.english}
            /> */}
         {/* <Box
               key='info'
               sx={{
                  backgroundImage: `url(${kata.poster})`,
                  //backgroundColor: 'transparent',
                  overflow: 'hidden',
                  position: 'absolute', // Position at bottom
                  bottom: 0,
                  width: '100%',
                  height: '100px', // Adjust as needed
                  zIndex: 1, // Ensure 'info' is on top of 'img'
               }}>
               <Box sx={{color: 'text.primary'}}>
                  <Typography gutterBottom variant='h5' sx={{mt: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.7)', color: 'text.primary'}}>
                     {kata.japanese}
                  </Typography>
                  <Typography variant='h6' color='text.secondary' sx={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)', color: 'text.secondary'}}>
                     {kata.description}
                  </Typography>
               </Box>
               <KarateBelt sx={{m: 0, width: '100%', height: '2em', alignItems: 'flex-end'}} borderRadius='0' borderWidth='0.1em' thickness={'0.5em'} stripes={grade.stripeNumber} color={grade.beltColor} />
            </Box>
         </Box> */}
      </Box>
   );
};

export default CardEx;
