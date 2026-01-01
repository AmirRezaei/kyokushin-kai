// import { convertLegacyData } from './legacy_converter';
import { GradeRecord } from '../model/grade';
import { TechniqueRecord } from '../model/technique';
import { KataRecord } from '../model/kata';
import { KarateCatalogStore } from '../model/catalogStore';

// Re-export types for consumers
export type { GradeRecord, TechniqueRecord, KataRecord };

type CatalogPayload = {
  store?: Partial<KarateCatalogStore>;
  curriculum?: Record<string, { techIds?: string[]; kataIds?: string[] }>;
};

const createEmptyStore = (): KarateCatalogStore => ({
  terms: {},
  techniques: {},
  katas: {},
  gradingSystems: {},
  grades: {},
  media: {},
  sources: {},
});

// Singleton instance (API-backed data)
let _store: KarateCatalogStore = createEmptyStore();
let _curriculum: Record<string, { techIds: string[]; kataIds: string[] }> = {};
let _loaded = false;

const ensureData = () => {
  return { store: _store, curriculum: _curriculum };
};

export interface GradeWithContent extends GradeRecord {
  techniques: TechniqueRecord[];
  katas: KataRecord[];
}

export const KyokushinRepository = {
  loadCatalog: async (): Promise<void> => {
    const res = await fetch('/api/v1/catalog', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load catalog (${res.status})`);
    }

    const payload = (await res.json()) as CatalogPayload;
    const incomingStore = payload.store ?? {};
    _store = {
      ...createEmptyStore(),
      ...incomingStore,
      techniques: incomingStore.techniques ?? {},
      katas: incomingStore.katas ?? {},
      grades: incomingStore.grades ?? {},
      gradingSystems: incomingStore.gradingSystems ?? {},
      terms: incomingStore.terms ?? {},
      media: incomingStore.media ?? {},
      sources: incomingStore.sources ?? {},
    };

    _curriculum = Object.fromEntries(
      Object.entries(payload.curriculum ?? {}).map(([gradeId, entry]) => [
        gradeId,
        {
          techIds: Array.isArray(entry?.techIds) ? entry!.techIds : [],
          kataIds: Array.isArray(entry?.kataIds) ? entry!.kataIds : [],
        },
      ]),
    );

    _loaded = true;
  },
  isLoaded: (): boolean => _loaded,
  getCurriculumGrades: (): GradeWithContent[] => {
    const { store, curriculum } = ensureData();

    const grades = Object.values(store.grades).sort((a, b) => a.sortOrder - b.sortOrder);

    return grades.map((grade) => {
      const contentIds = curriculum[grade.id] || { techIds: [], kataIds: [] };

      const techniques = contentIds.techIds.map((id) => store.techniques[id]).filter(Boolean); // safety check

      const katas = contentIds.kataIds.map((id) => store.katas[id]).filter(Boolean);

      return {
        ...grade,
        techniques,
        katas,
      };
    });
  },

  getAllTechniques: (): TechniqueRecord[] => {
    const { store } = ensureData();
    return Object.values(store.techniques);
  },

  getGradeForTechnique: (techId: string): GradeWithContent | undefined => {
    const { store, curriculum } = ensureData();
    // Find grade ID containing the technique
    const gradeId = Object.keys(curriculum).find((gid) => curriculum[gid].techIds.includes(techId));
    if (!gradeId) return undefined;

    const grade = store.grades[gradeId];
    const contentIds = curriculum[gradeId] || { techIds: [], kataIds: [] };

    return {
      ...grade,
      techniques: contentIds.techIds.map((id) => store.techniques[id]).filter(Boolean),
      katas: contentIds.kataIds.map((id) => store.katas[id]).filter(Boolean),
    };
  },

  getGradeForKata: (kataId: string): GradeWithContent | undefined => {
    const { store, curriculum } = ensureData();
    const gradeId = Object.keys(curriculum).find((gid) => curriculum[gid].kataIds.includes(kataId));
    if (!gradeId) return undefined;

    const grade = store.grades[gradeId];
    const contentIds = curriculum[gradeId] || { techIds: [], kataIds: [] };

    return {
      ...grade,
      techniques: contentIds.techIds.map((id) => store.techniques[id]).filter(Boolean),
      katas: contentIds.kataIds.map((id) => store.katas[id]).filter(Boolean),
    };
  },

  getMedia: (mediaId: string): any | undefined => {
    const { store } = ensureData();
    return store.media[mediaId];
  },
};
