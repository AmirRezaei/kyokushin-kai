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
  const { user, refreshProfile, applyUserSession, isLoading } = useAuth();
  const processed = useRef(false);

  const collision = searchParams.get('collision') === 'true';
  const emailParam = searchParams.get('email');

  useEffect(() => {
    const normalizeReturnTo = (value: string | null | undefined) => {
      const fallback = '/';
      if (!value) return fallback;
      if (value.startsWith('/#')) return value.replace('/#', '');
      if (!value.startsWith('/')) return `/${value}`;
      return value;
    };

    async function consumeCodeEncoded(code: string) {
      try {
        const token = user?.token ?? null;

        const res = await fetch('/api/v1/auth/link/facebook/consume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
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
          navigate(normalizeReturnTo(data.returnTo));
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('An error occurred.', 'error');
        navigate('/');
      }
    }

    async function consumeLoginCode(code: string) {
      try {
        const res = await fetch('/api/v1/auth/facebook/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          accessToken: string;
          expiresIn?: number;
          returnTo?: string;
          user: {
            id: string;
            email: string;
            name?: string;
            imageUrl?: string;
            role?: 'admin' | 'user';
            providers?: string[];
          };
          error?: string;
        };

        if (!res.ok) {
          showSnackbar(data.error || 'Facebook login failed', 'error');
          navigate('/login');
          return;
        }

        const expiresAt = Math.floor(Date.now() / 1000) + (data.expiresIn ?? 3600);

        applyUserSession({
          id: data.user.id,
          name: data.user.name ?? data.user.email,
          email: data.user.email,
          imageUrl: data.user.imageUrl,
          token: data.accessToken,
          expiresAt,
          role: data.user.role === 'admin' ? 'admin' : 'user',
          providers: data.user.providers,
        });

        processed.current = true;
        void refreshProfile(data.accessToken);
        navigate(normalizeReturnTo(data.returnTo), { replace: true });
      } catch (err) {
        console.error(err);
        showSnackbar('An error occurred.', 'error');
        navigate('/login');
      }
    }

    if (processed.current) return;

    const loginCode = searchParams.get('loginCode');
    if (isLoading && !loginCode) {
      return;
    }
    if (loginCode) {
      processed.current = true;
      void consumeLoginCode(loginCode);
      return;
    }

    const code = searchParams.get('code');

    if (!code) {
      showSnackbar('Invalid callback request', 'error');
      navigate('/login');
      return;
    }

    if (!user) {
      if (collision) {
        // Don't auto-redirect, show specific message
        return;
      }
      // If NO collision and NO user, it means this is a "Login with Facebook" (New User or Existing FB User) attempt.
      // We should allow it to proceed to consumeCodeEncoded.
    }

    processed.current = true;
    consumeCodeEncoded(code);
  }, [
    searchParams,
    navigate,
    showSnackbar,
    user,
    collision,
    refreshProfile,
    applyUserSession,
    isLoading,
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
