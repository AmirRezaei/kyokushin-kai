import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';

import {useAuth} from '@/components/context/AuthContext';
import {KarateCatalogStore} from '../../data/model/catalogStore';
import {GradeRecord} from '../../data/model/grade';
import {KataRecord} from '../../data/model/kata';
import {TechniqueRecord} from '../../data/model/technique';

type CurriculumEntry = {techIds: string[]; kataIds: string[]};

export type CatalogResponse = {
  store: KarateCatalogStore;
  curriculum: Record<string, CurriculumEntry>;
};

export type GradeWithContent = GradeRecord & {
  techniques: TechniqueRecord[];
  katas: KataRecord[];
};

const emptyStore: KarateCatalogStore = {
  terms: {},
  techniques: {},
  katas: {},
  gradingSystems: {},
  grades: {},
  media: {},
  sources: {},
};

const normalizeCatalogResponse = (payload: Partial<CatalogResponse> | null | undefined): CatalogResponse => {
  const incomingStore: Partial<KarateCatalogStore> = payload?.store ?? {};
  const store: KarateCatalogStore = {
    ...emptyStore,
    ...incomingStore,
    terms: incomingStore.terms ?? {},
    techniques: incomingStore.techniques ?? {},
    katas: incomingStore.katas ?? {},
    gradingSystems: incomingStore.gradingSystems ?? {},
    grades: incomingStore.grades ?? {},
    media: incomingStore.media ?? {},
    sources: incomingStore.sources ?? {},
  };

  const curriculum: Record<string, CurriculumEntry> = {};
  const rawCurriculum = payload?.curriculum ?? {};
  Object.entries(rawCurriculum).forEach(([gradeId, entry]) => {
    curriculum[gradeId] = {
      techIds: Array.isArray(entry?.techIds) ? entry!.techIds : [],
      kataIds: Array.isArray(entry?.kataIds) ? entry!.kataIds : [],
    };
  });

  return {store, curriculum};
};

const emptyResponse = normalizeCatalogResponse(undefined);

const fetchCatalog = async (token: string | null): Promise<CatalogResponse> => {
  const headers: Record<string, string> = {Accept: 'application/json'};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch('/api/v1/catalog', {headers});
  if (!res.ok) {
    throw new Error(`Unable to load catalog (${res.status})`);
  }

  const payload = (await res.json()) as Partial<CatalogResponse>;
  return normalizeCatalogResponse(payload);
};

export const buildCurriculumGrades = (
  store: KarateCatalogStore,
  curriculum: Record<string, CurriculumEntry>,
): GradeWithContent[] => {
  const grades = Object.values(store.grades).sort((a, b) => a.sortOrder - b.sortOrder);

  return grades.map((grade) => {
    const contentIds = curriculum[grade.id] || {techIds: [], kataIds: []};
    const techniques = contentIds.techIds.map((id) => store.techniques[id]).filter(Boolean);
    const katas = contentIds.kataIds.map((id) => store.katas[id]).filter(Boolean);

    return {
      ...grade,
      techniques,
      katas,
    };
  });
};

export const findGradeForTechnique = (
  grades: GradeWithContent[],
  techId: string,
): GradeWithContent | undefined => {
  return grades.find((grade) => grade.techniques.some((tech) => tech.id === techId));
};

export const findGradeForKata = (
  grades: GradeWithContent[],
  kataId: string,
): GradeWithContent | undefined => {
  return grades.find((grade) => grade.katas.some((kata) => kata.id === kataId));
};

export const useCatalogQuery = () => {
  const {token, user, isLoading: authLoading} = useAuth();
  const userKey = user?.id ?? 'public';
  const roleKey = user?.role ?? 'public';

  return useQuery({
    queryKey: ['catalog', userKey, roleKey],
    queryFn: () => fetchCatalog(token ?? null),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !authLoading,
  });
};

export const useCatalogStore = () => {
  const query = useCatalogQuery();
  const data = query.data ?? emptyResponse;

  return {
    ...query,
    store: data.store,
    curriculum: data.curriculum,
  };
};

export const useCurriculumGrades = () => {
  const {store, curriculum, ...query} = useCatalogStore();
  const grades = useMemo(() => buildCurriculumGrades(store, curriculum), [store, curriculum]);

  return {
    ...query,
    grades,
  };
};

export const useAllTechniques = () => {
  const {store, ...query} = useCatalogStore();
  const techniques = useMemo(() => Object.values(store.techniques), [store.techniques]);

  return {
    ...query,
    techniques,
  };
};

export const useCatalogMedia = () => {
  const {store, ...query} = useCatalogStore();

  return {
    ...query,
    mediaById: store.media,
  };
};
