import React, { useEffect } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Facebook } from '@mui/icons-material';
import { useAuth } from './context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const error = searchParams.get('error');
  const providerHint = searchParams.get('provider'); // 'google' | 'facebook'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const handleGoogleLogin = () => {
    login();
  };

  const handleFacebookLogin = () => {
    // Redirect to backend start endpoint
    window.location.href = '/api/v1/auth/facebook/start?mode=login';
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error === 'facebook_cancel' ? 'Faceook login canceled.' : 'Authentication failed.'}
          </Typography>
        )}

        <Box sx={{ mt: 3, width: '100%' }}>
          {(!providerHint || providerHint === 'google') && (
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              sx={{ mb: 2 }}
              startIcon={
                <img
                  src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                  alt="Google"
                />
              }
            >
              Sign in with Google
            </Button>
          )}

          {(!providerHint || providerHint === 'facebook') && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleFacebookLogin}
              startIcon={<Facebook />}
              sx={{
                mb: 2,
                backgroundColor: '#1877F2',
                color: 'white',
                '&:hover': { backgroundColor: '#165EAB' },
              }}
            >
              Continue with Facebook
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
