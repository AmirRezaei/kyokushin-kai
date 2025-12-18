// file: src/data/model/media.ts
import {ISODateTimeString, LocalizedText, MediaId, SourceId} from './common';

export type MediaKind = 'youtube' | 'image' | 'video' | 'audio' | 'link';

export interface MediaRecord {
  id: MediaId;

  kind: MediaKind;
  uri: string; // full URL or local path key
  posterUri?: string;

  title?: LocalizedText;
  description?: LocalizedText;

  credits?: string; // attribution
  license?: string;

  /**
   * Optional: track where the media comes from (PDF/site/book).
   */
  sourceIds?: SourceId[];

  status: 'active' | 'inactive';

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface SourceRecord {
  id: SourceId;
  label: string; // e.g. "Kyokushin Uppsala PDF"
  uri?: string;
  notes?: string;

  status: 'active' | 'inactive';

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}