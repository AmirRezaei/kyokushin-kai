// file: src/data/model/grade.ts
import {GradeId, GradingSystemId, ISODateTimeString, LocalizedText, PublishStatus} from './common';

export enum GradeKind {
  Mukyu = 'Mukyu',
  Kyu = 'Kyu',
  Dan = 'Dan',
}

export enum BeltColor {
  White = 'white',
  Orange = 'orange',
  Blue = 'blue',
  Yellow = 'yellow',
  Green = 'green',
  Brown = 'brown',
  Black = 'black',
}

export interface GradingSystemRecord {
  id: GradingSystemId;

  /**
   * Support multiple systems (dojo/org variants) without coupling to techniques/katas.
   */
  name: LocalizedText; // e.g. "Kyokushin Uppsala", "IKO1", etc.
  description?: LocalizedText;

  status: PublishStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface GradeRecord {
  id: GradeId;

  gradingSystemId: GradingSystemId;

  kind: GradeKind;

  /**
   * Numeric value for the grade within its kind.
   * - Mukyu: number = 0
   * - Kyu: number = 10..1 (your choice)
   * - Dan: number = 1..n
   */
  number: number;

  /**
   * Rank index used for progression ordering.
   * - 10th Kyu = 1 ... 1st Kyu = 10
   * - 1st Dan = 11 ... 10th Dan = 20
   */
  rank?: number;

  /**
   * Admin-managed names, safe to rename anytime.
   */
  name: LocalizedText;
  aliases?: LocalizedText[];

  beltColor: BeltColor;

  /**
   * Used for ordering in UI. You decide the convention:
   * e.g. Mukyu=0, 10kyu=10 ... 1kyu=1, 1dan=100, 2dan=101...
   */
  sortOrder: number;

  notes?: LocalizedText;

  status: PublishStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
