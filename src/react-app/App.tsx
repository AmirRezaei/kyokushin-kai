// File: ./src/App.tsx

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { AccountCircle, BugReport, Fullscreen, FullscreenExit } from '@mui/icons-material';
import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from './components/context/SnackbarContext';
import { FullscreenProvider, useFullscreen } from './components/context/FullscreenContext';
import { useAuth } from './components/context/AuthContext';

import About from './About';
import TrainingManagerPage from './app/TrainingManager/TrainingManagerPage';

import KihonPage from './app/kihon/kihonPage';
import SettingsPage from './app/settings/settingsPage';
import TechniquePage from './app/Technique/TechniquePage';
import TenThousandDaysTrackerPage from './app/ten-thousand-days/TenThousandDaysTrackerPage';
import TrainingTrackerPage from './app/ten-thousand-days/TrainingTrackerPage';
import TerminologyPage from './app/terminology/terminologyPage';
import TimerPage from './app/timer/timerPage';
import TrainingSessionPage from './app/trainingSession/trainingSessionPage';
import WordPlayPage from './app/WordQuest/WordPlay/WordPlayPage';
import CardPage from './app/WordQuest/Card/CardPage';
import CardMatchPage from './app/WordQuest/Card/CardMatchPage';
import CardCrosswordPage from './app/WordQuest/Card/CardCrosswordPage';
import CardManagerPage from './app/WordQuest/Card/CardManagerPage';
import DeckManagerPage from './app/WordQuest/Card/DeckManagerPage';
import AppNotFoundPage from './AppNotFoundPage';
import BreathingTechniquesPage from './BreathingTechniquesPage';
import DojoKunPage from './app/dojo-kun/DojoKunPage';
import OsuSpiritPage from './app/osu-spirit/OsuSpiritPage';
import TemporaryDrawer from './components/TemporaryDrawer';
import LogoutPage from './components/LogoutPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DarkModeToggle from './components/UI/DarkModeToggle';
import LanguageSelector from './components/UI/LanguageSelector';
import Home from './Home';
import MottoPage from './app/motto/MottoPage';
import Footer from './components/Footer';
import FeedbackPage from './app/feedback/FeedbackPage';
import AdminPage from './app/admin/AdminPage';
import AdminRolesPage from './app/admin/AdminRolesPage';
import { useCatalogQuery } from '@/hooks/useCatalog';

function AppContent() {
  const theme = useTheme();
  const appBarHeight = theme.mixins.toolbar.minHeight || 48; // Default to 48 if not defined in theme
  const appBarRef = useRef<HTMLDivElement>(null);
  const [appBarOffset, setAppBarOffset] = useState(appBarHeight);

  useEffect(() => {
    const node = appBarRef.current;
    if (!node) return;

    const updateOffset = () => {
      const height = node.getBoundingClientRect().height || appBarHeight;
      setAppBarOffset(height);
    };

    updateOffset();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateOffset());
      observer.observe(node);
    }

    window.addEventListener('orientationchange', updateOffset);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('orientationchange', updateOffset);
    };
  }, [appBarHeight]);
  const { user, isAuthenticated, login, error: authError } = useAuth();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { isError: isCatalogError, error: catalogError } = useCatalogQuery();
  const lastCatalogErrorRef = useRef<string | null>(null);

  // Helper function to convert route path to human-readable page name
  const getPageName = (pathname: string): string => {
    const pathMap: Record<string, string> = {
      '/': 'Home',
      '/home': 'Home',
      '/motto-explorer': 'Motto Explorer',
      '/technique': 'Technique',
      '/breathing': 'Breathing Techniques',
      '/kihon': 'Kihon',
      '/terminology': 'Terminology',
      '/WordQuest': 'Word Quest',
      '/cards': 'Cards',
      '/cards/match': 'Card Match',
      '/cards/crossword': 'Card Crossword',
      '/card-manager': 'Card Manager',
      '/deck-manager': 'Deck Manager',
      '/timer': 'Timer',
      '/trainingSession': 'Training Session',
      '/training-manager': 'Training Manager',
      '/settings': 'Settings',
      '/ten-thousand-days': 'Ten Thousand Days',
      '/training-tracker': 'Training Tracker',
      '/dojo-kun': 'Dojo Kun',
      '/spirit-of-osu': 'Spirit of Osu',
      '/feedback': 'Feedback',
      '/admin': 'Admin',
      '/admin/roles': 'Admin Roles',
      '/admin/feedback': 'Feedback',
      '/about': 'About',
    };
    return pathMap[pathname] || 'Unknown Page';
  };

  const handleReportIssue = () => {
    const pageName = getPageName(location.pathname);
    navigate(`/feedback?type=bug&page=${encodeURIComponent(pageName)}`);
  };

  React.useEffect(() => {
    if (authError) {
      showSnackbar(authError, 'error');
    }
  }, [authError, showSnackbar]);

  React.useEffect(() => {
    if (!isCatalogError) {
      lastCatalogErrorRef.current = null;
      return;
    }
    const message =
      catalogError instanceof Error ? catalogError.message : 'Unable to load catalog data';
    if (lastCatalogErrorRef.current !== message) {
      showSnackbar(message, 'error');
      lastCatalogErrorRef.current = message;
    }
  }, [isCatalogError, catalogError, showSnackbar]);

  React.useEffect(() => {
    const handleSettingsConflict = () => {
      showSnackbar('Settings updated from another device. Reloading latest.', 'warning');
    };
    const handleSessionConflict = () => {
      showSnackbar('Training session updated from another device.', 'warning');
    };
    const handleCardConflict = () => {
      showSnackbar('Card updated from another device. Reloading.', 'warning');
    };
    const handleDeckConflict = () => {
      showSnackbar('Deck updated from another device. Reloading.', 'warning');
    };

    window.addEventListener('settings-conflict', handleSettingsConflict);
    window.addEventListener('training-session-conflict', handleSessionConflict);
    window.addEventListener('card-conflict', handleCardConflict);
    window.addEventListener('deck-conflict', handleDeckConflict);

    return () => {
      window.removeEventListener('settings-conflict', handleSettingsConflict);
      window.removeEventListener('training-session-conflict', handleSessionConflict);
      window.removeEventListener('card-conflict', handleCardConflict);
      window.removeEventListener('deck-conflict', handleDeckConflict);
    };
  }, [showSnackbar]);

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
    navigate('/logout');
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
      {/* Fixed AppBar - Always visible */}
      <AppBar
        ref={appBarRef}
        position="fixed"
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[4],
          maxWidth: '100%',
          minHeight: `${appBarHeight}px`,
          overflow: 'hidden',
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: `${appBarHeight}px`, overflow: 'hidden' }}>
          {/* Temporary Drawer Icon */}
          <TemporaryDrawer />

          {/* App Title */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              ml: { xs: 1, sm: 2 },
              userSelect: 'none',
              minWidth: 0,
              flex: '0 1 auto',
            }}
          >
            <Typography
              variant="h6"
              color="inherit"
              sx={{
                textAlign: 'center',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
              }}
            >
              <Tooltip title="Ultimate Truth">
                <Box
                  component="span"
                  sx={{ '&:hover': { color: 'red' }, cursor: 'help', transition: 'color 0.2s' }}
                >
                  Kyokushin
                </Box>
              </Tooltip>
              -
              <Tooltip title="Association/Society">
                <Box
                  component="span"
                  sx={{ '&:hover': { color: 'red' }, cursor: 'help', transition: 'color 0.2s' }}
                >
                  Kai
                </Box>
              </Tooltip>
              {' ('}
              <Tooltip title="Ultimate">
                <Box
                  component="span"
                  sx={{ '&:hover': { color: 'red' }, cursor: 'help', transition: 'color 0.2s' }}
                >
                  極
                </Box>
              </Tooltip>
              <Tooltip title="Truth">
                <Box
                  component="span"
                  sx={{ '&:hover': { color: 'red' }, cursor: 'help', transition: 'color 0.2s' }}
                >
                  真
                </Box>
              </Tooltip>
              <Tooltip title="Association/Society">
                <Box
                  component="span"
                  sx={{ '&:hover': { color: 'red' }, cursor: 'help', transition: 'color 0.2s' }}
                >
                  会
                </Box>
              </Tooltip>
              )
            </Typography>
            <Typography
              variant="caption"
              color="inherit"
              sx={{
                textAlign: 'center',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Association of the Ultimate Truth
            </Typography>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <DarkModeToggle />
            <LanguageSelector />

            {/* Fullscreen Toggle */}
            <IconButton
              size="large"
              aria-label="toggle fullscreen"
              onClick={toggleFullscreen}
              color="inherit"
              sx={{ mr: 1 }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>

            {/* Report Issue Button */}
            <Tooltip title="Report Bug or Feature">
              <IconButton
                size="large"
                aria-label="report bug or feature"
                onClick={handleReportIssue}
                color="inherit"
                sx={{ mr: 1 }}
              >
                <BugReport />
              </IconButton>
            </Tooltip>

            {/* User Account Menu */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {isAuthenticated && user?.imageUrl ? (
                <Avatar src={user.imageUrl} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
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
              onClose={handleClose}
            >
              {isAuthenticated && user && (
                <MenuItem disabled>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          paddingTop: `${appBarOffset}px`, // Always account for AppBar since it's always visible
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ flex: '1 0 auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/motto-explorer" element={<MottoPage />} />
            <Route
              path="/technique"
              element={
                <ProtectedRoute>
                  <TechniquePage />
                </ProtectedRoute>
              }
            />
            <Route path="/breathing" element={<BreathingTechniquesPage />} />
            {/* Kihon - Development Only */}
            {import.meta.env.DEV && <Route path="/kihon" element={<KihonPage />} />}
            <Route
              path="/terminology"
              element={
                <ProtectedRoute>
                  <TerminologyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/WordQuest"
              element={
                <ProtectedRoute>
                  <WordPlayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <ProtectedRoute>
                  <CardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards/match"
              element={
                <ProtectedRoute>
                  <CardMatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards/crossword"
              element={
                <ProtectedRoute>
                  <CardCrosswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/card-manager"
              element={
                <ProtectedRoute>
                  <CardManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deck-manager"
              element={
                <ProtectedRoute>
                  <DeckManagerPage />
                </ProtectedRoute>
              }
            />
            <Route path="/timer" element={<TimerPage />} />
            <Route
              path="/trainingSession"
              element={
                <ProtectedRoute>
                  <TrainingSessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training-manager"
              element={
                <ProtectedRoute>
                  <TrainingManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <AdminRoute>
                  <AdminRolesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <AdminRoute>
                  <FeedbackPage mode="admin" />
                </AdminRoute>
              }
            />
            <Route path="/logout" element={<LogoutPage />} />
            <Route
              path="/ten-thousand-days"
              element={
                <ProtectedRoute>
                  <TenThousandDaysTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training-tracker"
              element={
                <ProtectedRoute>
                  <TrainingTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dojo-kun" element={<DojoKunPage />} />
            <Route path="/spirit-of-osu" element={<OsuSpiritPage />} />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<AppNotFoundPage />} />
          </Routes>
        </Box>
        {!isFullscreen && <Footer />}
      </Box>
    </>
  );
}

function App() {
  return (
    <SnackbarProvider>
      <FullscreenProvider>
        <AppContent />
      </FullscreenProvider>
    </SnackbarProvider>
  );
}

export default App;
