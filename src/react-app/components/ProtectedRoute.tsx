import React from 'react';
import {Box, Button, Container, Paper, Typography, useTheme} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';

import {useAuth} from './context/AuthContext';

interface ProtectedRouteProps {
   children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
   const {isAuthenticated, login} = useAuth();
   const theme = useTheme();
   const hasLoggedRef = React.useRef(false);

   if (!isAuthenticated) {
      if (!hasLoggedRef.current) {
         console.info('[ProtectedRoute] unauthenticated render', { time: new Date().toISOString() });
         hasLoggedRef.current = true;
      }
      return (
         <Container maxWidth="sm">
            <Box
               display="flex"
               flexDirection="column"
               alignItems="center"
               justifyContent="center"
               minHeight="80vh"
               py={4}
            >
               <Paper
                  elevation={3}
                  sx={{
                     p: 4,
                     textAlign: 'center',
                     width: '100%',
                     borderRadius: 3,
                  }}
               >
                  {/* Lock Icon */}
                  <Box
                     sx={{
                        mb: 3,
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                     }}
                  >
                     <LockIcon
                        sx={{
                           fontSize: 60,
                           color: theme.palette.warning.main,
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
                     Authentication Required
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
                     This page requires you to be logged in. Please sign in with your Google account to access your personalized training data and settings.
                  </Typography>

                  {/* Login Button */}
                  <Button
                     variant="contained"
                     color="primary"
                     size="large"
                     startIcon={<LoginIcon />}
                     onClick={login}
                     sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                     }}
                  >
                     Sign In with Google
                  </Button>

                  {/* Additional Info */}
                  <Typography
                     variant="caption"
                     color="textSecondary"
                     sx={{
                        mt: 3,
                        display: 'block',
                     }}
                  >
                     You'll be returned to this page after signing in
                  </Typography>
               </Paper>
            </Box>
         </Container>
      );
   }

   return <>{children}</>;
};

export default ProtectedRoute;
