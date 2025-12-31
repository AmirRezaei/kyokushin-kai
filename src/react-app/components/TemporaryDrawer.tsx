// File: ./src/components/TemporaryDrawer.tsx
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import GamepadIcon from '@mui/icons-material/Gamepad';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TimerIcon from '@mui/icons-material/Timer';
import ExtensionIcon from '@mui/icons-material/Extension';
import GridOnIcon from '@mui/icons-material/GridOn';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import StyleIcon from '@mui/icons-material/Style';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import CloseIcon from '@mui/icons-material/Close';
import BugReportIcon from '@mui/icons-material/BugReport';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme, alpha, Theme } from '@mui/material/styles';
import { Typography, Divider, Tooltip } from '@mui/material';
import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Navigation item component with active state
const NavItem = React.memo(
  ({
    path,
    icon,
    label,
    nested = false,
    protected: isProtected = false,
    isActive,
    isAuthenticated,
    handleNavigation,
    theme,
  }: {
    path: string;
    icon: React.ReactNode;
    label: string;
    nested?: boolean;
    protected?: boolean;
    isActive: boolean;
    isAuthenticated: boolean;
    handleNavigation: (path: string) => (event: React.MouseEvent) => void;
    theme: Theme;
  }) => {
    if (isProtected && !isAuthenticated) return null;

    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleNavigation(path)}
          sx={{
            pl: nested ? 4 : 2,
            py: 1.5,
            backgroundColor: isActive
              ? alpha(theme.palette.primary.main, 0.12)
              : nested
                ? alpha(theme.palette.text.primary, 0.04)
                : 'transparent',
            borderLeft: isActive
              ? `4px solid ${theme.palette.primary.main}`
              : '4px solid transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isActive
                ? alpha(theme.palette.primary.main, 0.18)
                : alpha(theme.palette.primary.main, 0.08),
              borderLeftColor: theme.palette.primary.main,
              transform: 'translateX(4px)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive ? theme.palette.primary.main : 'inherit',
              minWidth: 40,
              transition: 'color 0.2s ease',
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontWeight: isActive ? 600 : 400,
              color: isActive ? theme.palette.primary.main : 'inherit',
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  },
);

NavItem.displayName = 'NavItem';

// Section header component
const SectionHeader = React.memo(
  ({
    section,
    icon,
    label,
    protected: isProtected = false,
    isOpen,
    isAuthenticated,
    handleSectionClick,
    theme,
  }: {
    section: string;
    icon: React.ReactNode;
    label: string;
    protected?: boolean;
    isOpen: boolean;
    isAuthenticated: boolean;
    handleSectionClick: (section: string) => (event: React.MouseEvent) => void;
    theme: Theme;
  }) => {
    if (isProtected && !isAuthenticated) return null;

    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleSectionClick(section)}
          sx={{
            py: 1.5,
            backgroundColor: isOpen ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isOpen ? theme.palette.primary.main : 'inherit',
              minWidth: 40,
              transition: 'color 0.2s ease',
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontWeight: isOpen ? 600 : 500,
              color: isOpen ? theme.palette.primary.main : 'inherit',
            }}
          />
          {isOpen ? (
            <ExpandLess sx={{ color: theme.palette.primary.main }} />
          ) : (
            <ExpandMore sx={{ color: 'text.secondary' }} />
          )}
        </ListItemButton>
      </ListItem>
    );
  },
);

SectionHeader.displayName = 'SectionHeader';

export default function TemporaryDrawer() {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = (newOpen: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(newOpen);
  };

  const handleNavigation = React.useCallback(
    (path: string) => (event: React.MouseEvent) => {
      event.stopPropagation();
      navigate(path);
      setDrawerOpen(false);
    },
    [navigate],
  );

  const handleSectionClick = React.useCallback(
    (section: string) => (event: React.MouseEvent) => {
      event.stopPropagation();
      setOpenSection((prev) => (prev === section ? null : section));
    },
    [],
  );

  // Check if a route is active
  const isActive = React.useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  const DrawerList = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
      }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
            theme.palette.secondary.main,
            0.1,
          )} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SelfImprovementIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Kyokushin-Kai
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              極真会
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Close menu">
          <IconButton onClick={toggleDrawer(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List sx={{ py: 1 }}>
          {/* Main Navigation */}
          <NavItem
            path="/home"
            icon={<HomeIcon />}
            label="Home"
            isActive={isActive('/home')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
          <NavItem
            path="/motto-explorer"
            icon={<FormatQuoteIcon />}
            label="Motto Explorer"
            isActive={isActive('/motto-explorer')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
          <NavItem
            path="/dojo-kun"
            icon={<FormatQuoteIcon />}
            label="Dojo Kun"
            isActive={isActive('/dojo-kun')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
          <NavItem
            path="/spirit-of-osu"
            icon={<FavoriteIcon />}
            label="Spirit of Osu"
            isActive={isActive('/spirit-of-osu')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />

          <Divider sx={{ my: 1 }} />

          {/* Protected Items */}
          <NavItem
            path="/technique"
            icon={<CategoryIcon />}
            label="Technique"
            protected
            isActive={isActive('/technique')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
          <NavItem
            path="/terminology"
            icon={<TextFieldsIcon />}
            label="Terminology"
            protected
            isActive={isActive('/terminology')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />

          {isAuthenticated && <Divider sx={{ my: 1 }} />}

          {/* Training Section */}
          <SectionHeader
            section="training"
            icon={<DirectionsRunIcon />}
            label="Training"
            isOpen={openSection === 'training'}
            isAuthenticated={isAuthenticated}
            handleSectionClick={handleSectionClick}
            theme={theme}
          />
          <Collapse in={openSection === 'training'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {import.meta.env.DEV && (
                <NavItem
                  path="/kihon"
                  icon={<SportsMartialArtsIcon />}
                  label="Kihon"
                  nested
                  isActive={isActive('/kihon')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
              )}
              <NavItem
                path="/trainingSession"
                icon={<ScheduleIcon />}
                label="Session Tracker"
                nested
                protected
                isActive={isActive('/trainingSession')}
                isAuthenticated={isAuthenticated}
                handleNavigation={handleNavigation}
                theme={theme}
              />
              <NavItem
                path="/training-manager"
                icon={<ScheduleIcon />}
                label="Training Manager"
                nested
                protected
                isActive={isActive('/training-manager')}
                isAuthenticated={isAuthenticated}
                handleNavigation={handleNavigation}
                theme={theme}
              />
              <NavItem
                path="/timer"
                icon={<TimerIcon />}
                label="Timer"
                nested
                isActive={isActive('/timer')}
                isAuthenticated={isAuthenticated}
                handleNavigation={handleNavigation}
                theme={theme}
              />
            </List>
          </Collapse>

          {/* Games Section - Protected */}
          <SectionHeader
            section="games"
            icon={<GamepadIcon />}
            label="Games"
            protected
            isOpen={openSection === 'games'}
            isAuthenticated={isAuthenticated}
            handleSectionClick={handleSectionClick}
            theme={theme}
          />
          {isAuthenticated && (
            <Collapse in={openSection === 'games'} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <NavItem
                  path="/WordQuest"
                  icon={<TextFieldsIcon />}
                  label="Word Quest"
                  nested
                  isActive={isActive('/WordQuest')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
                <NavItem
                  path="/cards"
                  icon={<StyleIcon />}
                  label="Cards"
                  nested
                  isActive={isActive('/cards')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
                <NavItem
                  path="/cards/match"
                  icon={<ExtensionIcon />}
                  label="Match Game"
                  nested
                  isActive={isActive('/cards/match')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
                <NavItem
                  path="/cards/crossword"
                  icon={<GridOnIcon />}
                  label="Crossword"
                  nested
                  isActive={isActive('/cards/crossword')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
                <NavItem
                  path="/card-manager"
                  icon={<StyleIcon />}
                  label="Card Manager"
                  nested
                  isActive={isActive('/card-manager')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
                <NavItem
                  path="/deck-manager"
                  icon={<LibraryBooksIcon />}
                  label="Deck Manager"
                  nested
                  isActive={isActive('/deck-manager')}
                  isAuthenticated={isAuthenticated}
                  handleNavigation={handleNavigation}
                  theme={theme}
                />
              </List>
            </Collapse>
          )}

          {isAuthenticated && <Divider sx={{ my: 1 }} />}

          {/* Bottom Items */}
          <NavItem
            path="/training-tracker"
            icon={<DirectionsRunIcon />}
            label="Training Tracker"
            protected
            isActive={isActive('/training-tracker')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
          <NavItem
            path="/settings"
            icon={<SettingsIcon />}
            label="Settings"
            protected
            isActive={isActive('/settings')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
          {user?.role === 'admin' && (
            <>
              <Divider sx={{ my: 1 }} />
              <SectionHeader
                section="admin"
                icon={<AdminPanelSettingsIcon />}
                label="Administration"
                protected
                isOpen={openSection === 'admin'}
                isAuthenticated={isAuthenticated}
                handleSectionClick={handleSectionClick}
                theme={theme}
              />
              <Collapse in={openSection === 'admin'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <NavItem
                    path="/admin"
                    icon={<AdminPanelSettingsIcon />}
                    label="Admin Console"
                    nested
                    protected
                    isActive={isActive('/admin')}
                    isAuthenticated={isAuthenticated}
                    handleNavigation={handleNavigation}
                    theme={theme}
                  />
                  <NavItem
                    path="/admin/roles"
                    icon={<AdminPanelSettingsIcon />}
                    label="Admin Roles"
                    nested
                    protected
                    isActive={isActive('/admin/roles')}
                    isAuthenticated={isAuthenticated}
                    handleNavigation={handleNavigation}
                    theme={theme}
                  />
                </List>
              </Collapse>
            </>
          )}
          <NavItem
            path="/feedback"
            icon={<BugReportIcon />}
            label="Bug Reports & Features"
            protected
            isActive={isActive('/feedback')}
            isAuthenticated={isAuthenticated}
            handleNavigation={handleNavigation}
            theme={theme}
          />
        </List>
      </Box>

      {/* Footer */}
      {isAuthenticated && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Logged in as {user?.name || 'User'}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Tooltip title="Open menu">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{
            mr: 2,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </Box>
  );
}
