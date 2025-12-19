// Refactored TechniquePage.tsx - Mobile-first with card-based layout
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Button, Stack, Grid, CircularProgress, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { KyokushinRepository, GradeWithContent } from '../../../data/repo/KyokushinRepository';
import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';
import { TechniqueRecord } from '../../../data/model/technique';
import { KataRecord } from '../../../data/model/kata';

import FilterBar, { FilterType } from './FilterBar';
import GradeCard from './GradeCard';
import TechniqueDetailDrawer from './TechniqueDetailDrawer';

const TechniquePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterType>('all');

  const [grades, setGrades] = useState<GradeWithContent[]>([]);
  const [loading, setLoading] = useState(true);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [youtubeLinks, setYoutubeLinks] = useState<Record<string, string[]>>({});

  // DetailDrawer state
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueRecord | KataRecord | null>(
    null,
  );
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const data = KyokushinRepository.getCurriculumGrades();
    setGrades(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch user progress
  useEffect(() => {
    if (!token) return;

    fetch('/api/v1/technique-progress', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch progress');
      })
      .then((data: any) => {
        if (data.progress) {
          const newRatings: Record<string, number> = {};
          const newNotes: Record<string, string> = {};
          const newTags: Record<string, string[]> = {};
          const newYoutubeLinks: Record<string, string[]> = {};

          data.progress.forEach((item: any) => {
            if (item.rating) newRatings[item.techniqueId] = item.rating;
            if (item.notes) newNotes[item.techniqueId] = item.notes;
            if (item.tags && item.tags.length) newTags[item.techniqueId] = item.tags;
            if (item.videoLinks && item.videoLinks.length)
              newYoutubeLinks[item.techniqueId] = item.videoLinks;
          });

          setRatings(newRatings);
          setNotes(newNotes);
          setTags(newTags);
          setYoutubeLinks(newYoutubeLinks);
        }
      })
      .catch((err) => console.error('Error fetching progress:', err));
  }, [token]);

  const handleTechniqueClick = (technique: TechniqueRecord | KataRecord, gradeId: string) => {
    setSelectedTechnique(technique);
    setSelectedGradeId(gradeId);
    setDrawerOpen(true);

    // Pre-populate YouTube links from kata/technique mediaIds if not already in user progress
    if (
      technique.mediaIds &&
      technique.mediaIds.length > 0 &&
      (!youtubeLinks[technique.id] || youtubeLinks[technique.id].length === 0)
    ) {
      const mediaUrls = technique.mediaIds
        .map((mediaId) => {
          const media = KyokushinRepository.getMedia(mediaId);
          return media?.url;
        })
        .filter(Boolean) as string[];

      if (mediaUrls.length > 0) {
        setYoutubeLinks((prev) => ({
          ...prev,
          [technique.id]: mediaUrls,
        }));
      }
    }
  };

  const handleSaveProgress = async (data: {
    rating?: number;
    notes?: string;
    tags?: string[];
    videoLinks?: string[];
  }) => {
    if (!selectedTechnique || !token) {
      showSnackbar('Please log in to save progress', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/v1/technique-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ techniqueId: selectedTechnique.id, ...data }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      // Update local state
      if (data.rating !== undefined) {
        setRatings((prev) => ({ ...prev, [selectedTechnique.id]: data.rating! }));
      }
      if (data.notes !== undefined) {
        setNotes((prev) => ({ ...prev, [selectedTechnique.id]: data.notes! }));
      }
      if (data.tags !== undefined) {
        setTags((prev) => ({ ...prev, [selectedTechnique.id]: data.tags! }));
      }
      if (data.videoLinks !== undefined) {
        setYoutubeLinks((prev) => ({ ...prev, [selectedTechnique.id]: data.videoLinks! }));
      }

      showSnackbar('Progress saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      showSnackbar('Failed to save changes. Please try again.', 'error');
    }
  };

  const handleExport = () => {
    const data = {
      techniqueRatings: ratings,
      techniqueNotes: notes,
      techniqueTags: tags,
      techniqueYoutubeLinks: youtubeLinks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'technique-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.techniqueRatings) setRatings(data.techniqueRatings);
          if (data.techniqueNotes) setNotes(data.techniqueNotes);
          if (data.techniqueTags) setTags(data.techniqueTags);
          if (data.techniqueYoutubeLinks) setYoutubeLinks(data.techniqueYoutubeLinks);

          showSnackbar('Data imported locally. Edit items to save to cloud.', 'info');
        } catch (error) {
          showSnackbar('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter grades and techniques
  const filteredGrades = grades
    .map((grade) => {
      let techniques = [...grade.techniques];
      let katas = [...grade.katas];

      // Apply search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        techniques = techniques.filter(
          (t) =>
            t.name.romaji?.toLowerCase().includes(searchLower) ||
            t.name.en?.toLowerCase().includes(searchLower) ||
            t.name.ja?.toLowerCase().includes(searchLower) ||
            t.name.sv?.toLowerCase().includes(searchLower),
        );
        katas = katas.filter(
          (k) =>
            k.name.romaji?.toLowerCase().includes(searchLower) ||
            k.name.en?.toLowerCase().includes(searchLower) ||
            k.name.ja?.toLowerCase().includes(searchLower),
        );
      }

      // Apply type filter
      if (selectedType) {
        if (selectedType === 'Kata') {
          techniques = [];
        } else {
          techniques = techniques.filter((t) => t.kind === selectedType);
          katas = [];
        }
      }

      // Apply mastery filter
      if (filterMode !== 'all') {
        const allIds = [...techniques.map((t) => t.id), ...katas.map((k) => k.id)];
        const filteredIds = allIds.filter((id) => {
          const rating = ratings[id] || 0;
          if (filterMode === 'mastered') return rating >= 4;
          if (filterMode === 'learning') return rating > 0 && rating < 4;
          return true;
        });

        techniques = techniques.filter((t) => filteredIds.includes(t.id));
        katas = katas.filter((k) => filteredIds.includes(k.id));
      }

      return {
        ...grade,
        techniques,
        katas,
      };
    })
    .filter((grade) => grade.techniques.length > 0 || grade.katas.length > 0);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Export/Import Buttons */}
      <Stack direction="row" spacing={1} sx={{ p: 2, pb: 0 }}>
        <Button startIcon={<DownloadIcon />} onClick={handleExport} size="small">
          Export
        </Button>
        <Button
          startIcon={<UploadIcon />}
          onClick={() => document.getElementById('import-file')?.click()}
          size="small"
        >
          Import
        </Button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </Stack>

      {/* Sticky Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
      />

      {/* Grade Cards */}
      <Box sx={{ p: 2 }}>
        {filteredGrades.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No techniques found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredGrades.map((grade) => (
              <Grid item xs={12} sm={6} md={4} key={grade.id}>
                <GradeCard
                  grade={grade}
                  onTechniqueClick={handleTechniqueClick}
                  ratings={ratings}
                  tags={tags}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Technique Detail Drawer */}
      <TechniqueDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        technique={selectedTechnique}
        rating={selectedTechnique ? ratings[selectedTechnique.id] || 0 : 0}
        notes={selectedTechnique ? notes[selectedTechnique.id] || '' : ''}
        tags={selectedTechnique ? tags[selectedTechnique.id] || [] : []}
        youtubeLinks={selectedTechnique ? youtubeLinks[selectedTechnique.id] || [] : []}
        onSave={handleSaveProgress}
      />
    </Box>
  );
};

export default TechniquePage;
