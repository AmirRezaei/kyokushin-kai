import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Facebook } from '@mui/icons-material';
import { getClientConfigSnapshot } from '../../config/clientConfig';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface MergeLoginPayload {
  accessToken: string;
  expiresIn?: number;
  user: {
    id: string;
    email: string;
    name?: string;
    imageUrl?: string;
    picture?: string;
    role?: 'admin' | 'user';
    providers?: string[];
  };
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

const AccountPage: React.FC = () => {
  const { user, logout, login, token, refreshProfile, applyUserSession } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name || user?.email || 'User';
  const secondaryLabel = user?.email || 'Signed in';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const linkedProviders = user?.providers ?? [];
  const isFacebookLinked = linkedProviders.includes('facebook');
  const isGoogleLinked = linkedProviders.includes('google');
  const isLastProvider = linkedProviders.length <= 1;
  const applyMergedLogin = (login: MergeLoginPayload) => {
    const expiresAt = Math.floor(Date.now() / 1000) + (login.expiresIn ?? 3600);
    const userData = {
      id: login.user.id,
      name: login.user.name || login.user.email,
      email: login.user.email,
      imageUrl: login.user.imageUrl || login.user.picture || '',
      token: login.accessToken,
      expiresAt,
      role: login.user.role ?? 'user',
      providers: login.user.providers,
    };
    applyUserSession(userData);
    navigate('/account', { replace: true });
  };

  const expiresAtLabel = user?.expiresAt
    ? new Date(user.expiresAt * 1000).toLocaleString()
    : 'Unknown';

  const handleDeleteAccount = async () => {
    if (!token) {
      showSnackbar('Please sign in again to delete your account.', 'warning');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch('/api/v1/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      showSnackbar('Account deleted.', 'success');
      navigate('/home', { replace: true, state: { logoutAfterNavigate: true } });
    } catch (error) {
      console.error('Account delete failed', error);
      showSnackbar('Failed to delete account. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={user?.imageUrl} alt={displayName} sx={{ width: 72, height: 72 }}>
            {initials || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {secondaryLabel}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={user?.role === 'admin' ? 'Admin' : 'User'}
                color={user?.role === 'admin' ? 'secondary' : 'default'}
                size="small"
                variant="outlined"
              />
              {linkedProviders.length > 0 ? (
                linkedProviders.map((p) => (
                  <Chip
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    size="small"
                    variant="outlined"
                  />
                ))
              ) : (
                <Chip label="None" size="small" variant="outlined" />
              )}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Session Expires
          </Typography>
          <Typography variant="body1">{expiresAtLabel}</Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Linked Accounts {JSON.stringify(user?.providers)}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Facebook />}
              disabled={isFacebookLinked && isLastProvider}
              onClick={async () => {
                if (!token) {
                  showSnackbar('Please sign in again to manage linked accounts.', 'warning');
                  return;
                }
                if (isFacebookLinked) {
                  if (confirm('Are you sure you want to unlink your Facebook account?')) {
                    const res = await fetch('/api/v1/auth/link/facebook', {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      await refreshProfile();
                      alert('Facebook account unlinked successfully.');
                    } else {
                      const err = await res.json();
                      alert(err.error || 'Failed to unlink account');
                    }
                  }
                } else {
                  const returnTo = '/account';
                  try {
                    const res = await fetch('/api/v1/auth/facebook/start', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      credentials: 'same-origin',
                      body: JSON.stringify({ mode: 'link', returnTo }),
                    });
                    const data = (await res.json().catch(() => ({}))) as {
                      authUrl?: string;
                      error?: string;
                    };
                    if (!res.ok || !data.authUrl) {
                      throw new Error(data.error || 'Failed to start Facebook link');
                    }
                    window.location.href = data.authUrl;
                  } catch (error) {
                    console.error('Failed to start Facebook link flow', error);
                    alert('Unable to start Facebook linking. Please try again.');
                  }
                }
              }}
              sx={{
                color: isFacebookLinked ? 'error.main' : '#1877F2',
                borderColor: isFacebookLinked ? 'error.main' : '#1877F2',
                '&:hover': {
                  borderColor: isFacebookLinked ? 'error.dark' : '#165EAB',
                  backgroundColor: isFacebookLinked
                    ? 'rgba(211, 47, 47, 0.04)'
                    : 'rgba(24, 119, 242, 0.04)',
                },
              }}
            >
              {isFacebookLinked ? 'Unlink Facebook' : 'Link Facebook'}
            </Button>
            <Button
              variant="outlined"
              startIcon={
                <img
                  src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                  alt="Google"
                  style={{ width: 20, height: 20 }}
                />
              }
              disabled={isGoogleLinked && isLastProvider}
              onClick={async () => {
                if (!token) {
                  showSnackbar('Please sign in again to manage linked accounts.', 'warning');
                  return;
                }
                if (isGoogleLinked) {
                  if (confirm('Are you sure you want to unlink your Google account?')) {
                    const res = await fetch('/api/v1/auth/link/google', {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      await refreshProfile();
                      alert('Google account unlinked successfully.');
                    } else {
                      const err = await res.json();
                      alert(err.error || 'Failed to unlink account');
                    }
                  }
                } else {
                  // Link Google Logic
                  const clientId = getClientConfigSnapshot().googleClientId;
                  if (!clientId || !window.google?.accounts?.id) {
                    alert('Google authentication is not ready. Please refresh the page.');
                    return;
                  }

                  window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: GoogleCredentialResponse) => {
                      if (response.credential) {
                        const res = await fetch('/api/v1/auth/link/google', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ token: response.credential }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (res.ok) {
                          if (data?.merged && data?.login) {
                            applyMergedLogin(data.login as MergeLoginPayload);
                            return;
                          }
                          await refreshProfile();
                          alert('Google account linked successfully!');
                          return;
                        }

                        if (res.status === 409) {
                          if (
                            confirm(
                              'This Google account is already linked to another user. Merge accounts?',
                            )
                          ) {
                            const mergeRes = await fetch('/api/v1/auth/link/google', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                token: response.credential,
                                merge: true,
                              }),
                            });
                            const mergeData = await mergeRes.json().catch(() => ({}));
                            if (mergeRes.ok && mergeData?.login) {
                              applyMergedLogin(mergeData.login as MergeLoginPayload);
                              return;
                            }
                            alert(mergeData.error || 'Failed to merge accounts');
                          }
                          return;
                        }

                        alert(data.error || 'Failed to link account');
                      }
                    },
                  });

                  window.google.accounts.id.prompt((notification: PromptNotification) => {
                    if (notification.isNotDisplayed()) {
                      console.warn(
                        'Google prompt not displayed:',
                        notification.getNotDisplayedReason(),
                      );
                      alert('Unable to show Google Sign-In prompt. It might be suppressed.');
                    }
                  });
                }
              }}
              sx={{
                color: isGoogleLinked ? 'error.main' : undefined,
                borderColor: isGoogleLinked ? 'error.main' : undefined,
                '&:hover': {
                  borderColor: isGoogleLinked ? 'error.dark' : undefined,
                  backgroundColor: isGoogleLinked
                    ? 'rgba(211, 47, 47, 0.04)'
                    : undefined,
                },
              }}
            >
              {isGoogleLinked ? 'Unlink Google' : 'Link Google'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Account Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={() => void logout()}>
              Sign out
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                await logout();
                await login();
              }}
            >
              Switch account
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Deleting your account removes your saved progress, settings, training history, and
            feedback. This action cannot be undone.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </Box>
      </Paper>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This permanently removes your account and all associated data. This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountPage;
