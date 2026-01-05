import React from 'react';
import { ScheduledSession, TrainingSession } from '../../types/trainingSessionTypes';
import ContributionCalendar from '../UI/ContributionCalendar';
import TrainingStatistics from './TrainingStatistics';
import TrainingTypeBreakdownChart from './TrainingTypeBreakdownChart';

interface TrainingSessionStatsSectionProps {
  sessions: TrainingSession[];
  scheduledSessions?: ScheduledSession[];
}

/**
 * Section component grouping statistics and charts
 * Displays analytics about training sessions
 */
const TrainingSessionStatsSection: React.FC<TrainingSessionStatsSectionProps> = ({
  sessions,
  scheduledSessions = [],
}) => {
  // Transform sessions to contribution calendar format
  const contributions = sessions.map((session) => ({
    date: session.date,
    count: 1, // Each session counts as 1 contribution
  }));

  return (
    <>
      <ContributionCalendar contributions={contributions} scheduledSessions={scheduledSessions} />
      <TrainingStatistics sessions={sessions} />
      <TrainingTypeBreakdownChart sessions={sessions} />
    </>
  );
};

export default TrainingSessionStatsSection;
