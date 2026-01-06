import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';
import { isLikelyInAppBrowser } from '@/components/utils/inAppBrowser';

export default function GoogleLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile, isLoading } = useAuth();
  const { showSnackbar } = useSnackbar();
  const processed = useRef(false);

  const collision = searchParams.get('collision') === 'true';
  const emailParam = searchParams.get('email');

  useEffect(() => {
    async function consumeCode(code: string, token: string | null) {
      try {
        const res = await fetch('/api/v1/auth/link/google/consume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 409) {
            showSnackbar('This Google account is already linked to another user.', 'error');
          } else {
            showSnackbar(data.error || 'Failed to link Google account', 'error');
          }
          navigate('/settings');
          return;
        }

        await refreshProfile(token || undefined);
        showSnackbar('Google account linked successfully!', 'success');
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

    if (processed.current || isLoading) return;

    const code = searchParams.get('code');
    if (!code) {
      showSnackbar('Invalid callback request', 'error');
      navigate('/login');
      return;
    }

    const token = user?.token ?? null;

    if (!token || !user) {
      if (collision) {
        return;
      }
      showSnackbar('Please sign in to link your Google account.', 'warning');
      navigate('/login');
      return;
    }

    processed.current = true;
    consumeCode(code, token);
  }, [searchParams, navigate, showSnackbar, user, collision, refreshProfile, isLoading]);

  if (collision && !user) {
    const currentPath = location.pathname + location.search;
    const facebookLoginUrl = `/api/v1/auth/facebook/start?mode=login&returnTo=${encodeURIComponent(
      currentPath,
    )}`;

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 420 }}>
          <Typography variant="h6" gutterBottom color="warning.main">
            Account Exists
          </Typography>
          <Typography variant="body1" paragraph>
            An account with the email <strong>{emailParam}</strong> already exists.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            To confirm ownership, please sign in with Facebook. We will then link your Google
            account automatically.
          </Typography>
          <Box mt={3}>
            <Typography
              component="a"
              href={facebookLoginUrl}
              onClick={(event) => {
                if (isLikelyInAppBrowser()) {
                  event.preventDefault();
                  alert(
                    'Facebook login must complete in your device browser (Chrome/Safari). ' +
                      'In-app browsers can open a separate session and will not return to this page. ' +
                      'Please open this site in your browser and try again.',
                  );
                }
              }}
              sx={{
                display: 'inline-block',
                textDecoration: 'none',
                bgcolor: '#1877F2',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 1,
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#165EAB' },
              }}
            >
              Continue with Facebook
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
          Linking Google Account...
        </Typography>
        <CircularProgress sx={{ mt: 2 }} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Please wait while we verify your identity.
        </Typography>
      </Paper>
    </Box>
  );
}
