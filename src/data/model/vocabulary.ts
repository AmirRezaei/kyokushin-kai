// file: src/data/model/vocabulary.ts
import {ISODateTimeString, LocalizedText, TermId} from './common';

/**
 * Controlled vocabulary terms.
 * Use these for Oroshi, Hizo, Ganmen, Komi, Uchi, Uke, etc.
 * Admin can rename labels without breaking references.
 */
export enum TermCategory {
  Tool = 'Tool', // Seiken, Shuto, Uraken, Tettsui, Shotei, Haito, Nukite...
  Action = 'Action', // Uke, Uchi, Tsuki, Geri, Dachi, Kumite...
  Modifier = 'Modifier', // Oroshi, Mawashi, Gyaku, Oi, Mae, Yoko, Ushiro...
  Target = 'Target', // Ganmen, Hizo, Kin, Sakotsu...
  Level = 'Level', // Jodan, Chudan, Gedan
  Side = 'Side', // Hidari, Migi
  FootPart = 'FootPart', // Chusoku, Haisoku, Sokuto, Teisoku, Kakato...
  KataFamily = 'KataFamily', // Taikyoku, Pinan, etc.
  Other = 'Other',
}

export interface TermRecord {
  id: TermId;
  category: TermCategory;

  /**
   * Canonical display labels for each locale.
   * Example: romaji:"Oroshi", en:"Descending", sv:"Nedåtgående"
   */
  label: LocalizedText;

  /**
   * Search/backward compatibility (old spellings, alternative romanization).
   */
  aliases?: LocalizedText[];

  description?: LocalizedText;

  status: 'active' | 'inactive';

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/**
 * Optional structured “name anatomy” for techniques.
 * This is how Oroshi/Hizo/Ganmen/Komi/Uchi/Uke etc become queryable.
 */
export interface TechniqueNameParts {
  toolTermIds?: TermId[]; // TermCategory.Tool
  modifierTermIds?: TermId[]; // TermCategory.Modifier
  targetTermIds?: TermId[]; // TermCategory.Target
  levelTermIds?: TermId[]; // TermCategory.Level
  sideTermIds?: TermId[]; // TermCategory.Side
  actionTermIds?: TermId[]; // TermCategory.Action
  footPartTermIds?: TermId[]; // TermCategory.FootPart
  otherTermIds?: TermId[]; // TermCategory.Other
}