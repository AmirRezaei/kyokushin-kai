export interface Motto {
  id: string;
  text: string;
  shortTitle: string;
  details?: string;
  sortOrder?: number;
  status?: 'draft' | 'published' | 'inactive';
}

export interface MottoAnalysis {
  philosophy: string;
  origin: string;
  dojoApplication: string;
  lifeApplication: string;
  meditation: string; // Guided meditation prompt/mantra
}

export enum ViewState {
  GRID = 'GRID',
  DETAIL = 'DETAIL',
}

export const MOTTO_TITLES_ORDER = [
  'Courtesy',
  'Devotion',
  'Initiative',
  'Detachment',
  'Posture',
  'Patience',
  'Wisdom',
  'Purification',
  'Principle',
  'Experience',
  'Gratitude',
];
