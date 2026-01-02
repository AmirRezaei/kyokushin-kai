import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';

type AdminUser = {
  userId: string;
  email: string;
  displayName?: string | null;
  imageUrl?: string | null;
  role: 'admin' | 'user';
  authMethods: {
    google: boolean;
    facebook: boolean;
    email: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

const AdminUsersPage: React.FC = () => {
  const { token, user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Unable to load users');
      }
      const data = (await res.json()) as { users: AdminUser[] };
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to load admin users', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleAddAdmin = async () => {
    if (!token) return;
    const email = newAdminEmail.trim();
    if (!email || !email.includes('@')) {
      showSnackbar('Enter a valid email address', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role: 'admin' }),
      });

      if (!res.ok) {
        throw new Error('Role update failed');
      }

      showSnackbar('Admin invited', 'success');
      setNewAdminEmail('');
      await loadUsers();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to register admin', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRole = async (target: AdminUser) => {
    if (!token) return;
    const nextRole: AdminUser['role'] = target.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/v1/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: target.email, role: nextRole }),
      });

      if (!res.ok) {
        throw new Error('Role update failed');
      }

      showSnackbar(nextRole === 'admin' ? 'Admin role granted' : 'Admin role removed', 'success');
      await loadUsers();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to update role', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getAuthMethodIcons = (authMethods: AdminUser['authMethods']) => {
    const methods = [];
    if (authMethods.google) {
      methods.push(
        <Chip
          key="google"
          icon={<GoogleIcon />}
          label="Google"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mr: 0.5 }}
        />,
      );
    }
    if (authMethods.facebook) {
      methods.push(
        <Chip
          key="facebook"
          icon={<FacebookIcon />}
          label="Facebook"
          size="small"
          color="info"
          variant="outlined"
          sx={{ mr: 0.5 }}
        />,
      );
    }
    if (authMethods.email) {
      methods.push(
        <Chip
          key="email"
          icon={<EmailIcon />}
          label="Email"
          size="small"
          color="default"
          variant="outlined"
          sx={{ mr: 0.5 }}
        />,
      );
    }
    return methods.length > 0 ? (
      methods
    ) : (
      <Typography variant="caption" color="text.secondary">
        None
      </Typography>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Users
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Manage user accounts, authentication methods, and administrative roles.
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Users appear after their first Google sign-in.
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          <TextField
            label="Admin email"
            value={newAdminEmail}
            onChange={(event) => setNewAdminEmail(event.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineIcon fontSize="small" />}
            onClick={handleAddAdmin}
            disabled={isSaving || !newAdminEmail.trim()}
          >
            Register Admin
          </Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Authentication Methods</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((member) => {
              const isSelf = normalizeEmail(member.email) === normalizeEmail(user?.email || '');
              const isPending = member.userId.startsWith('pending:');
              return (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={member.imageUrl || undefined}
                        alt={member.displayName || member.email}
                        sx={{ width: 32, height: 32 }}
                      >
                        {(member.displayName || member.email).charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {member.displayName || 'No Name'}
                        </Typography>
                        {isPending && (
                          <Typography variant="caption" color="warning.main">
                            Pending Login
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{member.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {getAuthMethodIcons(member.authMethods)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(member.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.role}
                      size="small"
                      color={member.role === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isSelf}
                        onClick={() => handleToggleRole(member)}
                      >
                        {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {!users.length && !isLoadingUsers && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {isLoadingUsers && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading users...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default AdminUsersPage;
