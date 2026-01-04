import { ChevronRight, Whatshot } from '@mui/icons-material';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Motto } from '../types';

interface MottoCardProps {
  motto: Motto;
  index: number;
  onClick: (motto: Motto) => void;
}

const toRoman = (num: number): string => {
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  return roman[num] || String(num);
};

export const MottoCard: React.FC<MottoCardProps> = ({ motto, index, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      onClick={() => onClick(motto)}
      sx={{
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.standard,
        }),
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          '& .motto-accent-bar': {
            transform: 'scaleY(1)',
          },
          '& .motto-action': {
            opacity: 1,
            transform: 'translateX(0)',
          },
          '& .motto-number': {
            transform: 'scale(1.1)',
          },
          '& .motto-title': {
            color: theme.palette.primary.main,
          },
          '& .motto-flame': {
            color: theme.palette.secondary.main,
          },
        },
      }}
    >
      {/* Accent bar */}
      <Box
        className="motto-accent-bar"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: theme.palette.primary.main,
          transform: 'scaleY(0)',
          transformOrigin: 'top',
          transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.standard,
          }),
        }}
      />

      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Box display="flex" alignItems="baseline" gap={1}>
            <Typography
              className="motto-number"
              variant="h5"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.standard,
                }),
              }}
            >
              {toRoman(index + 1)}.
            </Typography>
            <Typography
              className="motto-title"
              variant="h6"
              sx={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: theme.transitions.create('color', {
                  duration: theme.transitions.duration.standard,
                }),
              }}
            >
              {motto.shortTitle}
            </Typography>
          </Box>
          <Whatshot
            className="motto-flame"
            sx={{
              fontSize: 20,
              color: theme.palette.grey[400],
              transition: theme.transitions.create('color', {
                duration: theme.transitions.duration.standard,
              }),
            }}
          />
        </Box>

        {/* Quote */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            lineHeight: 1.6,
            mb: 3,
            pl: 2,
            borderLeft: `2px solid ${theme.palette.grey[300]}`,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          "{motto.text}"
        </Typography>

        {/* Action */}
        <Box
          className="motto-action"
          display="flex"
          alignItems="center"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 500,
            opacity: 0,
            transform: 'translateX(8px)',
            transition: theme.transitions.create(['opacity', 'transform'], {
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: 1, mr: 1 }}
          >
            Begin Training
          </Typography>
          <ChevronRight sx={{ fontSize: 16 }} />
        </Box>
      </CardContent>
    </Card>
  );
};
