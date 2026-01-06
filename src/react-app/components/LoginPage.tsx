import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Facebook } from '@mui/icons-material';
import { useAuth } from './context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isLikelyInAppBrowser } from '@/components/utils/inAppBrowser';

export default function LoginPage() {
  const { login, isAuthenticated, renderGoogleButton } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const error = searchParams.get('error');
  const providerHint = searchParams.get('provider'); // 'google' | 'facebook'
  const showGoogleOption = providerHint !== 'facebook';
  const showGoogleWidget = showGoogleOption;
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);

  useEffect(() => {
    if (!showGoogleWidget) {
      return;
    }
    const node = googleButtonRef.current;
    if (!node) {
      return;
    }
    let cancelled = false;
    renderGoogleButton(node).then((ready) => {
      if (!cancelled) {
        setGoogleButtonReady(ready);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showGoogleWidget, renderGoogleButton]);

  const handleGoogleLogin = () => {
    login();
  };

  const handleFacebookLogin = () => {
    if (isLikelyInAppBrowser()) {
      alert(
        'Facebook login must complete in your device browser (Chrome/Safari). ' +
          'In-app browsers can open a separate session and will not return to this page. ' +
          'Please open this site in your browser and try again.',
      );
      return;
    }
    // Redirect to backend start endpoint
    const returnTo = encodeURIComponent(returnUrl || '/');
    window.location.href = `/api/v1/auth/facebook/start?mode=login&returnTo=${returnTo}`;
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
          {showGoogleOption && (
            <>
              {showGoogleWidget ? (
                <>
                  <Box
                    ref={googleButtonRef}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  />
                  {!googleButtonReady && (
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
                </>
              ) : (
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
            </>
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
