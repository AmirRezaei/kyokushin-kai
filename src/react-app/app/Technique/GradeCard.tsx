// GradeCard.tsx - Compact grade card with expandable technique list
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';

import { GradeWithContent } from '../../../data/repo/KyokushinRepository';
import { getBeltColorHex } from '../../../data/repo/gradeHelpers';
import { TechniqueRecord } from '../../../data/model/technique';
import { KataRecord } from '../../../data/model/kata';
import { LocalizedText } from '../../../data/model/common';
import {
  useLanguage,
  LanguageEnum,
  getLocalizedTextKey,
} from '../../components/context/LanguageContext';
import { getTagConfig } from './tagConfig';

interface GradeCardProps {
  grade: GradeWithContent;
  onTechniqueClick: (technique: TechniqueRecord | KataRecord, gradeId: string) => void;
  ratings: Record<string, number>;
  tags: Record<string, string[]>;
}

const GradeCard: React.FC<GradeCardProps> = ({ grade, onTechniqueClick, ratings, tags }) => {
  const [expanded, setExpanded] = useState(false);
  const { selectedLanguages } = useLanguage();

  // Helper function to get primary text (romaji or fallback to first available)
  const getPrimaryText = (text: LocalizedText): string => {
    if (typeof text === 'string') return text;

    // Try to get romaji first
    if (text.romaji) return text.romaji;

    // Fallback to first available translation
    return text.en || text.ja || text.sv || Object.values(text)[0] || '';
  };

  // Helper function to get text in selected languages (excluding Romaji)
  const getSecondaryText = (text: LocalizedText): string => {
    // Get all selected languages except Romaji
    const secondaryLanguages = selectedLanguages.filter((lang) => lang !== LanguageEnum.Romaji);

    if (typeof text === 'string') return text;
    if (secondaryLanguages.length === 0) return ''; // No secondary languages selected

    // Join all selected language translations
    const translations = secondaryLanguages
      .map((lang) => {
        const key = getLocalizedTextKey(lang);
        return (text[key as keyof LocalizedText] as string) || '';
      })
      .filter((t) => t.length > 0); // Remove empty translations

    return translations.join(' / ');
  };

  const beltColor = getBeltColorHex(grade.beltColor);
  const totalItems = grade.techniques.length + grade.katas.length;
  const masteredItems = [
    ...grade.techniques.map((t) => t.id),
    ...grade.katas.map((k) => k.id),
  ].filter((id) => (ratings[id] || 0) >= 4).length;

  const progressPercent = totalItems > 0 ? (masteredItems / totalItems) * 100 : 0;

  // Determine if this grade should have stripes
  const isIntermediateKyu = grade.kind === 'Kyu' && grade.number % 2 === 1; // Odd kyu numbers (9, 7, 5, 3, 1)
  const isDan = grade.kind === 'Dan';
  const stripeCount = isDan ? grade.number : 1; // Dans show multiple stripes based on rank

  return (
    <Card
      sx={{
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Belt Color Indicator with optional stripes */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          backgroundColor: beltColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '2px',
          pt: '5px',
        }}
      >
        {(isIntermediateKyu || isDan) &&
          Array.from({ length: stripeCount }).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                my: '0px',
                height: '4px',
                backgroundColor: isDan ? '#FFD700' : 'rgba(255, 255, 255, 1)', // Yellow for dans, dark for kyu
              }}
            />
          ))}
      </Box>

      <CardContent sx={{ pl: 3, flex: 1, pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {getPrimaryText(grade.name)}
            </Typography>
            {getSecondaryText(grade.name) && (
              <Typography variant="caption" color="text.secondary">
                {getSecondaryText(grade.name)}
              </Typography>
            )}
          </Box>

          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {masteredItems} / {totalItems} mastered
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {Math.round(progressPercent)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Technique Counts */}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Chip label={`${grade.techniques.length} Techniques`} size="small" variant="outlined" />
          <Chip label={`${grade.katas.length} Katas`} size="small" variant="outlined" />
        </Stack>
      </CardContent>

      {/* Expandable Technique List */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List dense sx={{ pt: 0 }}>
          {/* Group techniques by kind */}
          {(() => {
            const techniquesByKind = grade.techniques.reduce(
              (acc, technique) => {
                const kind = technique.kind;
                if (!acc[kind]) acc[kind] = [];
                acc[kind].push(technique);
                return acc;
              },
              {} as Record<string, TechniqueRecord[]>,
            );

            // Define order of sections
            const orderedKinds = [
              'Stand',
              'Strike',
              'Block',
              'Kick',
              'Breathing',
              'Fighting',
              'Combination',
              'Other',
            ];

            return orderedKinds.map((kind) => {
              const techniques = techniquesByKind[kind];
              if (!techniques || techniques.length === 0) return null;

              return (
                <Box key={kind}>
                  {/* Section Divider */}
                  <Box
                    sx={{
                      ml: 1, // Margin to avoid belt color band
                      px: 2,
                      py: 1,
                      backgroundColor: 'action.hover',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      {kind}
                    </Typography>
                  </Box>

                  {/* Techniques in this section */}
                  {techniques.map((technique) => {
                    const rating = ratings[technique.id] || 0;
                    const isMastered = rating >= 4;
                    const techniqueTags = tags[technique.id] || [];

                    return (
                      <ListItemButton
                        key={technique.id}
                        onClick={() => onTechniqueClick(technique, grade.id)}
                        sx={{
                          ml: 1, // Margin to avoid belt color band
                          pl: 2,
                          minHeight: 48,
                          borderLeft: `4px solid ${isMastered ? '#4caf50' : 'transparent'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <ListItemText
                            primary={getPrimaryText(technique.name)}
                            secondary={getSecondaryText(technique.name)}
                            primaryTypographyProps={{
                              fontWeight: isMastered ? 600 : 400,
                            }}
                            sx={{ flex: 1 }}
                          />
                          {technique.mediaIds && technique.mediaIds.length > 0 && (
                            <OndemandVideoIcon
                              sx={{
                                fontSize: 18,
                                color: 'action.active',
                                mr: 0.5,
                              }}
                            />
                          )}
                          {rating > 0 && (
                            <Chip
                              label={`⭐ ${rating}`}
                              size="small"
                              color={isMastered ? 'success' : 'default'}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        {/* Tags */}
                        {techniqueTags.length > 0 && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {techniqueTags.map((tag, idx) => {
                              const config = getTagConfig(tag);
                              const TagIcon = config?.icon;

                              return (
                                <Chip
                                  key={idx}
                                  label={tag}
                                  icon={TagIcon ? <TagIcon /> : undefined}
                                  size="small"
                                  variant="outlined"
                                  color={config?.color || 'default'}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              );
                            })}
                          </Stack>
                        )}
                      </ListItemButton>
                    );
                  })}
                </Box>
              );
            });
          })()}

          {/* Kata Section */}
          {grade.katas.length > 0 && (
            <Box>
              {/* Kata Divider */}
              <Box
                sx={{
                  ml: 1, // Margin to avoid belt color band
                  px: 2,
                  py: 1,
                  backgroundColor: 'action.selected',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} color="primary">
                  Kata
                </Typography>
              </Box>

              {/* Kata List */}
              {grade.katas.map((kata) => {
                const rating = ratings[kata.id] || 0;
                const isMastered = rating >= 4;
                const kataTags = tags[kata.id] || [];

                return (
                  <ListItemButton
                    key={kata.id}
                    onClick={() => onTechniqueClick(kata, grade.id)}
                    sx={{
                      ml: 1, // Margin to avoid belt color band
                      pl: 2,
                      minHeight: 48,
                      borderLeft: `4px solid ${isMastered ? '#4caf50' : 'transparent'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <ListItemText
                        primary={getPrimaryText(kata.name)}
                        secondary={getSecondaryText(kata.name)}
                        primaryTypographyProps={{
                          fontWeight: isMastered ? 600 : 400,
                        }}
                        sx={{ flex: 1 }}
                      />
                      {kata.mediaIds && kata.mediaIds.length > 0 && (
                        <OndemandVideoIcon
                          sx={{
                            fontSize: 18,
                            color: 'action.active',
                            mr: 0.5,
                          }}
                        />
                      )}
                      {rating > 0 && (
                        <Chip
                          label={`⭐ ${rating}`}
                          size="small"
                          color={isMastered ? 'success' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    {/* Tags */}
                    {kataTags.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}
                      >
                        {kataTags.map((tag, idx) => {
                          const config = getTagConfig(tag);
                          const TagIcon = config?.icon;

                          return (
                            <Chip
                              key={idx}
                              label={tag}
                              icon={TagIcon ? <TagIcon /> : undefined}
                              size="small"
                              variant="outlined"
                              color={config?.color || 'default'}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </ListItemButton>
                );
              })}
            </Box>
          )}
        </List>
      </Collapse>
    </Card>
  );
};

export default GradeCard;
