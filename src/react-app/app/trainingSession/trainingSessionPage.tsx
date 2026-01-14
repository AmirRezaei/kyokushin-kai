import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import { Box, Container, Tab, Tabs } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import TabPanel from '@/components/Training/TabPanel';
import TrainingSessionManager from '@/components/Training/TrainingSessionManager';
import TrainingSessionHeader from '@/components/Training/TrainingSessionHeader';
import TrainingSessionListSection from '@/components/Training/TrainingSessionListSection';
import TrainingSessionStatsSection from '@/components/Training/TrainingSessionStatsSection';
import { useScheduledSessions } from '@/hooks/useScheduledSessions';
import { useTrainingSessions } from '@/hooks/useTrainingSessions';
import ScheduledSessionManager from './ScheduledSessionManager';

/**
 * Training Session Page
 *
 * Mobile-friendly tabbed interface for tracking training sessions.
 * Supports both authenticated users (API-backed) and guest users (localStorage-backed).
 *
 * Features:
 * - Tabbed navigation (Log Session | Statistics | History)
 * - Responsive design with mobile optimizations
 * - Tab state persistence
 * - Touch-friendly UI elements
 */
const TrainingSessionPage: React.FC = () => {
  const { token } = useAuth();

  // Custom hook handles all data management and CRUD operations
  const { sessions, handleAddSession, handleEditSession, handleDeleteSession } =
    useTrainingSessions(token);
  const { scheduledSessions, addScheduledSession, updateScheduledSession, deleteScheduledSession } =
    useScheduledSessions(token);

  // Tab state with persistence
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('trainingSessionTab');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem('trainingSessionTab', activeTab.toString());
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // ARIA props for accessibility
  const a11yProps = (index: number) => ({
    id: `training-tab-${index}`,
    'aria-controls': `training-tabpanel-${index}`,
  });

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <TrainingSessionHeader />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="training session tabs"
          sx={{
            '& .MuiTab-root': {
              minHeight: { xs: 56, sm: 64 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            },
          }}
        >
          <Tab icon={<AddIcon />} iconPosition="start" label="Log Session" {...a11yProps(0)} />
          <Tab icon={<EventIcon />} iconPosition="start" label="Schedule" {...a11yProps(1)} />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Statistics" {...a11yProps(2)} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="History" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <TrainingSessionManager
          onAddSession={handleAddSession}
          scheduledSessions={scheduledSessions}
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          onEditSession={handleEditSession}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ScheduledSessionManager
          scheduledSessions={scheduledSessions}
          onAdd={addScheduledSession}
          onUpdate={updateScheduledSession}
          onDelete={deleteScheduledSession}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <TrainingSessionStatsSection sessions={sessions} scheduledSessions={scheduledSessions} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <TrainingSessionListSection
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          onEditSession={handleEditSession}
        />
      </TabPanel>
    </Container>
  );
};

export default TrainingSessionPage;
