// File: ./src/components/Footer.tsx

import React from 'react';
import { Box, Typography, useTheme, Container } from '@mui/material';

/**
 * App Footer Component
 * Displays copyright information with a karate-themed kanku symbol in the center
 */
const Footer: React.FC = () => {
   const theme = useTheme();
   const currentYear = new Date().getFullYear();

   return (
      <Box
         component="footer"
         sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
            borderTop: `1px solid ${theme.palette.divider}`,
         }}
      >
         <Container maxWidth="lg">
            <Box
               sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
               }}
            >
               {/* Kanku Symbol - Kyokushin Karate */}
               <Box
                  sx={{
                     position: 'relative',
                     width: 50,
                     height: 50,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}
               >
                  {/* <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="90" fill="#CE0F3D" stroke="#000000" stroke-width="3" />
  
  <text x="100" y="110" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="60" 
        fill="#FFFFFF" 
        text-anchor="middle" 
        dominant-baseline="middle">
    OSU!
  </text>
</svg> */}
               </Box>

               {/* Copyright Text */}
               <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{
                     fontSize: '0.875rem',
                  }}
               >
                  © {currentYear} Kyokushin-Kai Training App. All rights reserved.
               </Typography>

               {/* OSU! */}
               <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                     fontWeight: 'bold',
                     letterSpacing: '0.1em',
                  }}
               >
                  OSU!
               </Typography>
            </Box>
         </Container>
      </Box>
   );
};

export default Footer;
