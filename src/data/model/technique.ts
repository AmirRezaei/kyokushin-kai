// file: src/data/model/technique.ts
import {
  ISODateTimeString,
  LocalizedText,
  MediaId,
  PublishStatus,
  SourceId,
  TechniqueId,
  TermId,
} from './common';
import {TechniqueNameParts} from './vocabulary';

export enum TechniqueKind {
  Stand = 'Stand',
  Strike = 'Strike',
  Block = 'Block',
  Kick = 'Kick',
  Breathing = 'Breathing',
  Fighting = 'Fighting',
  Combination = 'Combination',
  Other = 'Other',
}

export interface TechniqueRecord {
  id: TechniqueId;

  kind: TechniqueKind;

  /**
   * Admin-managed names. Safe to rename at any time.
   */
  name: LocalizedText; // romaji + translations
  aliases?: LocalizedText[]; // old spellings, “or” naming, etc.

  /**
   * Structured name anatomy: Oroshi/Hizo/Ganmen/Komi/Uchi/Uke etc via TermIds.
   */
  nameParts?: TechniqueNameParts;

  /**
   * Canonical tags (app-level). User tags live in userOverlay.ts.
   */
  tags?: string[];

  summary?: LocalizedText;
  history?: LocalizedText;
  detailedDescription?: LocalizedText;

  /**
   * Optional extra term references that aren’t strictly “name parts”
   * (concept tags, families, etc).
   */
  relatedTermIds?: TermId[];

  mediaIds?: MediaId[];
  sourceIds?: SourceId[];

  status: PublishStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}