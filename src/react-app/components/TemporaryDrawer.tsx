// File: ./src/components/TemporaryDrawer.tsx
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import StarIcon from '@mui/icons-material/Star';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TimerIcon from '@mui/icons-material/Timer';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {useTheme} from '@mui/material/styles';
import * as React from 'react';
import {useNavigate} from 'react-router-dom';

export default function TemporaryDrawer() {
   const theme = useTheme(); // Add this line
   const [drawerOpen, setDrawerOpen] = React.useState(false);
   const [openSection, setOpenSection] = React.useState<string | null>(null); // Replace multiple state variables
   const navigate = useNavigate();

   const toggleDrawer = (newOpen: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => {
      // Allow toggling with keyboard events as well
      if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
         return;
      }
      setDrawerOpen(newOpen);
   };

   const handleNavigation = (path: string) => (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent the event from bubbling up to Box
      navigate(path);
      setDrawerOpen(false); // Close the drawer after navigation
   };

   // Update handler to set the open section
   const handleSectionClick = (section: string) => (event: React.MouseEvent) => {
      event.stopPropagation();
      setOpenSection(prev => (prev === section ? null : section)); // Toggle section
   };

   const DrawerList = (
      <Box sx={{width: 250}} role='presentation' onKeyDown={toggleDrawer(false)}>
         <List>
            {/* Home */}
            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/home')}>
                  <ListItemIcon>
                     <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary='Home' />
               </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/motto-explorer')}>
                  <ListItemIcon>
                     <FormatQuoteIcon />
                  </ListItemIcon>
                  <ListItemText primary='Motto Explorer' />
               </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/dojo-kun')}>
                  <ListItemIcon>
                     <FormatQuoteIcon />
                  </ListItemIcon>
                  <ListItemText primary='Dojo Kun' />
               </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('Technique')}>
                  <ListItemIcon>
                     <CategoryIcon />
                  </ListItemIcon>
                  <ListItemText primary='Technique' />
               </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/terminology')}>
                  <ListItemIcon>
                     <TextFieldsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Terminology' />
               </ListItemButton>
            </ListItem>
            {/* Training Section */}
            <ListItem disablePadding>
               <ListItemButton onClick={handleSectionClick('training')}>
                  <ListItemIcon>
                     <DirectionsRunIcon />
                  </ListItemIcon>
                  <ListItemText primary='Training' />
                  {openSection === 'training' ? <ExpandLess /> : <ExpandMore />}
               </ListItemButton>
            </ListItem>
            <Collapse in={openSection === 'training'} timeout='auto' unmountOnExit>
               <List component='div' disablePadding>
                  {/* Kihon */}
                  <ListItem disablePadding>
                     <ListItemButton
                        sx={{
                           pl: 4,
                           backgroundColor: theme.palette.mode === 'dark' ? '#333333' : 'inherit',
                        }}
                        onClick={handleNavigation('/kihon')}>
                        <ListItemIcon>
                           <SportsMartialArtsIcon />
                        </ListItemIcon>
                        <ListItemText primary='Kihon' />
                     </ListItemButton>
                  </ListItem>
                  {/* Session Tracker */}
                  <ListItem disablePadding>
                     <ListItemButton
                        sx={{
                           pl: 4,
                           backgroundColor: theme.palette.mode === 'dark' ? '#333333' : 'inherit',
                        }}
                        onClick={handleNavigation('/trainingSession')}>
                        <ListItemIcon>
                           <ScheduleIcon />
                        </ListItemIcon>
                        <ListItemText primary='Session Tracker' />
                     </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                     <ListItemButton
                        sx={{
                           pl: 4,
                           backgroundColor: theme.palette.mode === 'dark' ? '#333333' : 'inherit',
                        }}
                        onClick={handleNavigation('/training-manager')}>
                        <ListItemIcon>
                           <ScheduleIcon />
                        </ListItemIcon>
                        <ListItemText primary='Training Manager' />
                     </ListItemButton>
                  </ListItem>
                  {/* Timer */}
                  <ListItem disablePadding>
                     <ListItemButton
                        sx={{
                           pl: 4,
                           backgroundColor: theme.palette.mode === 'dark' ? '#333333' : 'inherit',
                        }}
                        onClick={handleNavigation('/timer')}>
                        <ListItemIcon>
                           <TimerIcon />
                        </ListItemIcon>
                        <ListItemText primary='Timer' />
                     </ListItemButton>
                  </ListItem>
               </List>
            </Collapse>
            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/WordQuest')}>
                  <ListItemIcon>
                     <TextFieldsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Word Quest' />
               </ListItemButton>
            </ListItem>

            {/* <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/FlashCardManager')}>
                  <ListItemIcon>
                     <TextFieldsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Flash Card Manager' />
               </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/FlashCardPlayer')}>
                  <ListItemIcon>
                     <TextFieldsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Flash Card' />
               </ListItemButton>
            </ListItem> */}

            {/* <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/ten-thousand-days')}>
                  <ListItemIcon>
                     <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary='10,000 Days Tracker' />
               </ListItemButton>
            </ListItem> */}

            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/training-tracker')}>
                  <ListItemIcon>
                     <DirectionsRunIcon />
                  </ListItemIcon>
                  <ListItemText primary='Training Tracker' />
               </ListItemButton>
            </ListItem>

            {/* Settings */}
            <ListItem disablePadding>
               <ListItemButton onClick={handleNavigation('/settings')}>
                  <ListItemIcon>
                     <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Settings' />
               </ListItemButton>
            </ListItem>
         </List>
      </Box>
   );

   return (
      <Box>
         <IconButton edge='start' color='inherit' aria-label='menu' sx={{mr: 2}} onClick={toggleDrawer(true)}>
            <MenuIcon />
         </IconButton>

         <Drawer
            variant='temporary'
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            ModalProps={{
               keepMounted: true, // Better open performance on mobile.
            }}>
            {DrawerList}
         </Drawer>
      </Box>
   );
}
