// file: src/data/model/kata.ts
import {
  ISODateTimeString,
  KataId,
  LocalizedText,
  MediaId,
  PublishStatus,
  SourceId,
  TermId,
} from './common';

export interface KataRecord {
  id: KataId;

  /**
   * Optional training rank (admin-managed).
   */
  rank?: number;

  /**
   * Admin-managed names. Safe to rename at any time.
   */
  name: LocalizedText; // romaji + translations
  aliases?: LocalizedText[]; // old spellings / alternative names

  /**
   * Optional: connect kata to families (Taikyoku/Pinan/etc) via TermCategory.KataFamily
   */
  familyTermIds?: TermId[];

  meaning?: LocalizedText;
  history?: LocalizedText;
  detailedDescription?: LocalizedText;

  tags?: string[];

  difficulty?: number; // your scale
  expectedDurationSec?: number;

  mediaIds?: MediaId[];
  sourceIds?: SourceId[];

  status: PublishStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
