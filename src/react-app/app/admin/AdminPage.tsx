import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';
import { useQueryClient } from '@tanstack/react-query';
import { TechniqueKind, TechniqueRecord } from '../../../data/model/technique';
import { PublishStatus } from '../../../data/model/common';
import { BeltColor, GradeKind, GradeRecord } from '../../../data/model/grade';
import { KataRecord } from '../../../data/model/kata';
import QuoteManagementTab from './QuoteManagementTab';

type AdminGrade = GradeRecord & {
  techniqueIds: string[];
  kataIds: string[];
};

type SortDirection = 'asc' | 'desc';
type TechniqueSortKey = 'name' | 'kind' | 'rank' | 'status' | 'grade';
type GradeSortKey =
  | 'name'
  | 'kind'
  | 'rank'
  | 'beltColor'
  | 'sortOrder'
  | 'status'
  | 'techniques'
  | 'katas';
type KataSortKey = 'name' | 'rank' | 'status' | 'grade';

type TechniqueFormState = {
  nameRomaji: string;
  nameEn: string;
  nameSv: string;
  kind: TechniqueKind;
  rank: number;
  status: PublishStatus;
  gradeId: string;
};

type GradeFormState = {
  nameRomaji: string;
  nameEn: string;
  kind: GradeKind;
  gradingSystemId: string;
  rank: number;
  beltColor: BeltColor;
  sortOrder: number;
  status: PublishStatus;
  techniqueIds: string[];
  kataIds: string[];
};

type KataFormState = {
  nameRomaji: string;
  nameEn: string;
  nameSv: string;
  rank: number;
  status: PublishStatus;
  gradeId: string;
};

const defaultFormState: TechniqueFormState = {
  nameRomaji: '',
  nameEn: '',
  nameSv: '',
  kind: TechniqueKind.Stand,
  rank: 0,
  status: 'draft',
  gradeId: '',
};

const defaultGradeFormState: GradeFormState = {
  nameRomaji: '',
  nameEn: '',
  kind: GradeKind.Kyu,
  gradingSystemId: 'sys_kyokushin_main',
  rank: 1,
  beltColor: BeltColor.White,
  sortOrder: 0,
  status: 'draft',
  techniqueIds: [],
  kataIds: [],
};

const defaultKataFormState: KataFormState = {
  nameRomaji: '',
  nameEn: '',
  nameSv: '',
  rank: 0,
  status: 'draft',
  gradeId: '',
};

const AdminPage: React.FC = () => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const invalidateCatalog = React.useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['catalog'] });
  }, [queryClient]);
  const [techniques, setTechniques] = useState<TechniqueRecord[]>([]);
  const [grades, setGrades] = useState<AdminGrade[]>([]);
  const [katas, setKatas] = useState<KataRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<TechniqueFormState>(defaultFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTechniques, setIsLoadingTechniques] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingKatas, setIsLoadingKatas] = useState(false);
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | TechniqueKind>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [gradeEditingId, setGradeEditingId] = useState<string | null>(null);
  const [gradeFormState, setGradeFormState] = useState<GradeFormState>(defaultGradeFormState);
  const [showGradeCreateRow, setShowGradeCreateRow] = useState(false);
  const [gradeSearch, setGradeSearch] = useState('');
  const [gradeStatusFilter, setGradeStatusFilter] = useState<'all' | PublishStatus>('all');
  const [gradeSortKey, setGradeSortKey] = useState<GradeSortKey>('sortOrder');
  const [gradeSortDirection, setGradeSortDirection] = useState<SortDirection>('asc');
  const [kataEditingId, setKataEditingId] = useState<string | null>(null);
  const [kataFormState, setKataFormState] = useState<KataFormState>(defaultKataFormState);
  const [showKataCreateRow, setShowKataCreateRow] = useState(false);
  const [kataSearch, setKataSearch] = useState('');
  const [kataStatusFilter, setKataStatusFilter] = useState<'all' | PublishStatus>('all');
  const [kataSortKey, setKataSortKey] = useState<KataSortKey>('name');
  const [kataSortDirection, setKataSortDirection] = useState<SortDirection>('asc');
  const [techniqueSortKey, setTechniqueSortKey] = useState<TechniqueSortKey>('name');
  const [techniqueSortDirection, setTechniqueSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState(0);

  const sortedTechniques = useMemo(() => {
    return [...techniques].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
      const nameA = a.name.romaji || a.name.en || '';
      const nameB = b.name.romaji || b.name.en || '';
      return nameA.localeCompare(nameB);
    });
  }, [techniques]);

  const gradeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const grade of grades) {
      map.set(grade.id, grade.name.romaji || grade.name.en || grade.id);
    }
    return map;
  }, [grades]);

  const gradeRankById = useMemo(() => {
    const map = new Map<string, number>();
    for (const grade of grades) {
      const rankValue =
        typeof grade.rank === 'number' && Number.isFinite(grade.rank)
          ? grade.rank
          : deriveGradeRank(grade.kind as GradeKind, grade.number);
      if (rankValue > 0) {
        map.set(grade.id, rankValue);
      }
    }
    return map;
  }, [grades]);

  const techniqueGradeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const grade of grades) {
      for (const techniqueId of grade.techniqueIds || []) {
        if (!map.has(techniqueId)) {
          map.set(techniqueId, grade.id);
        }
      }
    }
    return map;
  }, [grades]);

  const kataGradeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const grade of grades) {
      for (const kataId of grade.kataIds || []) {
        if (!map.has(kataId)) {
          map.set(kataId, grade.id);
        }
      }
    }
    return map;
  }, [grades]);

  const getTechniqueRank = useCallback(
    (technique: TechniqueRecord) => {
      if (Number.isFinite(technique.rank) && (technique.rank || 0) > 0) {
        return technique.rank as number;
      }
      const gradeId = techniqueGradeMap.get(technique.id) || '';
      return gradeRankById.get(gradeId) || 0;
    },
    [gradeRankById, techniqueGradeMap],
  );

  const getKataRank = useCallback(
    (kata: KataRecord) => {
      if (Number.isFinite(kata.rank) && (kata.rank || 0) > 0) {
        return kata.rank as number;
      }
      const gradeId = kataGradeMap.get(kata.id) || '';
      return gradeRankById.get(gradeId) || 0;
    },
    [gradeRankById, kataGradeMap],
  );

  const filteredTechniques = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedTechniques.filter((technique) => {
      const matchesKind = kindFilter === 'all' || technique.kind === kindFilter;
      const matchesStatus = statusFilter === 'all' || technique.status === statusFilter;
      if (!matchesKind || !matchesStatus) return false;
      if (!query) return true;
      const name = [technique.name.romaji, technique.name.en, technique.name.sv, technique.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return name.includes(query);
    });
  }, [kindFilter, search, sortedTechniques, statusFilter]);

  const orderedTechniques = useMemo(() => {
    const statusOrder: Record<PublishStatus, number> = {
      published: 0,
      draft: 1,
      inactive: 2,
    };
    const compareStrings = (a: string, b: string) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

    const getName = (technique: TechniqueRecord) =>
      technique.name.romaji || technique.name.en || technique.id;

    return [...filteredTechniques].sort((a, b) => {
      let result = 0;
      switch (techniqueSortKey) {
        case 'name':
          result = compareStrings(getName(a), getName(b));
          break;
        case 'kind':
          result = compareStrings(a.kind, b.kind);
          break;
        case 'rank': {
          const rankA = getTechniqueRank(a) || Number.POSITIVE_INFINITY;
          const rankB = getTechniqueRank(b) || Number.POSITIVE_INFINITY;
          result = rankA - rankB;
          break;
        }
        case 'status':
          result = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'grade': {
          const gradeA = gradeNameById.get(techniqueGradeMap.get(a.id) || '') || '';
          const gradeB = gradeNameById.get(techniqueGradeMap.get(b.id) || '') || '';
          result = compareStrings(gradeA, gradeB);
          break;
        }
      }
      if (result === 0) {
        result = compareStrings(a.id, b.id);
      }
      return techniqueSortDirection === 'asc' ? result : -result;
    });
  }, [
    filteredTechniques,
    getTechniqueRank,
    gradeNameById,
    techniqueGradeMap,
    techniqueSortDirection,
    techniqueSortKey,
  ]);

  const sortedGrades = useMemo(() => {
    return [...grades].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [grades]);

  const filteredGrades = useMemo(() => {
    const query = gradeSearch.trim().toLowerCase();
    return sortedGrades.filter((grade) => {
      const matchesStatus = gradeStatusFilter === 'all' || grade.status === gradeStatusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const name = [grade.name.romaji, grade.name.en, grade.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return name.includes(query);
    });
  }, [gradeSearch, gradeStatusFilter, sortedGrades]);

  const orderedGrades = useMemo(() => {
    const statusOrder: Record<PublishStatus, number> = {
      published: 0,
      draft: 1,
      inactive: 2,
    };
    const compareStrings = (a: string, b: string) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    const getName = (grade: AdminGrade) => grade.name.romaji || grade.name.en || grade.id;

    return [...filteredGrades].sort((a, b) => {
      let result = 0;
      switch (gradeSortKey) {
        case 'name':
          result = compareStrings(getName(a), getName(b));
          break;
        case 'kind':
          result = compareStrings(a.kind, b.kind);
          break;
        case 'rank': {
          const rankA = getKataRank(a) || Number.POSITIVE_INFINITY;
          const rankB = getKataRank(b) || Number.POSITIVE_INFINITY;
          result = rankA - rankB;
          break;
        }
        case 'beltColor':
          result = compareStrings(a.beltColor, b.beltColor);
          break;
        case 'sortOrder':
          result = a.sortOrder - b.sortOrder;
          break;
        case 'status':
          result = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'techniques':
          result = (a.techniqueIds?.length || 0) - (b.techniqueIds?.length || 0);
          break;
        case 'katas':
          result = (a.kataIds?.length || 0) - (b.kataIds?.length || 0);
          break;
      }
      if (result === 0) {
        result = compareStrings(a.id, b.id);
      }
      return gradeSortDirection === 'asc' ? result : -result;
    });
  }, [filteredGrades, getKataRank, gradeSortDirection, gradeSortKey]);

  const sortedKatas = useMemo(() => {
    return [...katas].sort((a, b) => {
      const nameA = a.name.romaji || a.name.en || '';
      const nameB = b.name.romaji || b.name.en || '';
      return nameA.localeCompare(nameB);
    });
  }, [katas]);

  const filteredKatas = useMemo(() => {
    const query = kataSearch.trim().toLowerCase();
    return sortedKatas.filter((kata) => {
      const matchesStatus = kataStatusFilter === 'all' || kata.status === kataStatusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const name = [kata.name.romaji, kata.name.en, kata.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return name.includes(query);
    });
  }, [kataSearch, kataStatusFilter, sortedKatas]);

  const orderedKatas = useMemo(() => {
    const statusOrder: Record<PublishStatus, number> = {
      published: 0,
      draft: 1,
      inactive: 2,
    };
    const compareStrings = (a: string, b: string) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    const getName = (kata: KataRecord) => kata.name.romaji || kata.name.en || kata.id;

    return [...filteredKatas].sort((a, b) => {
      let result = 0;
      switch (kataSortKey) {
        case 'name':
          result = compareStrings(getName(a), getName(b));
          break;
        case 'rank': {
          const rankA = getKataRank(a) || Number.POSITIVE_INFINITY;
          const rankB = getKataRank(b) || Number.POSITIVE_INFINITY;
          result = rankA - rankB;
          break;
        }
        case 'status':
          result = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'grade': {
          const gradeA = gradeNameById.get(kataGradeMap.get(a.id) || '') || '';
          const gradeB = gradeNameById.get(kataGradeMap.get(b.id) || '') || '';
          result = compareStrings(gradeA, gradeB);
          break;
        }
      }
      if (result === 0) {
        result = compareStrings(a.id, b.id);
      }
      return kataSortDirection === 'asc' ? result : -result;
    });
  }, [filteredKatas, getKataRank, gradeNameById, kataGradeMap, kataSortDirection, kataSortKey]);

  const loadTechniques = useCallback(async () => {
    if (!token) return;
    setIsLoadingTechniques(true);
    try {
      const res = await fetch('/api/v1/techniques', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Unable to load techniques');
      }
      const data = (await res.json()) as { techniques: TechniqueRecord[] };
      setTechniques(data.techniques || []);
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to load techniques', 'error');
    } finally {
      setIsLoadingTechniques(false);
    }
  }, [token, showSnackbar]);

  const loadGrades = useCallback(async () => {
    if (!token) return;
    setIsLoadingGrades(true);
    try {
      const res = await fetch('/api/v1/grades', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Unable to load grades');
      }
      const data = (await res.json()) as { grades: AdminGrade[] };
      setGrades(data.grades || []);
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to load grades', 'error');
    } finally {
      setIsLoadingGrades(false);
    }
  }, [token, showSnackbar]);

  const loadKatas = useCallback(async () => {
    if (!token) return;
    setIsLoadingKatas(true);
    try {
      const res = await fetch('/api/v1/katas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Unable to load katas');
      }
      const data = (await res.json()) as { katas: KataRecord[] };
      setKatas(data.katas || []);
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to load katas', 'error');
    } finally {
      setIsLoadingKatas(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    void loadTechniques();
    void loadGrades();
    void loadKatas();
  }, [loadTechniques, loadGrades, loadKatas]);

  const resetForm = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setShowCreateRow(false);
  };

  const handleEditTechnique = (technique: TechniqueRecord) => {
    setShowCreateRow(false);
    setEditingId(technique.id);
    const gradeId = techniqueGradeMap.get(technique.id) || '';
    setFormState({
      nameRomaji: technique.name.romaji || '',
      nameEn: technique.name.en || '',
      nameSv: technique.name.sv || '',
      kind: technique.kind as TechniqueKind,
      rank: getTechniqueRank(technique),
      status: technique.status,
      gradeId,
    });
  };

  const handleSaveTechnique = async () => {
    if (!token) return;

    const hasName = Boolean(formState.nameRomaji || formState.nameEn || formState.nameSv);
    if (!hasName) {
      showSnackbar('Provide at least one name translation', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const gradeRank = gradeRankById.get(formState.gradeId) || 0;
      const rankValue =
        Number.isFinite(formState.rank) && formState.rank > 0 ? formState.rank : gradeRank;
      const payload = {
        kind: formState.kind,
        status: formState.status,
        name: {
          ...(formState.nameRomaji ? { romaji: formState.nameRomaji } : {}),
          ...(formState.nameEn ? { en: formState.nameEn } : {}),
          ...(formState.nameSv ? { sv: formState.nameSv } : {}),
        },
        ...(rankValue > 0 ? { rank: rankValue } : {}),
        gradeId: formState.gradeId || undefined,
      };

      const res = await fetch(
        editingId ? `/api/v1/techniques/${editingId}` : '/api/v1/techniques',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error('Save failed');
      }

      showSnackbar(editingId ? 'Technique updated' : 'Technique created', 'success');
      resetForm();
      await loadTechniques();
      await loadGrades();
      await invalidateCatalog();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to save technique', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTechnique = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/techniques/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      showSnackbar('Technique deleted', 'success');
      if (editingId === id) {
        resetForm();
      }
      await loadTechniques();
      await loadGrades();
      await invalidateCatalog();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to delete technique', 'error');
    }
  };

  const resetGradeForm = () => {
    setGradeEditingId(null);
    setGradeFormState(defaultGradeFormState);
    setShowGradeCreateRow(false);
  };

  const handleShowGradeCreateRow = () => {
    setGradeEditingId(null);
    setGradeFormState(defaultGradeFormState);
    setShowGradeCreateRow(true);
  };

  const handleEditGrade = (grade: AdminGrade) => {
    setShowGradeCreateRow(false);
    setGradeEditingId(grade.id);
    const gradeRank =
      typeof grade.rank === 'number' && Number.isFinite(grade.rank)
        ? grade.rank
        : deriveGradeRank(grade.kind as GradeKind, grade.number);
    setGradeFormState({
      nameRomaji: grade.name.romaji || '',
      nameEn: grade.name.en || '',
      kind: grade.kind as GradeKind,
      gradingSystemId: grade.gradingSystemId,
      rank: gradeRank,
      beltColor: grade.beltColor as BeltColor,
      sortOrder: grade.sortOrder,
      status: grade.status,
      techniqueIds: grade.techniqueIds || [],
      kataIds: grade.kataIds || [],
    });
  };

  const handleSaveGrade = async () => {
    if (!token) return;
    const hasName = Boolean(gradeFormState.nameRomaji || gradeFormState.nameEn);
    if (!hasName) {
      showSnackbar('Provide at least one grade name', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const normalizedRank = normalizeGradeRank(gradeFormState.kind, gradeFormState.rank);
      const derivedNumber = deriveGradeNumber(gradeFormState.kind, normalizedRank);
      const payload = {
        gradingSystemId: gradeFormState.gradingSystemId,
        kind: gradeFormState.kind,
        number: derivedNumber,
        rank: normalizedRank,
        beltColor: gradeFormState.beltColor,
        sortOrder: gradeFormState.sortOrder,
        status: gradeFormState.status,
        name: {
          ...(gradeFormState.nameRomaji ? { romaji: gradeFormState.nameRomaji } : {}),
          ...(gradeFormState.nameEn ? { en: gradeFormState.nameEn } : {}),
        },
        techniqueIds: gradeFormState.techniqueIds,
        kataIds: gradeFormState.kataIds,
      };

      const res = await fetch(
        gradeEditingId ? `/api/v1/grades/${gradeEditingId}` : '/api/v1/grades',
        {
          method: gradeEditingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error('Save failed');
      }

      showSnackbar(gradeEditingId ? 'Grade updated' : 'Grade created', 'success');
      resetGradeForm();
      await loadGrades();
      await invalidateCatalog();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to save grade', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/grades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      showSnackbar('Grade deleted', 'success');
      if (gradeEditingId === id) {
        resetGradeForm();
      }
      await loadGrades();
      await invalidateCatalog();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to delete grade', 'error');
    }
  };

  const resetKataForm = () => {
    setKataEditingId(null);
    setKataFormState(defaultKataFormState);
    setShowKataCreateRow(false);
  };

  const handleShowKataCreateRow = () => {
    setKataEditingId(null);
    setKataFormState(defaultKataFormState);
    setShowKataCreateRow(true);
  };

  const handleEditKata = (kata: KataRecord) => {
    setShowKataCreateRow(false);
    setKataEditingId(kata.id);
    const gradeId = kataGradeMap.get(kata.id) || '';
    setKataFormState({
      nameRomaji: kata.name.romaji || '',
      nameEn: kata.name.en || '',
      nameSv: kata.name.sv || '',
      rank: getKataRank(kata),
      status: kata.status,
      gradeId,
    });
  };

  const handleSaveKata = async () => {
    if (!token) return;
    const hasName = Boolean(
      kataFormState.nameRomaji || kataFormState.nameEn || kataFormState.nameSv,
    );
    if (!hasName) {
      showSnackbar('Provide at least one kata name', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const gradeRank = gradeRankById.get(kataFormState.gradeId) || 0;
      const rankValue =
        Number.isFinite(kataFormState.rank) && kataFormState.rank > 0
          ? kataFormState.rank
          : gradeRank;
      const payload = {
        status: kataFormState.status,
        name: {
          ...(kataFormState.nameRomaji ? { romaji: kataFormState.nameRomaji } : {}),
          ...(kataFormState.nameEn ? { en: kataFormState.nameEn } : {}),
          ...(kataFormState.nameSv ? { sv: kataFormState.nameSv } : {}),
        },
        ...(rankValue > 0 ? { rank: rankValue } : {}),
        gradeId: kataFormState.gradeId || undefined,
      };

      const res = await fetch(kataEditingId ? `/api/v1/katas/${kataEditingId}` : '/api/v1/katas', {
        method: kataEditingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }

      showSnackbar(kataEditingId ? 'Kata updated' : 'Kata created', 'success');
      resetKataForm();
      await loadKatas();
      await loadGrades();
      await invalidateCatalog();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to save kata', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKata = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/katas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      showSnackbar('Kata deleted', 'success');
      if (kataEditingId === id) {
        resetKataForm();
      }
      await loadKatas();
      await loadGrades();
      await invalidateCatalog();
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to delete kata', 'error');
    }
  };

  const handleTechniqueSort = (key: TechniqueSortKey) => {
    if (techniqueSortKey === key) {
      setTechniqueSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTechniqueSortKey(key);
      setTechniqueSortDirection('asc');
    }
  };

  const handleGradeSort = (key: GradeSortKey) => {
    if (gradeSortKey === key) {
      setGradeSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setGradeSortKey(key);
      setGradeSortDirection('asc');
    }
  };

  const handleKataSort = (key: KataSortKey) => {
    if (kataSortKey === key) {
      setKataSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setKataSortKey(key);
      setKataSortDirection('asc');
    }
  };

  const handleShowCreateRow = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setShowCreateRow(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabProps = (index: number) => ({
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Admin Console
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage techniques, grades, and katas.
          </Typography>
        </Box>

        <Paper elevation={1} sx={{ overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab label="Techniques" {...tabProps(0)} />
            <Tab label="Grades" {...tabProps(1)} />
            <Tab label="Katas" {...tabProps(2)} />
            <Tab label="Quotes" {...tabProps(3)} />
          </Tabs>
        </Paper>

        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id="admin-tabpanel-0"
          aria-labelledby="admin-tab-0"
          sx={{ display: activeTab === 0 ? 'block' : 'none' }}
        >
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={600}>
                Technique Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use Add Technique to create new entries, or edit existing techniques inline.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <Chip label={`${techniques.length} total`} />
                <Chip
                  label={`${techniques.filter((technique) => technique.status === 'published').length} published`}
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Technique Library
                    </Typography>
                    <Chip label={`${filteredTechniques.length} shown`} size="small" />
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={handleShowCreateRow}
                    disabled={Boolean(editingId)}
                  >
                    Add Technique
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    size="small"
                    fullWidth
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel id="technique-filter-kind">Kind</InputLabel>
                    <Select
                      labelId="technique-filter-kind"
                      label="Kind"
                      value={kindFilter}
                      onChange={(event) =>
                        setKindFilter(event.target.value as 'all' | TechniqueKind)
                      }
                    >
                      <MenuItem value="all">All</MenuItem>
                      {Object.values(TechniqueKind).map((kind) => (
                        <MenuItem key={kind} value={kind}>
                          {kind}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="technique-filter-status">Status</InputLabel>
                    <Select
                      labelId="technique-filter-status"
                      label="Status"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as 'all' | PublishStatus)
                      }
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              <Divider />

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sortDirection={techniqueSortKey === 'name' ? techniqueSortDirection : false}
                      >
                        <TableSortLabel
                          active={techniqueSortKey === 'name'}
                          direction={techniqueSortKey === 'name' ? techniqueSortDirection : 'asc'}
                          onClick={() => handleTechniqueSort('name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={techniqueSortKey === 'kind' ? techniqueSortDirection : false}
                      >
                        <TableSortLabel
                          active={techniqueSortKey === 'kind'}
                          direction={techniqueSortKey === 'kind' ? techniqueSortDirection : 'asc'}
                          onClick={() => handleTechniqueSort('kind')}
                        >
                          Kind
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={techniqueSortKey === 'rank' ? techniqueSortDirection : false}
                      >
                        <TableSortLabel
                          active={techniqueSortKey === 'rank'}
                          direction={techniqueSortKey === 'rank' ? techniqueSortDirection : 'asc'}
                          onClick={() => handleTechniqueSort('rank')}
                        >
                          Rank
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={
                          techniqueSortKey === 'status' ? techniqueSortDirection : false
                        }
                      >
                        <TableSortLabel
                          active={techniqueSortKey === 'status'}
                          direction={techniqueSortKey === 'status' ? techniqueSortDirection : 'asc'}
                          onClick={() => handleTechniqueSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={
                          techniqueSortKey === 'grade' ? techniqueSortDirection : false
                        }
                      >
                        <TableSortLabel
                          active={techniqueSortKey === 'grade'}
                          direction={techniqueSortKey === 'grade' ? techniqueSortDirection : 'asc'}
                          onClick={() => handleTechniqueSort('grade')}
                        >
                          Grade
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showCreateRow && !editingId && (
                      <TableRow
                        sx={(theme) => ({
                          backgroundColor: theme.palette.action.hover,
                        })}
                      >
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              Create new technique
                            </Typography>
                            <TextField
                              label="Romaji"
                              value={formState.nameRomaji}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  nameRomaji: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                            <TextField
                              label="English"
                              value={formState.nameEn}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  nameEn: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                            <TextField
                              label="Swedish"
                              value={formState.nameSv}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  nameSv: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="technique-kind-label">Kind</InputLabel>
                            <Select
                              labelId="technique-kind-label"
                              label="Kind"
                              value={formState.kind}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  kind: event.target.value as TechniqueKind,
                                }))
                              }
                            >
                              {Object.values(TechniqueKind).map((kind) => (
                                <MenuItem key={kind} value={kind}>
                                  {kind}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <TextField
                            type="number"
                            label="Rank"
                            value={formState.rank}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                rank: Number(event.target.value),
                              }))
                            }
                            inputProps={{ min: 0 }}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="technique-status-label">Status</InputLabel>
                            <Select
                              labelId="technique-status-label"
                              label="Status"
                              value={formState.status}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  status: event.target.value as PublishStatus,
                                }))
                              }
                            >
                              <MenuItem value="draft">Draft</MenuItem>
                              <MenuItem value="published">Published</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="technique-grade-label">Grade</InputLabel>
                            <Select
                              labelId="technique-grade-label"
                              label="Grade"
                              value={formState.gradeId}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  gradeId: event.target.value as string,
                                }))
                              }
                            >
                              <MenuItem value="">
                                <em>Unassigned</em>
                              </MenuItem>
                              {sortedGrades.map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                  {grade.name.romaji || grade.name.en || grade.id}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={handleSaveTechnique}
                              disabled={isSaving}
                            >
                              Create
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={resetForm}
                              disabled={isSaving}
                            >
                              Clear
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                    {orderedTechniques.map((technique) => {
                      const primaryName =
                        technique.name.romaji || technique.name.en || technique.id;
                      const secondaryName =
                        technique.name.romaji && technique.name.en
                          ? primaryName === technique.name.romaji
                            ? technique.name.en
                            : technique.name.romaji
                          : technique.id;
                      const techniqueRank = getTechniqueRank(technique);

                      if (editingId === technique.id) {
                        return (
                          <TableRow
                            key={technique.id}
                            hover
                            sx={(theme) => ({
                              backgroundColor: theme.palette.action.hover,
                            })}
                          >
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Editing {technique.id}
                                </Typography>
                                <TextField
                                  label="Romaji"
                                  value={formState.nameRomaji}
                                  onChange={(event) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      nameRomaji: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  label="English"
                                  value={formState.nameEn}
                                  onChange={(event) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      nameEn: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  label="Swedish"
                                  value={formState.nameSv}
                                  onChange={(event) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      nameSv: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="technique-kind-label">Kind</InputLabel>
                                <Select
                                  labelId="technique-kind-label"
                                  label="Kind"
                                  value={formState.kind}
                                  onChange={(event) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      kind: event.target.value as TechniqueKind,
                                    }))
                                  }
                                >
                                  {Object.values(TechniqueKind).map((kind) => (
                                    <MenuItem key={kind} value={kind}>
                                      {kind}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <TextField
                                type="number"
                                label="Rank"
                                value={formState.rank}
                                onChange={(event) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    rank: Number(event.target.value),
                                  }))
                                }
                                inputProps={{ min: 0 }}
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="technique-status-label">Status</InputLabel>
                                <Select
                                  labelId="technique-status-label"
                                  label="Status"
                                  value={formState.status}
                                  onChange={(event) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      status: event.target.value as PublishStatus,
                                    }))
                                  }
                                >
                                  <MenuItem value="draft">Draft</MenuItem>
                                  <MenuItem value="published">Published</MenuItem>
                                  <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="technique-grade-label-edit">Grade</InputLabel>
                                <Select
                                  labelId="technique-grade-label-edit"
                                  label="Grade"
                                  value={formState.gradeId}
                                  onChange={(event) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      gradeId: event.target.value as string,
                                    }))
                                  }
                                >
                                  <MenuItem value="">
                                    <em>Unassigned</em>
                                  </MenuItem>
                                  {sortedGrades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                      {grade.name.romaji || grade.name.en || grade.id}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleSaveTechnique}
                                  disabled={isSaving}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={resetForm}
                                  disabled={isSaving}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow key={technique.id} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography variant="body2" fontWeight={600}>
                                {primaryName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {secondaryName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{technique.kind}</TableCell>
                          <TableCell>{techniqueRank > 0 ? techniqueRank : '—'}</TableCell>
                          <TableCell>
                            <Chip
                              label={technique.status}
                              size="small"
                              color={
                                technique.status === 'published'
                                  ? 'success'
                                  : technique.status === 'draft'
                                    ? 'warning'
                                    : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                gradeNameById.get(techniqueGradeMap.get(technique.id) || '') ||
                                'Unassigned'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                onClick={() => handleEditTechnique(technique)}
                                disabled={Boolean(editingId)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteTechnique(technique.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!filteredTechniques.length && !isLoadingTechniques && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No techniques match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {isLoadingTechniques && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Loading techniques...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Paper>
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id="admin-tabpanel-1"
          aria-labelledby="admin-tab-1"
          sx={{ display: activeTab === 1 ? 'block' : 'none' }}
        >
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={600}>
                Grade Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage belt grades and assign techniques or katas to each grade.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <Chip label={`${grades.length} total`} />
                <Chip
                  label={`${grades.filter((grade) => grade.status === 'published').length} published`}
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Grade Library
                    </Typography>
                    <Chip label={`${filteredGrades.length} shown`} size="small" />
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={handleShowGradeCreateRow}
                    disabled={Boolean(gradeEditingId)}
                  >
                    Add Grade
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Search"
                    value={gradeSearch}
                    onChange={(event) => setGradeSearch(event.target.value)}
                    size="small"
                    fullWidth
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel id="grade-filter-status">Status</InputLabel>
                    <Select
                      labelId="grade-filter-status"
                      label="Status"
                      value={gradeStatusFilter}
                      onChange={(event) =>
                        setGradeStatusFilter(event.target.value as 'all' | PublishStatus)
                      }
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              <Divider />

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table size="small" stickyHeader sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sortDirection={gradeSortKey === 'name' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'name'}
                          direction={gradeSortKey === 'name' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'kind' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'kind'}
                          direction={gradeSortKey === 'kind' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('kind')}
                        >
                          Kind
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'rank' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'rank'}
                          direction={gradeSortKey === 'rank' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('rank')}
                        >
                          Rank
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'beltColor' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'beltColor'}
                          direction={gradeSortKey === 'beltColor' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('beltColor')}
                        >
                          Belt
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'sortOrder' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'sortOrder'}
                          direction={gradeSortKey === 'sortOrder' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('sortOrder')}
                        >
                          Sort
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'status' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'status'}
                          direction={gradeSortKey === 'status' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'techniques' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'techniques'}
                          direction={gradeSortKey === 'techniques' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('techniques')}
                        >
                          Techniques
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={gradeSortKey === 'katas' ? gradeSortDirection : false}
                      >
                        <TableSortLabel
                          active={gradeSortKey === 'katas'}
                          direction={gradeSortKey === 'katas' ? gradeSortDirection : 'asc'}
                          onClick={() => handleGradeSort('katas')}
                        >
                          Katas
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showGradeCreateRow && !gradeEditingId && (
                      <TableRow
                        sx={(theme) => ({
                          backgroundColor: theme.palette.action.hover,
                        })}
                      >
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              Create new grade
                            </Typography>
                            <TextField
                              label="Romaji"
                              value={gradeFormState.nameRomaji}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  nameRomaji: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                            <TextField
                              label="English"
                              value={gradeFormState.nameEn}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  nameEn: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                            <TextField
                              label="System ID"
                              value={gradeFormState.gradingSystemId}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  gradingSystemId: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="grade-kind-label">Kind</InputLabel>
                            <Select
                              labelId="grade-kind-label"
                              label="Kind"
                              value={gradeFormState.kind}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  kind: event.target.value as GradeKind,
                                }))
                              }
                            >
                              {Object.values(GradeKind).map((kind) => (
                                <MenuItem key={kind} value={kind}>
                                  {kind}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <TextField
                            type="number"
                            label="Rank"
                            value={gradeFormState.rank}
                            onChange={(event) =>
                              setGradeFormState((prev) => ({
                                ...prev,
                                rank: Number(event.target.value),
                              }))
                            }
                            inputProps={{ min: 1, max: 20 }}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="grade-belt-label">Belt</InputLabel>
                            <Select
                              labelId="grade-belt-label"
                              label="Belt"
                              value={gradeFormState.beltColor}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  beltColor: event.target.value as BeltColor,
                                }))
                              }
                            >
                              {Object.values(BeltColor).map((color) => (
                                <MenuItem key={color} value={color}>
                                  {color}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <TextField
                            type="number"
                            value={gradeFormState.sortOrder}
                            onChange={(event) =>
                              setGradeFormState((prev) => ({
                                ...prev,
                                sortOrder: Number(event.target.value),
                              }))
                            }
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="grade-status-label">Status</InputLabel>
                            <Select
                              labelId="grade-status-label"
                              label="Status"
                              value={gradeFormState.status}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  status: event.target.value as PublishStatus,
                                }))
                              }
                            >
                              <MenuItem value="draft">Draft</MenuItem>
                              <MenuItem value="published">Published</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="grade-techniques-label">Techniques</InputLabel>
                            <Select
                              labelId="grade-techniques-label"
                              label="Techniques"
                              multiple
                              value={gradeFormState.techniqueIds}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  techniqueIds: event.target.value as string[],
                                }))
                              }
                              input={<OutlinedInput label="Techniques" />}
                              renderValue={(selected) =>
                                `${(selected as string[]).length} selected`
                              }
                            >
                              {sortedTechniques.map((technique) => (
                                <MenuItem key={technique.id} value={technique.id}>
                                  <Checkbox
                                    checked={gradeFormState.techniqueIds.includes(technique.id)}
                                  />
                                  <ListItemText
                                    primary={
                                      technique.name.romaji || technique.name.en || technique.id
                                    }
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="grade-katas-label">Katas</InputLabel>
                            <Select
                              labelId="grade-katas-label"
                              label="Katas"
                              multiple
                              value={gradeFormState.kataIds}
                              onChange={(event) =>
                                setGradeFormState((prev) => ({
                                  ...prev,
                                  kataIds: event.target.value as string[],
                                }))
                              }
                              input={<OutlinedInput label="Katas" />}
                              renderValue={(selected) =>
                                `${(selected as string[]).length} selected`
                              }
                            >
                              {sortedKatas.map((kata) => (
                                <MenuItem key={kata.id} value={kata.id}>
                                  <Checkbox checked={gradeFormState.kataIds.includes(kata.id)} />
                                  <ListItemText
                                    primary={kata.name.romaji || kata.name.en || kata.id}
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={handleSaveGrade}
                              disabled={isSaving}
                            >
                              Create
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={resetGradeForm}
                              disabled={isSaving}
                            >
                              Clear
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                    {orderedGrades.map((grade) => {
                      const primaryName = grade.name.romaji || grade.name.en || grade.id;
                      const secondaryName =
                        grade.name.romaji && grade.name.en
                          ? primaryName === grade.name.romaji
                            ? grade.name.en
                            : grade.name.romaji
                          : grade.id;
                      const rankValue =
                        typeof grade.rank === 'number' && Number.isFinite(grade.rank)
                          ? grade.rank
                          : deriveGradeRank(grade.kind as GradeKind, grade.number);

                      if (gradeEditingId === grade.id) {
                        return (
                          <TableRow
                            key={grade.id}
                            hover
                            sx={(theme) => ({
                              backgroundColor: theme.palette.action.hover,
                            })}
                          >
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Editing {grade.id}
                                </Typography>
                                <TextField
                                  label="Romaji"
                                  value={gradeFormState.nameRomaji}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      nameRomaji: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  label="English"
                                  value={gradeFormState.nameEn}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      nameEn: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  label="System ID"
                                  value={gradeFormState.gradingSystemId}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      gradingSystemId: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="grade-kind-label-edit">Kind</InputLabel>
                                <Select
                                  labelId="grade-kind-label-edit"
                                  label="Kind"
                                  value={gradeFormState.kind}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      kind: event.target.value as GradeKind,
                                    }))
                                  }
                                >
                                  {Object.values(GradeKind).map((kind) => (
                                    <MenuItem key={kind} value={kind}>
                                      {kind}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <TextField
                                type="number"
                                label="Rank"
                                value={gradeFormState.rank}
                                onChange={(event) =>
                                  setGradeFormState((prev) => ({
                                    ...prev,
                                    rank: Number(event.target.value),
                                  }))
                                }
                                inputProps={{ min: 1, max: 20 }}
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="grade-belt-label-edit">Belt</InputLabel>
                                <Select
                                  labelId="grade-belt-label-edit"
                                  label="Belt"
                                  value={gradeFormState.beltColor}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      beltColor: event.target.value as BeltColor,
                                    }))
                                  }
                                >
                                  {Object.values(BeltColor).map((color) => (
                                    <MenuItem key={color} value={color}>
                                      {color}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <TextField
                                type="number"
                                value={gradeFormState.sortOrder}
                                onChange={(event) =>
                                  setGradeFormState((prev) => ({
                                    ...prev,
                                    sortOrder: Number(event.target.value),
                                  }))
                                }
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="grade-status-label-edit">Status</InputLabel>
                                <Select
                                  labelId="grade-status-label-edit"
                                  label="Status"
                                  value={gradeFormState.status}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      status: event.target.value as PublishStatus,
                                    }))
                                  }
                                >
                                  <MenuItem value="draft">Draft</MenuItem>
                                  <MenuItem value="published">Published</MenuItem>
                                  <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="grade-techniques-label-edit">Techniques</InputLabel>
                                <Select
                                  labelId="grade-techniques-label-edit"
                                  label="Techniques"
                                  multiple
                                  value={gradeFormState.techniqueIds}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      techniqueIds: event.target.value as string[],
                                    }))
                                  }
                                  input={<OutlinedInput label="Techniques" />}
                                  renderValue={(selected) =>
                                    `${(selected as string[]).length} selected`
                                  }
                                >
                                  {sortedTechniques.map((technique) => (
                                    <MenuItem key={technique.id} value={technique.id}>
                                      <Checkbox
                                        checked={gradeFormState.techniqueIds.includes(technique.id)}
                                      />
                                      <ListItemText
                                        primary={
                                          technique.name.romaji || technique.name.en || technique.id
                                        }
                                      />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="grade-katas-label-edit">Katas</InputLabel>
                                <Select
                                  labelId="grade-katas-label-edit"
                                  label="Katas"
                                  multiple
                                  value={gradeFormState.kataIds}
                                  onChange={(event) =>
                                    setGradeFormState((prev) => ({
                                      ...prev,
                                      kataIds: event.target.value as string[],
                                    }))
                                  }
                                  input={<OutlinedInput label="Katas" />}
                                  renderValue={(selected) =>
                                    `${(selected as string[]).length} selected`
                                  }
                                >
                                  {sortedKatas.map((kata) => (
                                    <MenuItem key={kata.id} value={kata.id}>
                                      <Checkbox
                                        checked={gradeFormState.kataIds.includes(kata.id)}
                                      />
                                      <ListItemText
                                        primary={kata.name.romaji || kata.name.en || kata.id}
                                      />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleSaveGrade}
                                  disabled={isSaving}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={resetGradeForm}
                                  disabled={isSaving}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow key={grade.id} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography variant="body2" fontWeight={600}>
                                {primaryName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {secondaryName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{grade.kind}</TableCell>
                          <TableCell>{rankValue > 0 ? rankValue : '—'}</TableCell>
                          <TableCell>{grade.beltColor}</TableCell>
                          <TableCell>{grade.sortOrder}</TableCell>
                          <TableCell>
                            <Chip
                              label={grade.status}
                              size="small"
                              color={
                                grade.status === 'published'
                                  ? 'success'
                                  : grade.status === 'draft'
                                    ? 'warning'
                                    : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={`${grade.techniqueIds?.length || 0}`} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={`${grade.kataIds?.length || 0}`} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                onClick={() => handleEditGrade(grade)}
                                disabled={Boolean(gradeEditingId)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteGrade(grade.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!filteredGrades.length && !isLoadingGrades && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No grades match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {isLoadingGrades && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Loading grades...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Paper>
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 2}
          id="admin-tabpanel-2"
          aria-labelledby="admin-tab-2"
          sx={{ display: activeTab === 2 ? 'block' : 'none' }}
        >
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={600}>
                Kata Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and update kata entries.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <Chip label={`${katas.length} total`} />
                <Chip
                  label={`${katas.filter((kata) => kata.status === 'published').length} published`}
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Kata Library
                    </Typography>
                    <Chip label={`${filteredKatas.length} shown`} size="small" />
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={handleShowKataCreateRow}
                    disabled={Boolean(kataEditingId)}
                  >
                    Add Kata
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Search"
                    value={kataSearch}
                    onChange={(event) => setKataSearch(event.target.value)}
                    size="small"
                    fullWidth
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel id="kata-filter-status">Status</InputLabel>
                    <Select
                      labelId="kata-filter-status"
                      label="Status"
                      value={kataStatusFilter}
                      onChange={(event) =>
                        setKataStatusFilter(event.target.value as 'all' | PublishStatus)
                      }
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              <Divider />

              <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sortDirection={kataSortKey === 'name' ? kataSortDirection : false}>
                        <TableSortLabel
                          active={kataSortKey === 'name'}
                          direction={kataSortKey === 'name' ? kataSortDirection : 'asc'}
                          onClick={() => handleKataSort('name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={kataSortKey === 'rank' ? kataSortDirection : false}>
                        <TableSortLabel
                          active={kataSortKey === 'rank'}
                          direction={kataSortKey === 'rank' ? kataSortDirection : 'asc'}
                          onClick={() => handleKataSort('rank')}
                        >
                          Rank
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={kataSortKey === 'status' ? kataSortDirection : false}
                      >
                        <TableSortLabel
                          active={kataSortKey === 'status'}
                          direction={kataSortKey === 'status' ? kataSortDirection : 'asc'}
                          onClick={() => handleKataSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={kataSortKey === 'grade' ? kataSortDirection : false}
                      >
                        <TableSortLabel
                          active={kataSortKey === 'grade'}
                          direction={kataSortKey === 'grade' ? kataSortDirection : 'asc'}
                          onClick={() => handleKataSort('grade')}
                        >
                          Grade
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showKataCreateRow && !kataEditingId && (
                      <TableRow
                        sx={(theme) => ({
                          backgroundColor: theme.palette.action.hover,
                        })}
                      >
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              Create new kata
                            </Typography>
                            <TextField
                              label="Romaji"
                              value={kataFormState.nameRomaji}
                              onChange={(event) =>
                                setKataFormState((prev) => ({
                                  ...prev,
                                  nameRomaji: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                            <TextField
                              label="English"
                              value={kataFormState.nameEn}
                              onChange={(event) =>
                                setKataFormState((prev) => ({
                                  ...prev,
                                  nameEn: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                            <TextField
                              label="Swedish"
                              value={kataFormState.nameSv}
                              onChange={(event) =>
                                setKataFormState((prev) => ({
                                  ...prev,
                                  nameSv: event.target.value,
                                }))
                              }
                              size="small"
                              fullWidth
                            />
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <TextField
                            type="number"
                            label="Rank"
                            value={kataFormState.rank}
                            onChange={(event) =>
                              setKataFormState((prev) => ({
                                ...prev,
                                rank: Number(event.target.value),
                              }))
                            }
                            inputProps={{ min: 0 }}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="kata-status-label">Status</InputLabel>
                            <Select
                              labelId="kata-status-label"
                              label="Status"
                              value={kataFormState.status}
                              onChange={(event) =>
                                setKataFormState((prev) => ({
                                  ...prev,
                                  status: event.target.value as PublishStatus,
                                }))
                              }
                            >
                              <MenuItem value="draft">Draft</MenuItem>
                              <MenuItem value="published">Published</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="kata-grade-label">Grade</InputLabel>
                            <Select
                              labelId="kata-grade-label"
                              label="Grade"
                              value={kataFormState.gradeId}
                              onChange={(event) =>
                                setKataFormState((prev) => ({
                                  ...prev,
                                  gradeId: event.target.value as string,
                                }))
                              }
                            >
                              <MenuItem value="">
                                <em>Unassigned</em>
                              </MenuItem>
                              {sortedGrades.map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                  {grade.name.romaji || grade.name.en || grade.id}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={handleSaveKata}
                              disabled={isSaving}
                            >
                              Create
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={resetKataForm}
                              disabled={isSaving}
                            >
                              Clear
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                    {orderedKatas.map((kata) => {
                      const primaryName = kata.name.romaji || kata.name.en || kata.id;
                      const secondaryName =
                        kata.name.romaji && kata.name.en
                          ? primaryName === kata.name.romaji
                            ? kata.name.en
                            : kata.name.romaji
                          : kata.id;
                      const kataRank = getKataRank(kata);

                      if (kataEditingId === kata.id) {
                        return (
                          <TableRow
                            key={kata.id}
                            hover
                            sx={(theme) => ({
                              backgroundColor: theme.palette.action.hover,
                            })}
                          >
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Editing {kata.id}
                                </Typography>
                                <TextField
                                  label="Romaji"
                                  value={kataFormState.nameRomaji}
                                  onChange={(event) =>
                                    setKataFormState((prev) => ({
                                      ...prev,
                                      nameRomaji: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  label="English"
                                  value={kataFormState.nameEn}
                                  onChange={(event) =>
                                    setKataFormState((prev) => ({
                                      ...prev,
                                      nameEn: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  label="Swedish"
                                  value={kataFormState.nameSv}
                                  onChange={(event) =>
                                    setKataFormState((prev) => ({
                                      ...prev,
                                      nameSv: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <TextField
                                type="number"
                                label="Rank"
                                value={kataFormState.rank}
                                onChange={(event) =>
                                  setKataFormState((prev) => ({
                                    ...prev,
                                    rank: Number(event.target.value),
                                  }))
                                }
                                inputProps={{ min: 0 }}
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="kata-status-label-edit">Status</InputLabel>
                                <Select
                                  labelId="kata-status-label-edit"
                                  label="Status"
                                  value={kataFormState.status}
                                  onChange={(event) =>
                                    setKataFormState((prev) => ({
                                      ...prev,
                                      status: event.target.value as PublishStatus,
                                    }))
                                  }
                                >
                                  <MenuItem value="draft">Draft</MenuItem>
                                  <MenuItem value="published">Published</MenuItem>
                                  <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel id="kata-grade-label-edit">Grade</InputLabel>
                                <Select
                                  labelId="kata-grade-label-edit"
                                  label="Grade"
                                  value={kataFormState.gradeId}
                                  onChange={(event) =>
                                    setKataFormState((prev) => ({
                                      ...prev,
                                      gradeId: event.target.value as string,
                                    }))
                                  }
                                >
                                  <MenuItem value="">
                                    <em>Unassigned</em>
                                  </MenuItem>
                                  {sortedGrades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                      {grade.name.romaji || grade.name.en || grade.id}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleSaveKata}
                                  disabled={isSaving}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={resetKataForm}
                                  disabled={isSaving}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow key={kata.id} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography variant="body2" fontWeight={600}>
                                {primaryName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {secondaryName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{kataRank > 0 ? kataRank : '—'}</TableCell>
                          <TableCell>
                            <Chip
                              label={kata.status}
                              size="small"
                              color={
                                kata.status === 'published'
                                  ? 'success'
                                  : kata.status === 'draft'
                                    ? 'warning'
                                    : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                gradeNameById.get(kataGradeMap.get(kata.id) || '') || 'Unassigned'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                onClick={() => handleEditKata(kata)}
                                disabled={Boolean(kataEditingId)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteKata(kata.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!filteredKatas.length && !isLoadingKatas && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No katas match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {isLoadingKatas && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Loading katas...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Paper>
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 3}
          id="admin-tabpanel-3"
          aria-labelledby="admin-tab-3"
          sx={{ display: activeTab === 3 ? 'block' : 'none' }}
        >
          <QuoteManagementTab />
        </Box>
      </Stack>
    </Container>
  );
};

function normalizeGradeRank(kind: GradeKind, rank: number): number {
  if (!Number.isFinite(rank)) return 0;
  const rounded = Math.round(rank);
  if (kind === GradeKind.Dan) return Math.min(Math.max(rounded, 11), 20);
  if (kind === GradeKind.Kyu) return Math.min(Math.max(rounded, 1), 10);
  return 0;
}

function deriveGradeNumber(kind: GradeKind, rank: number): number {
  if (!Number.isFinite(rank)) return 0;
  if (kind === GradeKind.Dan) return Math.max(rank - 10, 1);
  if (kind === GradeKind.Kyu) return 11 - rank;
  return 0;
}

function deriveGradeRank(kind: GradeKind, number: number): number {
  if (!Number.isFinite(number)) return 0;
  if (kind === GradeKind.Dan) return number > 0 ? 10 + number : 0;
  if (kind === GradeKind.Kyu) {
    if (number >= 1 && number <= 10) return 11 - number;
    return 0;
  }
  return 0;
}

export default AdminPage;
