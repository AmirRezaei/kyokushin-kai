// TechniqueListView.tsx - Flat list view of all techniques
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import {
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import React from 'react';

import { TechniqueRecord } from '../../../data/model/technique';
import { KataRecord } from '../../../data/model/kata';
import { LocalizedText } from '../../../data/model/common';
import { GradeWithContent } from '@/hooks/useCatalog';
import {
  useLanguage,
  LanguageEnum,
  getLocalizedTextKey,
} from '../../components/context/LanguageContext';
import { getTagConfig } from './tagConfig';
import KarateBelt from '../../components/UI/KarateBelt';

interface TechniqueListViewProps {
  grades: GradeWithContent[];
  onTechniqueClick: (technique: TechniqueRecord | KataRecord) => void;
  ratings: Record<string, number>;
  tags: Record<string, string[]>;
}

const TechniqueListView: React.FC<TechniqueListViewProps> = ({
  grades,
  onTechniqueClick,
  ratings,
  tags,
}) => {
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

  // Flatten all techniques and katas from all grades
  const allItems: Array<{
    item: TechniqueRecord | KataRecord;
    grade: GradeWithContent;
    gradeName: string;
    type: 'technique' | 'kata';
  }> = [];

  grades.forEach((grade) => {
    const gradeName = getPrimaryText(grade.name);

    grade.techniques.forEach((technique) => {
      allItems.push({
        item: technique,
        grade,
        gradeName,
        type: 'technique',
      });
    });

    grade.katas.forEach((kata) => {
      allItems.push({
        item: kata,
        grade,
        gradeName,
        type: 'kata',
      });
    });
  });

  if (allItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No techniques found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%' }}>
      {allItems.map(({ item, grade, gradeName, type }, index) => {
        const rating = ratings[item.id] || 0;
        const isMastered = rating >= 4;
        const itemTags = tags[item.id] || [];

        return (
          <React.Fragment key={`${grade.id}-${item.id}`}>
            {index > 0 && <Divider />}
            <ListItemButton
              onClick={() => onTechniqueClick(item)}
              sx={{
                minHeight: 64,
                borderLeft: `4px solid ${isMastered ? '#4caf50' : 'transparent'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                {/* Belt indicator */}
                <KarateBelt
                  grade={grade}
                  thickness="0.2rem"
                  borderRadius="4px"
                  borderWidth="1px"
                  orientation="horizontal"
                  sx={{ mr: 2, flexShrink: 0, width: '3rem', height: '1.4rem' }}
                />

                <ListItemText
                  primary={getPrimaryText(item.name)}
                  secondary={getSecondaryText(item.name)}
                  primaryTypographyProps={{
                    fontWeight: isMastered ? 600 : 400,
                  }}
                  sx={{ flex: 1 }}
                />

                {item.mediaIds && item.mediaIds.length > 0 && (
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

              {/* Grade and Type info */}
              <Stack direction="row" spacing={0.5} sx={{ mb: itemTags.length > 0 ? 0.5 : 0 }}>
                <Chip label={gradeName} size="small" variant="outlined" sx={{ height: 20 }} />
                <Chip
                  label={type === 'kata' ? 'Kata' : (item as TechniqueRecord).kind}
                  size="small"
                  variant="filled"
                  color="primary"
                  sx={{ height: 20 }}
                />
              </Stack>

              {/* Tags */}
              {itemTags.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {itemTags.map((tag, idx) => {
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
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default TechniqueListView;
