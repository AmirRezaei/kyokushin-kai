// File: ./src/App.tsx

import {AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography, useTheme} from '@mui/material';
import {AccountCircle} from '@mui/icons-material';
import React, {useState} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {SnackbarProvider, useSnackbar} from './components/context/SnackbarContext';
import {AuthProvider, useAuth} from './components/context/AuthContext';

import About from './About';
import EquipmentPage from './app/Equipment/EquipmentPage';
import KihonPage from './app/kihon/kihonPage';
import SettingsPage from './app/settings/settingsPage';
import TechniquePage from './app/Technique/TechniquePage';
import TenThousandDaysTrackerPage from './app/ten-thousand-days/TenThousandDaysTrackerPage';
import TrainingTrackerPage from './app/ten-thousand-days/TrainingTrackerPage';
import TerminologyPage from './app/terminology/terminologyPage';
import TimerPage from './app/timer/timerPage';
import TrainingSessionPage from './app/trainingSession/trainingSessionPage';
import WordQuestPage from './app/WordQuest/WordQuestPage';
import AppNotFoundPage from './AppNotFoundPage';
import BreathingTechniquesPage from './BreathingTechniquesPage';
import DojoKunPage from './app/dojo-kun/DojoKunPage';
import TemporaryDrawer from './components/TemporaryDrawer';
import DarkModeToggle from './components/UI/DarkModeToggle';
import LanguageSelector from './components/UI/LanguageSelector';
import Home from './Home';
import MottoPage from './app/motto/MottoPage';

function AppContent() {
   const theme = useTheme();
   const appBarHeight = theme.mixins.toolbar.minHeight || 48; // Default to 48 if not defined in theme
   const {user, isAuthenticated, login, logout, error: authError} = useAuth();
   const navigate = useNavigate();
   const { showSnackbar } = useSnackbar();

   React.useEffect(() => {
      if (authError) {
         showSnackbar(authError, 'error');
      }
   }, [authError, showSnackbar]);

   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   const open = Boolean(anchorEl);

   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleGoogleLogin = () => {
      login();
      handleClose();
   };

   const handleLogout = () => {
      logout();
      handleClose();
   };

   const handleProfile = () => {
      console.log('Profile clicked');
      handleClose();
   };

   const handleSettings = () => {
      navigate('/settings');
      handleClose();
   };

   return (
      <>
         {/* Fixed AppBar */}
         <AppBar
            position='fixed'
            sx={{
               backgroundColor: theme.palette.background.paper, // Background based on theme
               color: theme.palette.text.primary, // Text color based on theme
               boxShadow: theme.shadows[4], // Optional: Add a shadow for depth
               maxWidth: '100%', // Ensure AppBar does not exceed viewport width
               height: `${appBarHeight}px`, // Set AppBar height based on theme
               overflowX: 'hidden', // Prevent horizontal scroll
            }}>
            <Toolbar variant='dense'>
               {/* Temporary Drawer Icon */}
               <TemporaryDrawer />

               {/* App Title */}
               <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2, userSelect: 'none'}}>
                  <Typography variant='h6' color='inherit' sx={{textAlign: 'center', lineHeight: 1.2}}>
                     <Tooltip title='Ultimate Truth'>
                        <Box component='span' sx={{'&:hover': {color: 'red'}, 'cursor': 'help', 'transition': 'color 0.2s'}}>
                           Kyokushin
                        </Box>
                     </Tooltip>
                     -
                     <Tooltip title='Association/Society'>
                        <Box component='span' sx={{'&:hover': {color: 'red'}, 'cursor': 'help', 'transition': 'color 0.2s'}}>
                           Kai
                        </Box>
                     </Tooltip>
                     {' ('}
                     <Tooltip title='Ultimate'>
                        <Box component='span' sx={{'&:hover': {color: 'red'}, 'cursor': 'help', 'transition': 'color 0.2s'}}>
                           極
                        </Box>
                     </Tooltip>
                     <Tooltip title='Truth'>
                        <Box component='span' sx={{'&:hover': {color: 'red'}, 'cursor': 'help', 'transition': 'color 0.2s'}}>
                           真
                        </Box>
                     </Tooltip>
                     <Tooltip title='Association/Society'>
                        <Box component='span' sx={{'&:hover': {color: 'red'}, 'cursor': 'help', 'transition': 'color 0.2s'}}>
                           会
                        </Box>
                     </Tooltip>
                     )
                  </Typography>
                  <Typography variant='caption' color='inherit' sx={{textAlign: 'center', lineHeight: 1}}>
                     Association of the Ultimate Truth
                  </Typography>
               </Box>

               <Box sx={{flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <DarkModeToggle />
                  <LanguageSelector />

                  {/* User Account Menu */}
                  <IconButton size='large' aria-label='account of current user' aria-controls='menu-appbar' aria-haspopup='true' onClick={handleMenu} color='inherit'>
                     {isAuthenticated && user?.imageUrl ? <Avatar src={user.imageUrl} /> : <AccountCircle />}
                  </IconButton>
                  <Menu
                     id='menu-appbar'
                     anchorEl={anchorEl}
                     anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                     }}
                     keepMounted
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                     }}
                     open={open}
                     onClose={handleClose}>
                     {isAuthenticated && user && (
                        <MenuItem disabled>
                           <Typography variant='body2' sx={{fontWeight: 'bold'}}>
                              {user.name}
                           </Typography>
                        </MenuItem>
                     )}
                     {isAuthenticated && (
                        <MenuItem onClick={handleProfile}>
                           <Typography>User Profile</Typography>
                        </MenuItem>
                     )}
                     {isAuthenticated && (
                        <MenuItem onClick={handleSettings}>
                           <Typography>Settings</Typography>
                        </MenuItem>
                     )}
                     {isAuthenticated && (
                        <MenuItem onClick={handleLogout}>
                           <Typography>Logout</Typography>
                        </MenuItem>
                     )}
                     {!isAuthenticated && (
                        <MenuItem onClick={handleGoogleLogin}>
                           <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                              <Typography>Login with Google</Typography>
                           </Box>
                        </MenuItem>
                     )}
                  </Menu>
               </Box>
            </Toolbar>
         </AppBar>

         {/* Main Content */}
         <Box
            component='main'
            sx={{
               position: 'relative', // Ensure AppBar does not overlap content
               marginTop: `${appBarHeight}px`,
               marginLeft: 0,
               marginRight: 0,
               marginBottom: 0,
               padding: 0, // Padding around the content
               width: '100%', // Ensure Main Content covers 100% of viewport width
               overflowX: 'hidden', // Prevent horizontal scroll
               overflowY: 'auto', // Allow vertical scroll if content overflows
               height: `calc(100vh - ${appBarHeight}px)`, // Adjust height to fit within viewport minus AppBar height
               boxSizing: 'border-box', // Ensure padding and border are included in the element's total width and height
            }}>
            <Routes>
               <Route path='/' element={<Home />} />
               <Route path='/home' element={<Home />} />
               <Route path='/motto-explorer' element={<MottoPage />} />
               <Route path='/technique' element={<TechniquePage />} />
               <Route path='/breathing' element={<BreathingTechniquesPage />} />
               <Route path='/kihon' element={<KihonPage />} />
               <Route path='/terminology' element={<TerminologyPage />} />
               <Route path='/WordQuest' element={<WordQuestPage />} />
               <Route path='/timer' element={<TimerPage />} />
               <Route path='/trainingSession' element={<TrainingSessionPage />} />
               <Route path='/EquipmentTabsPage' element={<EquipmentPage />} />
               <Route path='/settings' element={<SettingsPage />} />
               <Route path='/ten-thousand-days' element={<TenThousandDaysTrackerPage />} />
               <Route path='/training-tracker' element={<TrainingTrackerPage />} />
               <Route path='/dojo-kun' element={<DojoKunPage />} />
               <Route path='/about' element={<About />} />
               <Route path='*' element={<AppNotFoundPage />} />
            </Routes>
         </Box>

      </>
   );
}

function App() {
   return (
      <AuthProvider>
         <SnackbarProvider>
            <AppContent />
         </SnackbarProvider>
      </AuthProvider>
   );
}

export default App;
