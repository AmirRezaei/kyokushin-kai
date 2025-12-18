// file: src/data/model/userOverlay.ts
import {
  GradeId,
  ISODateTimeString,
  KataId,
  MediaId,
  TechniqueId,
  UserId,
  UserMediaId,
  UserNoteId,
} from './common';

export interface UserRatings {
  favorite?: number; // 0..5
  difficulty?: number; // 0..5
  focusPriority?: number; // 0..5
}

export interface UserProgress {
  practiceCount?: number;
  lastPracticedAt?: ISODateTimeString;
  confidence?: number; // 0..100 self-assessed
}

/* =========================
   Grade user data (no curriculum)
   ========================= */

export interface UserGradeHistoryEntry {
  id: string;
  gradeId?: GradeId; // optional: user can log external/unknown grade
  gradeLabel?: string; // free text fallback
  achievedAt: ISODateTimeString;
  notes?: string;
}

export interface UserGradeProfile {
  currentGradeId?: GradeId;
  activeGradingSystemId?: string;

  startedTrainingAt?: ISODateTimeString;

  history?: UserGradeHistoryEntry[];

  updatedAt: ISODateTimeString;
}

/* =========================
   Technique user data
   ========================= */

export interface UserTechniqueNote {
  id: UserNoteId;
  userId: UserId;

  techniqueId: TechniqueId;

  title?: string;
  content: string;
  tags?: string[];
  pinned?: boolean;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type UserTechniqueMediaKind = 'youtube' | 'image' | 'video' | 'audio' | 'link';

export interface UserTechniqueMedia {
  id: UserMediaId;
  userId: UserId;

  techniqueId: TechniqueId;

  kind: UserTechniqueMediaKind;
  uri: string;

  title?: string;
  description?: string;
  posterUri?: string;
  tags?: string[];

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface UserTechniqueProfile {
  techniqueId: TechniqueId;

  personalTags?: string[];
  ratings?: UserRatings;
  progress?: UserProgress;

  noteIds?: UserNoteId[];
  userMediaIds?: UserMediaId[];

  bookmarkedMediaIds?: MediaId[];

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/* =========================
   Kata user data
   ========================= */

export interface UserKataNote {
  id: UserNoteId;
  userId: UserId;

  kataId: KataId;

  title?: string;
  content: string;
  tags?: string[];
  pinned?: boolean;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type UserKataMediaKind = 'youtube' | 'image' | 'video' | 'audio' | 'link';

export interface UserKataMedia {
  id: UserMediaId;
  userId: UserId;

  kataId: KataId;

  kind: UserKataMediaKind;
  uri: string;

  title?: string;
  description?: string;
  posterUri?: string;
  tags?: string[];

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface UserKataProfile {
  kataId: KataId;

  personalTags?: string[];
  ratings?: UserRatings;
  progress?: UserProgress;

  noteIds?: UserNoteId[];
  userMediaIds?: UserMediaId[];

  bookmarkedMediaIds?: MediaId[];

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/* =========================
   User root (no mixing)
   ========================= */

export interface UserKarateDataStore {
  userId: UserId;

  grade?: UserGradeProfile;

  techniqueProfiles: Record<string, UserTechniqueProfile>;
  kataProfiles: Record<string, UserKataProfile>;

  techniqueNotes: Record<string, UserTechniqueNote>;
  kataNotes: Record<string, UserKataNote>;

  techniqueMedia: Record<string, UserTechniqueMedia>;
  kataMedia: Record<string, UserKataMedia>;
}