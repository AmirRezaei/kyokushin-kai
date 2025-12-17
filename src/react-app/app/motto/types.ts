export interface Motto {
  id: number;
  text: string;
  shortTitle: string; // For card display
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
  DETAIL = 'DETAIL'
}