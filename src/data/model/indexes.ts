// file: src/data/model/indexes.ts
import {KarateCatalogStore} from './catalogStore';
import {KataId, TechniqueId, TermId} from './common';
import {TermCategory} from './vocabulary';

/**
 * Optional runtime indexes (pure derived data).
 * Useful for fast “filter by term”, “search tokens”, etc.
 */
export interface KarateCatalogIndexes {
  termsByCategory: Record<TermCategory, TermId[]>;
  techniquesByTerm: Record<TermId, TechniqueId[]>;
  katasByFamilyTerm: Record<TermId, KataId[]>;
}

export function buildKarateCatalogIndexes(store: KarateCatalogStore): KarateCatalogIndexes {
  const termsByCategory: KarateCatalogIndexes['termsByCategory'] = {
    [TermCategory.Tool]: [],
    [TermCategory.Action]: [],
    [TermCategory.Modifier]: [],
    [TermCategory.Target]: [],
    [TermCategory.Level]: [],
    [TermCategory.Side]: [],
    [TermCategory.FootPart]: [],
    [TermCategory.KataFamily]: [],
    [TermCategory.Other]: [],
  };

  for (const term of Object.values(store.terms)) {
    if (term.status !== 'active') continue;
    termsByCategory[term.category].push(term.id);
  }

  const techniquesByTerm: Record<TermId, TechniqueId[]> = {};
  for (const tech of Object.values(store.techniques)) {
    if (tech.status !== 'published') continue;

    const allTerms: TermId[] = [];

    if (tech.nameParts) {
      const p = tech.nameParts;
      allTerms.push(
        ...(p.toolTermIds ?? []),
        ...(p.modifierTermIds ?? []),
        ...(p.targetTermIds ?? []),
        ...(p.levelTermIds ?? []),
        ...(p.sideTermIds ?? []),
        ...(p.actionTermIds ?? []),
        ...(p.footPartTermIds ?? []),
        ...(p.otherTermIds ?? []),
      );
    }

    allTerms.push(...(tech.relatedTermIds ?? []));

    for (const termId of allTerms) {
      if (!techniquesByTerm[termId]) techniquesByTerm[termId] = [];
      techniquesByTerm[termId].push(tech.id);
    }
  }

  const katasByFamilyTerm: Record<TermId, KataId[]> = {};
  for (const kata of Object.values(store.katas)) {
    if (kata.status !== 'published') continue;
    for (const termId of kata.familyTermIds ?? []) {
      if (!katasByFamilyTerm[termId]) katasByFamilyTerm[termId] = [];
      katasByFamilyTerm[termId].push(kata.id);
    }
  }

  return {termsByCategory, techniquesByTerm, katasByFamilyTerm};
}