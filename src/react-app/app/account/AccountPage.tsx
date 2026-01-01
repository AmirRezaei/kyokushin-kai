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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';

const AccountPage: React.FC = () => {
  const { user, logout, login, token } = useAuth();
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
              {user?.providers && user.providers.length > 0 ? (
                user.providers.map((p) => (
                  <Chip
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    size="small"
                    variant="outlined"
                  />
                ))
              ) : (
                // Fallback if no providers found (e.g. legacy or just signed up via google before migration)
                <Chip label="Google" size="small" variant="outlined" />
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
            Linked Accounts
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Facebook />}
              disabled={!!(user?.providers && user.providers.includes('facebook'))}
              onClick={() => {
                window.location.href = '/api/v1/auth/facebook/start?mode=link';
              }}
              sx={{
                color: user?.providers?.includes('facebook') ? undefined : '#1877F2',
                borderColor: user?.providers?.includes('facebook') ? undefined : '#1877F2',
              }}
            >
              {user?.providers && user.providers.includes('facebook')
                ? 'Facebook Linked'
                : 'Link Facebook'}
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
              disabled={!user?.providers || user.providers.includes('google')}
            >
              {!user?.providers || user.providers.includes('google')
                ? 'Google Linked'
                : 'Link Google'}
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
