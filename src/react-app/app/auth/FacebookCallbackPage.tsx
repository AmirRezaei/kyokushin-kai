import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from '../../components/context/SnackbarContext';
import { useAuth } from '../../components/context/AuthContext';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

export default function FacebookCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { user, refreshProfile } = useAuth();
  const processed = useRef(false);

  const collision = searchParams.get('collision') === 'true';
  const emailParam = searchParams.get('email');

  useEffect(() => {
    async function consumeCodeEncoded(code: string) {
      try {
        const token = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).token
          : null;

        const res = await fetch('/api/v1/auth/link/facebook/consume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 409) {
            showSnackbar('This Facebook account is already linked to another user.', 'error');
          } else {
            showSnackbar(data.error || 'Failed to link Facebook account', 'error');
          }
          navigate('/settings');
          return;
        }

        await refreshProfile(token || undefined);
        showSnackbar('Facebook account linked successfully!', 'success');
        if (data.returnTo) {
          navigate(data.returnTo);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('An error occurred.', 'error');
        navigate('/');
      }
    }

    if (processed.current) return;

    const code = searchParams.get('code');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      return;
    }

    if (!code) {
      showSnackbar('Invalid callback request', 'error');
      navigate('/login');
      return;
    }

    processed.current = true;

    if (!user) {
      if (collision) {
        // Don't auto-redirect, show specific message
        return;
      }
      // If NO collision and NO user, it means this is a "Login with Facebook" (New User or Existing FB User) attempt.
      // We should allow it to proceed to consumeCodeEncoded.
    }

    consumeCodeEncoded(code);
  }, [
    searchParams,
    navigate,
    showSnackbar,
    user,
    location.pathname,
    location.search,
    collision,
    refreshProfile,
  ]);

  if (collision && !user) {
    const currentPath = location.pathname + location.search;
    const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}&provider=google`;

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom color="warning.main">
            Account Exists
          </Typography>
          <Typography variant="body1" paragraph>
            An account with the email <strong>{emailParam}</strong> already exists.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            To secure your account, please sign in with your existing method (e.g., Google) to
            verify ownership. We will then link your Facebook account automatically.
          </Typography>
          <Box mt={3}>
            <Typography
              component="a"
              href={`/#${loginUrl}`}
              sx={{
                display: 'inline-block',
                textDecoration: 'none',
                bgcolor: 'primary.main',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 1,
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Sign In to Link
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Linking Facebook Account...
        </Typography>
        <CircularProgress sx={{ mt: 2 }} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Please wait while we verify your identity.
        </Typography>
      </Paper>
    </Box>
  );
}
