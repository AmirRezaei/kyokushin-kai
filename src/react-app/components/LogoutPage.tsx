import {Box, Button, Container, Paper, Typography, useTheme} from '@mui/material';
import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';

import {useAuth} from './context/AuthContext';

const LogoutPage: React.FC = () => {
   const theme = useTheme();
   const navigate = useNavigate();
   const {logout} = useAuth();

   useEffect(() => {
      // Perform logout on mount
      logout();
   }, [logout]);

   const handleGoHome = () => {
      navigate('/');
   };

   return (
      <Container maxWidth="sm">
         <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            py={4}
         >
            <Paper
               elevation={3}
               sx={{
                  p: 4,
                  textAlign: 'center',
                  width: '100%',
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark'
                     ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                     : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
               }}
            >
               {/* Logout Icon */}
               <Box
                  sx={{
                     mb: 3,
                     display: 'inline-flex',
                     p: 2,
                     borderRadius: '50%',
                     backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }}
               >
                  <LogoutIcon
                     sx={{
                        fontSize: 60,
                        color: theme.palette.primary.main,
                     }}
                  />
               </Box>

               {/* Title */}
               <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                     fontWeight: 'bold',
                     mb: 2,
                  }}
               >
                  You've been logged out
               </Typography>

               {/* Message */}
               <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{
                     mb: 4,
                     lineHeight: 1.6,
                  }}
               >
                  Thank you for using Kyokushin-Kai. Your session has been successfully ended.
                  You can log back in anytime to continue your training journey.
               </Typography>

               {/* Action Buttons */}
               <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                  <Button
                     variant="contained"
                     color="primary"
                     size="large"
                     startIcon={<HomeIcon />}
                     onClick={handleGoHome}
                     sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                     }}
                  >
                     Go to Home
                  </Button>
               </Box>

               {/* Additional Info */}
               <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{
                     mt: 4,
                     display: 'block',
                  }}
               >
                  ありがとうございました (Arigatō gozaimashita) - Thank you
               </Typography>
            </Paper>
         </Box>
      </Container>
   );
};

export default LogoutPage;
