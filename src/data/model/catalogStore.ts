// file: src/data/model/catalogStore.ts
import {GradeId, GradingSystemId, KataId, MediaId, SourceId, TechniqueId, TermId} from './common';
import {GradeRecord, GradingSystemRecord} from './grade';
import {KataRecord} from './kata';
import {MediaRecord, SourceRecord} from './media';
import {TechniqueRecord} from './technique';
import {TermRecord} from './vocabulary';

/**
 * Canonical/admin-managed store (what your admin UI edits).
 * No curriculum, no teaching model.
 */
export interface KarateCatalogStore {
  terms: Record<TermId, TermRecord>;

  techniques: Record<TechniqueId, TechniqueRecord>;
  katas: Record<KataId, KataRecord>;

  gradingSystems: Record<GradingSystemId, GradingSystemRecord>;
  grades: Record<GradeId, GradeRecord>;

  media: Record<MediaId, MediaRecord>;
  sources: Record<SourceId, SourceRecord>;
}