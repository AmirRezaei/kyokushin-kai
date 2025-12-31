import React, {useCallback, useEffect, useState} from 'react';
import {
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
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import {useAuth} from '@/components/context/AuthContext';
import {useSnackbar} from '@/components/context/SnackbarContext';

type AdminUser = {
   userId: string;
   email: string;
   displayName?: string | null;
   imageUrl?: string | null;
   role: 'admin' | 'user';
   updatedAt: string;
};

const AdminRolesPage: React.FC = () => {
   const {token, user} = useAuth();
   const {showSnackbar} = useSnackbar();
   const [users, setUsers] = useState<AdminUser[]>([]);
   const [isLoadingUsers, setIsLoadingUsers] = useState(false);
   const [newAdminEmail, setNewAdminEmail] = useState('');
   const [isSaving, setIsSaving] = useState(false);

   const loadUsers = useCallback(async () => {
      if (!token) return;
      setIsLoadingUsers(true);
      try {
         const res = await fetch('/api/v1/admin/users', {
            headers: {Authorization: `Bearer ${token}`},
         });
         if (!res.ok) {
            throw new Error('Unable to load users');
         }
         const data = (await res.json()) as {users: AdminUser[]};
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
            body: JSON.stringify({email, role: 'admin'}),
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
            body: JSON.stringify({email: target.email, role: nextRole}),
         });

         if (!res.ok) {
            throw new Error('Role update failed');
         }

         showSnackbar(
            nextRole === 'admin' ? 'Admin role granted' : 'Admin role removed',
            'success',
         );
         await loadUsers();
      } catch (error) {
         console.error(error);
         showSnackbar('Failed to update role', 'error');
      }
   };

   return (
      <Container maxWidth="lg" sx={{py: 4}}>
         <Paper elevation={2} sx={{p: 3}}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
               Admin Roles
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
               Assign or remove admin access for verified users, or invite new admins by email.
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
               Users appear after their first Google sign-in.
            </Typography>
            <Divider sx={{my: 2}} />

            <Stack
               direction={{xs: 'column', sm: 'row'}}
               spacing={1}
               alignItems={{xs: 'stretch', sm: 'center'}}
               sx={{mb: 2}}
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
                     <TableCell>Email</TableCell>
                     <TableCell>Role</TableCell>
                     <TableCell align="right">Action</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {users.map((member) => {
                     const isSelf =
                        normalizeEmail(member.email) === normalizeEmail(user?.email || '');
                     const isPending = member.userId.startsWith('pending:');
                     return (
                        <TableRow key={member.userId}>
                           <TableCell>
                              <Stack spacing={0.25}>
                                 <Typography variant="body2">{member.email}</Typography>
                                 {isPending && (
                                    <Typography variant="caption" color="text.secondary">
                                       Pending login
                                    </Typography>
                                 )}
                              </Stack>
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
                        <TableCell colSpan={3} align="center">
                           No users found.
                        </TableCell>
                     </TableRow>
                  )}
                  {isLoadingUsers && (
                     <TableRow>
                        <TableCell colSpan={3} align="center">
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

export default AdminRolesPage;
