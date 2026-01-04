import React from 'react';
import { Box, Button, CircularProgress, Container, Paper, Typography, useTheme } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { useAuth } from './context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
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
            <Box
              sx={{
                mb: 3,
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
              }}
            >
              <LockIcon
                sx={{
                  fontSize: 60,
                  color: theme.palette.warning.main,
                }}
              />
            </Box>

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

            <Typography
              variant="body1"
              color="textSecondary"
              sx={{
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              This page is restricted to administrators. Sign in with Google to continue.
            </Typography>

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
          </Paper>
        </Box>
      </Container>
    );
  }

  if (user?.role !== 'admin') {
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
            <Box
              sx={{
                mb: 3,
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
              }}
            >
              <AdminPanelSettingsIcon
                sx={{
                  fontSize: 60,
                  color: theme.palette.error.main,
                }}
              />
            </Box>

            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Admin Access Required
            </Typography>

            <Typography
              variant="body1"
              color="textSecondary"
              sx={{
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Your account does not have admin permissions. Contact an administrator to request
              access.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
