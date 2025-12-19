// tagConfig.ts - Configuration for predefined tags with icons and colors
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WarningIcon from '@mui/icons-material/Warning';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AssignmentIcon from '@mui/icons-material/Assignment';

export interface TagConfig {
  label: string;
  icon: React.ComponentType;
  color: 'success' | 'info' | 'warning' | 'error' | 'primary' | 'secondary' | 'default';
}

export const PREDEFINED_TAGS: Record<string, TagConfig> = {
  Beginner: {
    label: 'Beginner',
    icon: SchoolIcon,
    color: 'success',
  },
  Intermediate: {
    label: 'Intermediate',
    icon: TrendingUpIcon,
    color: 'info',
  },
  Advanced: {
    label: 'Advanced',
    icon: EmojiEventsIcon,
    color: 'warning',
  },
  Important: {
    label: 'Important',
    icon: PriorityHighIcon,
    color: 'error',
  },
  'Practice More': {
    label: 'Practice More',
    icon: FitnessCenterIcon,
    color: 'warning',
  },
  Difficult: {
    label: 'Difficult',
    icon: WarningIcon,
    color: 'error',
  },
  Favorite: {
    label: 'Favorite',
    icon: FavoriteIcon,
    color: 'primary',
  },
  Review: {
    label: 'Review',
    icon: RefreshIcon,
    color: 'info',
  },
  Competition: {
    label: 'Competition',
    icon: EmojiPeopleIcon,
    color: 'secondary',
  },
  'Exam Required': {
    label: 'Exam Required',
    icon: AssignmentIcon,
    color: 'error',
  },
};

export const getTagConfig = (tagLabel: string): TagConfig | null => {
  return PREDEFINED_TAGS[tagLabel] || null;
};
