// File: src/react-app/components/games/cards/CardCrossword.tsx
import { ArrowBack, Refresh, FullscreenExit } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFullscreen } from '../../../components/context/FullscreenContext';

import { getBeltColorHex } from '../../../../data/repo/gradeHelpers';
import { KyokushinRepository, GradeWithContent } from '../../../../data/repo/KyokushinRepository';

import DeckSelector from './Deck/DeckSelector';
import { useDecks } from './Deck/DeckContext';
import { useCards } from './CardContext';

// Import Google Font for handwriting style
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap';
fontLink.rel = 'stylesheet';
if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

// Crossword Cell Types
type CellType = 'empty' | 'filled' | 'start' | 'space' | 'placeholder' | 'wrapper';

interface CrosswordCell {
  row: number;
  col: number;
  letter: string; // The correct letter
  value: string; // User's input
  type: CellType;
  wordId?: string; // ID of the word
  direction?: 'across' | 'down';
  number?: number; // Clue number
  wrapperText?: string; // For wrapper cells - the full text to display
  cellSpan?: number; // For wrapper cells - how many cells it spans
}

interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  number: number;
  isWrapper?: boolean; // True if this word is displayed as wrapper cells
  techniqueId?: string;
  partIndex?: number;
  segmentId?: string;
}

interface CrosswordPuzzle {
  grid: CrosswordCell[][];
  words: CrosswordWord[];
  size: number | { rows: number; cols: number };
}

interface ViewMetrics {
  viewWidth: number;
  viewHeight: number;
  gridRows: number;
  gridCols: number;
  baseCell: number;
  scaledCell: number;
  gridWidth: number;
  gridHeight: number;
  baseOffsetX: number;
  baseOffsetY: number;
}

const CROSSWORD_IMAGE_PATH = '/media/crossword/ditherlab-1766485677538.png';

const PLACEHOLDER_CONFIG = {
  position: 'center' as 'center' | 'top-right',
};

const PLACEHOLDER_LIMITS = {
  desktop: { rows: 12, cols: 12 },
  mobile: { rows: 8, cols: 8 },
};

const WRAPPER_PLACEHOLDER = '#';

const createEmptyCell = (row: number, col: number): CrosswordCell => ({
  row,
  col,
  letter: '',
  value: '',
  type: 'empty',
});

const isBlockedCellType = (type: CellType) =>
  type === 'empty' || type === 'space' || type === 'placeholder' || type === 'wrapper';

/**
 * Classifies words in a technique/kata name into grid words (letter cells) and wrapper words (text cells)
 * Examples:
 * - "Seiken Oi Tsuki (Jodan, Chudan, Gedan)" -> grid: ["Seiken", "Oi", "Tsuki"], wrapper: ["(Jodan, Chudan, Gedan)"]
 * - "Shuto Jodan Uchi Uchi" -> grid: ["Shuto", "Uchi Uchi"], wrapper: ["Jodan"]
 */
interface WordPart {
  text: string;
  isWrapper: boolean;
}

const classifyWords = (fullText: string): WordPart[] => {
  const parts: WordPart[] = [];

  // Match parentheses content as wrapper
  const parenthesesRegex = /\([^)]+\)/g;
  let lastIndex = 0;
  let match;

  while ((match = parenthesesRegex.exec(fullText)) !== null) {
    // Add text before parentheses as grid words (keep as single unit)
    if (match.index > lastIndex) {
      const beforeText = fullText.substring(lastIndex, match.index).trim();
      if (beforeText) {
        // Keep entire phrase as grid words - don't split into individual words
        parts.push({
          text: beforeText,
          isWrapper: false,
        });
      }
    }

    // Add parentheses content as wrapper
    parts.push({
      text: match[0],
      isWrapper: true,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last parentheses
  if (lastIndex < fullText.length) {
    const remainingText = fullText.substring(lastIndex).trim();
    if (remainingText) {
      // Keep entire phrase as grid words
      parts.push({
        text: remainingText,
        isWrapper: false,
      });
    }
  }

  // If no parts were created (no parentheses, single word), return as grid word
  if (parts.length === 0 && fullText.trim()) {
    parts.push({
      text: fullText.trim(),
      isWrapper: false,
    });
  }

  return parts;
};

const expandGridWithTopRightPlaceholder = (
  baseGrid: CrosswordCell[][],
  placeholder: { rows: number; cols: number },
): { grid: CrosswordCell[][]; size: { rows: number; cols: number } } => {
  const baseRows = baseGrid.length;
  const baseCols = baseGrid[0]?.length ?? 0;

  const rows = Math.max(baseRows, placeholder.rows);
  const cols = baseCols + placeholder.cols;

  const grid: CrosswordCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => createEmptyCell(r, c)),
  );

  // Copy the crossword into the top-left (0,0)
  for (let r = 0; r < baseRows; r++) {
    for (let c = 0; c < baseCols; c++) {
      const cell = baseGrid[r][c];
      grid[r][c] = { ...cell, row: r, col: c };
    }
  }

  // Mark placeholder block in top-right
  const startCol = cols - placeholder.cols;
  for (let r = 0; r < placeholder.rows; r++) {
    for (let c = startCol; c < cols; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        letter: '',
        value: '',
        type: 'placeholder',
      };
    }
  }

  return { grid, size: { rows, cols } };
};

const CardCrossword: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { decks } = useDecks();
  const { cards } = useCards();

  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentDirection, setCurrentDirection] = useState<'across' | 'down'>('across');
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<number>(3); // 1-5 scale
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffsetStart, setPanOffsetStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const hiddenInputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const placeholderImageRef = React.useRef<HTMLImageElement | null>(null);
  const touchCellRef = React.useRef<{ row: number; col: number } | null>(null);
  const cellSizeRef = React.useRef(0);
  const scaledCellSizeRef = React.useRef(0);
  const panOffsetRef = React.useRef({ x: 0, y: 0 });
  const viewMetricsRef = React.useRef({
    viewWidth: 0,
    viewHeight: 0,
    baseOffsetX: 0,
    baseOffsetY: 0,
    gridWidth: 0,
    gridHeight: 0,
    scaledCellSize: 0,
    originX: 0,
    originY: 0,
  });
  const spacePatternRef = React.useRef<CanvasPattern | null>(null);
  const spacePatternModeRef = React.useRef<'light' | 'dark' | null>(null);
  const [canvasRevision, setCanvasRevision] = useState(0);
  const [imagePlaceholder, setImagePlaceholder] = useState<{ rows: number; cols: number }>({
    rows: 12,
    cols: 12,
  });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );
  const viewportHeight = isMobile ? '100dvh' : '100vh';
  const [zoom, setZoom] = useState(1);
  const zoomRef = React.useRef(1);
  const pinchRef = React.useRef<{ distance: number; zoom: number } | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);


  const clampZoom = (value: number) => Math.min(2.5, Math.max(0.6, value));
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const getViewMetrics = useCallback(
    (zoomValue: number): ViewMetrics | null => {
      if (!puzzle || !gridContainerRef.current) return null;
      const gridRows = puzzle.grid.length;
      const gridCols = puzzle.grid[0]?.length || 0;
      if (gridRows === 0 || gridCols === 0) return null;

      const viewWidth = gridContainerRef.current.clientWidth || 1;
      const viewHeight = gridContainerRef.current.clientHeight || 1;

      const minCell = isDesktop ? 32 : 32;
      const baseCell = Math.max(
        minCell,
        Math.min(viewHeight / gridRows, viewWidth / gridCols),
      );

      const scaledCell = baseCell * zoomValue;
      const gridWidth = gridCols * scaledCell;
      const gridHeight = gridRows * scaledCell;
      const baseOffsetX = (viewWidth - gridWidth) / 2;
      const baseOffsetY = (viewHeight - gridHeight) / 2;

      return {
        viewWidth,
        viewHeight,
        gridRows,
        gridCols,
        baseCell,
        scaledCell,
        gridWidth,
        gridHeight,
        baseOffsetX,
        baseOffsetY,
      };
    },
    [puzzle, isDesktop],
  );

  const clampPanOffset = useCallback(
    (next: { x: number; y: number }, metrics: ViewMetrics | null) => {
      if (!metrics) return next;
      const { gridWidth, gridHeight, viewWidth, viewHeight, baseOffsetX, baseOffsetY } = metrics;
      let x = next.x;
      let y = next.y;

      if (gridWidth <= viewWidth) {
        x = 0;
      } else {
        const minOriginX = viewWidth - gridWidth;
        const maxOriginX = 0;
        const minPanX = minOriginX - baseOffsetX;
        const maxPanX = maxOriginX - baseOffsetX;
        x = Math.min(maxPanX, Math.max(minPanX, x));
      }

      if (gridHeight <= viewHeight) {
        y = 0;
      } else {
        const minOriginY = viewHeight - gridHeight;
        const maxOriginY = 0;
        const minPanY = minOriginY - baseOffsetY;
        const maxPanY = maxOriginY - baseOffsetY;
        y = Math.min(maxPanY, Math.max(minPanY, y));
      }

      return { x, y };
    },
    [],
  );

  const applyZoom = useCallback(
    (nextZoom: number, focalPoint?: { x: number; y: number }) => {
      if (!gridContainerRef.current || !puzzle) {
        setZoom(nextZoom);
        return;
      }

      const currentMetrics = getViewMetrics(zoomRef.current);
      const nextMetrics = getViewMetrics(nextZoom);
      if (!currentMetrics || !nextMetrics || currentMetrics.scaledCell <= 0) {
        setZoom(nextZoom);
        return;
      }

      const rect = gridContainerRef.current.getBoundingClientRect();
      const viewX = focalPoint ? focalPoint.x - rect.left : rect.width / 2;
      const viewY = focalPoint ? focalPoint.y - rect.top : rect.height / 2;

      const currentOriginX = currentMetrics.baseOffsetX + panOffsetRef.current.x;
      const currentOriginY = currentMetrics.baseOffsetY + panOffsetRef.current.y;
      const worldX = (viewX - currentOriginX) / currentMetrics.scaledCell;
      const worldY = (viewY - currentOriginY) / currentMetrics.scaledCell;

      const nextOriginX = viewX - worldX * nextMetrics.scaledCell;
      const nextOriginY = viewY - worldY * nextMetrics.scaledCell;

      const nextPan = {
        x: nextOriginX - nextMetrics.baseOffsetX,
        y: nextOriginY - nextMetrics.baseOffsetY,
      };

      zoomRef.current = nextZoom;
      setZoom(nextZoom);
      const clamped = clampPanOffset(nextPan, nextMetrics);
      panOffsetRef.current = clamped;
      setPanOffset(clamped);
    },
    [getViewMetrics, clampPanOffset, puzzle],
  );

  // Difficulty levels with reveal percentages
  const difficultyLevels = [
    { level: 1, name: 'Beginner', revealPercent: 80 },
    { level: 2, name: 'Easy', revealPercent: 60 },
    { level: 3, name: 'Medium', revealPercent: 40 },
    { level: 4, name: 'Hard', revealPercent: 20 },
    { level: 5, name: 'Expert', revealPercent: 0 },
  ];

  // Load image dimensions and calculate optimal placeholder grid size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      setImageDimensions({ width, height });
      placeholderImageRef.current = img;

      // Calculate aspect ratios
      const imageAspect = width / height;

      // Determine limits based on device
      const limits = isDesktop ? PLACEHOLDER_LIMITS.desktop : PLACEHOLDER_LIMITS.mobile;

      // Try to maximize within limits
      // Use floor to ensure we snap to the "contained" integer steps, trimming any fractional overflow
      let cols = limits.cols;
      let rows = Math.floor(cols / imageAspect);

      if (rows > limits.rows) {
        // If height exceeds limit, constrain by height instead
        rows = limits.rows;
        cols = Math.floor(rows * imageAspect);
      }

      // Ensure at least 1x1
      rows = Math.max(1, rows);
      cols = Math.max(1, cols);

      setImagePlaceholder({ rows, cols });
    };
    img.src = CROSSWORD_IMAGE_PATH;
  }, [isDesktop]);

  useEffect(() => {
    if (!gridContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      setCanvasRevision((prev) => prev + 1);
    });
    observer.observe(gridContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Get deck color for styling - using useMemo to avoid cascading renders
  const deckColor = useMemo(() => {
    if (selectedDeckId && selectedDeckId.startsWith('deck-')) {
      const gradeId = selectedDeckId.replace('deck-', '');
      const grades = KyokushinRepository.getCurriculumGrades();
      const grade = grades.find((g: GradeWithContent) => g.id === gradeId);
      if (grade) {
        return getBeltColorHex(grade.beltColor);
      }
    }
    return null;
  }, [selectedDeckId]);

  // Generate crossword puzzle
  const generatePuzzle = useCallback(() => {
    const selectedDeck = decks.find((d) => d.id === selectedDeckId);
    if (!selectedDeck) return null;

    // Get techniques and katas directly from repository to ensure we use Romaji names
    let wordList: {
      word: string;
      clue: string;
      originalName: string;
      isWrapper: boolean;
      techniqueId: string; // Track which technique this word belongs to
      partIndex: number; // Order within the technique
      segmentId?: string;
      anchorOffset?: number;
      anchorAfter?: boolean;
      wrapperSegments?: { start: number; span: number; text: string }[];
    }[] = [];

    if (selectedDeck.id.startsWith('deck-')) {
      // System deck - fetch from curriculum
      const gradeId = selectedDeck.id.replace('deck-', '');
      const grades = KyokushinRepository.getCurriculumGrades();
      const grade = grades.find((g) => g.id === gradeId);

      if (grade) {
        // Add techniques
        const techWords = grade.techniques
          .filter((tech) => tech.name.romaji) // Only include if romaji exists
          .flatMap((tech) => {
            const fullText = tech.name.romaji!.toUpperCase().replace(/[^A-Z ()]/g, ''); // Keep spaces and parentheses
            const parts = classifyWords(fullText);
            return parts.map((part, index) => ({
              word: part.text.replace(/[()]/g, ''), // Remove parentheses for processing
              clue: tech.name.en || tech.name.romaji || 'Unknown',
              originalName: part.text, // Keep original with parentheses for display
              isWrapper: part.isWrapper,
              techniqueId: `tech-${tech.id}`,
              partIndex: index,
              segmentId: `tech-${tech.id}-${index}`,
            }));
          });

        // Add katas
        const kataWords = grade.katas
          .filter((kata) => kata.name.romaji) // Only include if romaji exists
          .flatMap((kata) => {
            const fullText = kata.name.romaji!.toUpperCase().replace(/[^A-Z ()]/g, ''); // Keep spaces and parentheses
            const parts = classifyWords(fullText);
            return parts.map((part, index) => ({
              word: part.text.replace(/[()]/g, ''), // Remove parentheses for processing
              clue: kata.name.en || kata.name.romaji || 'Unknown',
              originalName: part.text, // Keep original with parentheses for display
              isWrapper: part.isWrapper,
              techniqueId: `kata-${kata.id}`,
              partIndex: index,
              segmentId: `kata-${kata.id}-${index}`,
            }));
          });

        wordList = [...techWords, ...kataWords];
      }
    } else {
      // User deck - use cards but extract Romaji from card IDs
      const deckCards = cards.filter((card) => selectedDeck.cardIds.includes(card.id));
      const allTechniques = KyokushinRepository.getAllTechniques();
      const grades = KyokushinRepository.getCurriculumGrades();
      const allKatas = grades.flatMap((g) => g.katas);

      wordList = deckCards
        .flatMap((card) => {
          // Try to find the technique or kata by ID
          const techId = card.id.replace('card-tech-', '');
          const kataId = card.id.replace('card-kata-', '');

          const tech = allTechniques.find((t) => t.id === techId);
          if (tech && tech.name.romaji) {
            const fullText = tech.name.romaji.toUpperCase().replace(/[^A-Z ()]/g, '');
            const parts = classifyWords(fullText);
            return parts.map((part, index) => ({
              word: part.text.replace(/[()]/g, ''),
              clue: tech.name.en || tech.name.romaji || 'Unknown',
              originalName: part.text,
              isWrapper: part.isWrapper,
              techniqueId: `tech-${tech.id}`,
              partIndex: index,
              segmentId: `tech-${tech.id}-${index}`,
            }));
          }

          const kata = allKatas.find((k) => k.id === kataId);
          if (kata && kata.name.romaji) {
            const fullText = kata.name.romaji.toUpperCase().replace(/[^A-Z ()]/g, '');
            const parts = classifyWords(fullText);
            return parts.map((part, index) => ({
              word: part.text.replace(/[()]/g, ''),
              clue: kata.name.en || kata.name.romaji || 'Unknown',
              originalName: part.text,
              isWrapper: part.isWrapper,
              techniqueId: `kata-${kata.id}`,
              partIndex: index,
              segmentId: `kata-${kata.id}-${index}`,
            }));
          }

          // Fallback to card data if valid
          const word = card.question.toUpperCase().replace(/[^A-Z ()]/g, '');
          if (word.length > 0) {
            const parts = classifyWords(word);
            return parts.map((part, index) => ({
              word: part.text.replace(/[()]/g, ''),
              clue: card.answer,
              originalName: part.text,
              isWrapper: part.isWrapper,
              techniqueId: `card-${card.id}`,
              partIndex: index,
              segmentId: `card-${card.id}-${index}`,
            }));
          }

          return [];
        })
        .filter((item) => item.word.length > 0);
    }

    const getWrapperSpan = (text: string) => Math.min(6, Math.max(1, Math.ceil(text.length / 7)));
    const tokenize = (text: string) =>
      text
        .split(' ')
        .map((token) => token.trim())
        .filter((token) => token.length > 0);
    const commonWordMinCount = 3;
    const tokenCounts = new Map<string, number>();

    wordList
      .filter((item) => !item.isWrapper)
      .forEach((item) => {
        tokenize(item.word).forEach((token) => {
          tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
        });
      });

    const commonTokens = new Set(
      Array.from(tokenCounts.entries())
        .filter(([, count]) => count >= commonWordMinCount)
        .map(([token]) => token),
    );

    if (commonTokens.size > 0) {
      const expandedWordList: typeof wordList = [];

      wordList.forEach((item) => {
        const segmentId = item.segmentId ?? `${item.techniqueId}-${item.partIndex}`;

        if (item.isWrapper) {
          expandedWordList.push({ ...item, segmentId });
          return;
        }

        const tokens = tokenize(item.word);
        if (tokens.length <= 1) {
          expandedWordList.push({ ...item, segmentId });
          return;
        }

        const gridIndices = new Set<number>();
        tokens.forEach((token, index) => {
          if (!commonTokens.has(token)) {
            gridIndices.add(index);
          }
        });

        let gridText = tokens.filter((_, index) => gridIndices.has(index)).join(' ').trim();
        if (gridText.length < 3) {
          for (let index = 0; index < tokens.length && gridText.length < 3; index++) {
            if (!gridIndices.has(index)) {
              gridIndices.add(index);
              gridText = tokens.filter((_, i) => gridIndices.has(i)).join(' ').trim();
            }
          }
        }

        const wrapperSegments: { start: number; span: number; text: string }[] = [];
        let wordWithWrappers = '';

        tokens.forEach((token, index) => {
          if (index > 0) {
            wordWithWrappers += ' ';
          }

          if (gridIndices.has(index)) {
            wordWithWrappers += token;
            return;
          }

          const span = getWrapperSpan(token);
          wrapperSegments.push({
            start: wordWithWrappers.length,
            span,
            text: token,
          });
          wordWithWrappers += WRAPPER_PLACEHOLDER.repeat(span);
        });

        expandedWordList.push({
          ...item,
          word: wordWithWrappers.length > 0 ? wordWithWrappers : item.word,
          originalName: item.originalName,
          isWrapper: false,
          segmentId,
          wrapperSegments,
        });
      });

      wordList = expandedWordList;
    }

    // Separate grid words from wrapper words
    const gridWords = wordList.filter((item) => !item.isWrapper);
    const wrapperWords = wordList.filter((item) => item.isWrapper);

    // Filter for reasonable word lengths
    // Grid words: 3+ chars, length cap determined by grid size
    // Wrapper words: 1-30 chars (more lenient)
    const gridWordsMinLength = gridWords.filter((item) => item.word.length >= 3);
    const maxGridWordLength = gridWordsMinLength.reduce(
      (max, item) => Math.max(max, item.word.length),
      0,
    );

    // Larger grid to fit more words and longer phrases
    const gridSize = Math.max(40, maxGridWordLength + 6);
    const maxAllowedGridWordLength = Math.max(20, gridSize - 2);

    const filteredGridWords = gridWordsMinLength
      .filter((item) => item.word.length <= maxAllowedGridWordLength)
      .sort((a, b) => b.word.length - a.word.length); // Longer words first

    const filteredWrapperWords = wrapperWords.filter(
      (item) => item.word.length >= 1 && item.word.length <= 30,
    );

    if (filteredGridWords.length < 3) return null;
    const grid: CrosswordCell[][] = Array(gridSize)
      .fill(null)
      .map((_, row) =>
        Array(gridSize)
          .fill(null)
          .map((_, col) => ({
            row,
            col,
            letter: '',
            value: '',
            type: 'empty' as CellType,
          })),
      );

    // Pre-fill placeholder if in center
    if (PLACEHOLDER_CONFIG.position === 'center') {
      const phStartRow = Math.floor((gridSize - imagePlaceholder.rows) / 2);
      const phStartCol = Math.floor((gridSize - imagePlaceholder.cols) / 2);

      for (let r = 0; r < imagePlaceholder.rows; r++) {
        for (let c = 0; c < imagePlaceholder.cols; c++) {
          if (phStartRow + r < gridSize && phStartCol + c < gridSize) {
            grid[phStartRow + r][phStartCol + c] = {
              row: phStartRow + r,
              col: phStartCol + c,
              letter: '',
              value: '',
              type: 'placeholder',
            };
          }
        }
      }
    }

    const words: CrosswordWord[] = [];
    let wordNumber = 1;

    // Place first word horizontally in the middle
    const firstWord = filteredGridWords[0];
    let startRow = Math.floor(gridSize / 2);
    const startCol = Math.floor((gridSize - firstWord.word.length) / 2);

    // If center placeholder is used, move first word to avoid it
    if (PLACEHOLDER_CONFIG.position === 'center') {
      const phStartRow = Math.floor((gridSize - imagePlaceholder.rows) / 2);
      // Try to place above the placeholder
      startRow = Math.max(0, phStartRow - 2);
    }

    const firstWordId = firstWord.segmentId ?? `${firstWord.techniqueId}-${firstWord.partIndex}`;
    const firstWrapperStartMap = new Map<number, { span: number; text: string }>();
    firstWord.wrapperSegments?.forEach((segment) => {
      firstWrapperStartMap.set(segment.start, { span: segment.span, text: segment.text });
    });

    let isFirstLetter = true;
    for (let i = 0; i < firstWord.word.length; i++) {
      const char = firstWord.word[i];
      if (char === ' ') {
        // Space - mark as black box separator
        grid[startRow][startCol + i] = {
          row: startRow,
          col: startCol + i,
          letter: '',
          value: '',
          type: 'space',
        };
      } else if (char === WRAPPER_PLACEHOLDER) {
        const segment = firstWrapperStartMap.get(i);
        grid[startRow][startCol + i] = {
          row: startRow,
          col: startCol + i,
          letter: '',
          value: '',
          type: 'wrapper',
          wrapperText: segment ? segment.text : '',
          wordId: firstWordId,
          cellSpan: segment ? segment.span : undefined,
          direction: 'across',
        };
      } else {
        // Letter
        grid[startRow][startCol + i] = {
          row: startRow,
          col: startCol + i,
          letter: char,
          value: '',
          type: isFirstLetter ? 'start' : 'filled',
          wordId: firstWordId,
          direction: 'across',
          number: isFirstLetter ? wordNumber : undefined,
        };
        isFirstLetter = false;
      }
    }

    words.push({
      id: firstWordId,
      word: firstWord.word,
      clue: firstWord.clue,
      direction: 'across',
      startRow,
      startCol,
      number: wordNumber++,
      isWrapper: false,
      techniqueId: firstWord.techniqueId,
      partIndex: firstWord.partIndex,
      segmentId: firstWord.segmentId,
    });

    const findBestPlacement = (
      word: string,
      requireIntersection: boolean,
    ): { row: number; col: number; direction: 'across' | 'down' } | null => {
      const center = Math.floor(gridSize / 2);
      let best:
        | { row: number; col: number; direction: 'across' | 'down'; intersections: number; dist: number }
        | null = null;

      const directions: Array<'across' | 'down'> = ['across', 'down'];
      for (const direction of directions) {
        const maxStartRow = direction === 'across' ? gridSize : gridSize - word.length + 1;
        const maxStartCol = direction === 'across' ? gridSize - word.length + 1 : gridSize;

        for (let startRow = 0; startRow < maxStartRow; startRow++) {
          for (let startCol = 0; startCol < maxStartCol; startCol++) {
            let intersections = 0;
            let canPlace = true;

            for (let i = 0; i < word.length; i++) {
              const checkRow = direction === 'across' ? startRow : startRow + i;
              const checkCol = direction === 'across' ? startCol + i : startCol;
              const char = word[i];
              const cell = grid[checkRow][checkCol];

              if (char === ' ') {
                if (cell.type === 'placeholder') {
                  continue;
                }
                if (cell.type !== 'empty' && cell.type !== 'space') {
                  canPlace = false;
                  break;
                }
                continue;
              }

              if (char === WRAPPER_PLACEHOLDER) {
                if (cell.type !== 'empty') {
                  canPlace = false;
                  break;
                }
                continue;
              }

              if (cell.type === 'placeholder') {
                canPlace = false;
                break;
              }

              if (cell.type !== 'empty') {
                if (cell.letter !== char) {
                  canPlace = false;
                  break;
                }
                intersections++;
              }
            }

            if (!canPlace) continue;
            if (requireIntersection && intersections === 0) continue;

            const dist = Math.abs(startRow - center) + Math.abs(startCol - center);
            if (
              !best ||
              intersections > best.intersections ||
              (intersections === best.intersections && dist < best.dist)
            ) {
              best = { row: startRow, col: startCol, direction, intersections, dist };
            }
          }
        }
      }

      if (!best) return null;
      return { row: best.row, col: best.col, direction: best.direction };
    };

    const placeWordAt = (
      currentWord: typeof filteredGridWords[number],
      startRow: number,
      startCol: number,
      direction: 'across' | 'down',
    ) => {
      const wordId = currentWord.segmentId ?? `${currentWord.techniqueId}-${currentWord.partIndex}`;
      const wrapperStartMap = new Map<number, { span: number; text: string }>();
      currentWord.wrapperSegments?.forEach((segment) => {
        wrapperStartMap.set(segment.start, { span: segment.span, text: segment.text });
      });

      let isFirstLetterInWord = true;
      for (let i = 0; i < currentWord.word.length; i++) {
        const placeRow = direction === 'across' ? startRow : startRow + i;
        const placeCol = direction === 'across' ? startCol + i : startCol;
        const char = currentWord.word[i];
        const existingCell = grid[placeRow][placeCol];

        if (existingCell.type === 'placeholder') {
          continue;
        }

        if (char === WRAPPER_PLACEHOLDER) {
          const segment = wrapperStartMap.get(i);
          grid[placeRow][placeCol] = {
            row: placeRow,
            col: placeCol,
            letter: '',
            value: '',
            type: 'wrapper',
            wrapperText: segment ? segment.text : '',
            wordId,
            cellSpan: segment ? segment.span : undefined,
            direction,
          };
          continue;
        }

        if (char === ' ') {
          if (existingCell.type === 'empty') {
            grid[placeRow][placeCol] = {
              row: placeRow,
              col: placeCol,
              letter: '',
              value: '',
              type: 'space',
            };
          }
          continue;
        }

        if (existingCell.type === 'empty') {
          grid[placeRow][placeCol] = {
            row: placeRow,
            col: placeCol,
            letter: char,
            value: '',
            type: isFirstLetterInWord ? 'start' : 'filled',
            wordId,
            direction,
            number: isFirstLetterInWord ? wordNumber : undefined,
          };
          isFirstLetterInWord = false;
          continue;
        }

        if (existingCell.type === 'start' || existingCell.type === 'filled') {
          if (isFirstLetterInWord && !existingCell.number) {
            existingCell.number = wordNumber;
            existingCell.type = 'start';
          }
          isFirstLetterInWord = false;
        }
      }

      words.push({
        id: wordId,
        word: currentWord.word,
        clue: currentWord.clue,
        direction,
        startRow,
        startCol,
        number: wordNumber++,
        isWrapper: false,
        techniqueId: currentWord.techniqueId,
        partIndex: currentWord.partIndex,
        segmentId: currentWord.segmentId,
      });
    };

    // Try to place remaining GRID words with best-fit search
    for (let i = 1; i < filteredGridWords.length; i++) {
      const currentWord = filteredGridWords[i];
      const placement =
        findBestPlacement(currentWord.word, true) ||
        findBestPlacement(currentWord.word, false);

      if (placement) {
        placeWordAt(currentWord, placement.row, placement.col, placement.direction);
      }
    }

    // Place wrapper words as text cells (not in crossword grid)
    // Position them in a compact area, e.g., bottom-right corner
    if (filteredWrapperWords.length > 0) {
      const findWrapperPlacementNearAnchor = (
        anchorRow: number,
        anchorCol: number,
        direction: 'across' | 'down',
        cellSpan: number,
        anchorAfter: boolean,
      ) => {
        const perpendicularOffsets = [1, -1, 2, -2, 3, -3];
        const alongOffsets = anchorAfter ? [1, 0] : [0, 1];

        for (const alongOffset of alongOffsets) {
          for (const perpendicularOffset of perpendicularOffsets) {
            const wrapperRow =
              direction === 'across' ? anchorRow + perpendicularOffset : anchorRow + alongOffset;
            const wrapperCol =
              direction === 'across' ? anchorCol + alongOffset : anchorCol + perpendicularOffset;

            if (wrapperRow < 0 || wrapperCol < 0) continue;
            if (wrapperRow >= gridSize || wrapperCol >= gridSize) continue;

            const endRow = direction === 'across' ? wrapperRow : wrapperRow + cellSpan - 1;
            const endCol = direction === 'across' ? wrapperCol + cellSpan - 1 : wrapperCol;
            if (endRow >= gridSize || endCol >= gridSize) continue;

            let canPlace = true;
            for (let i = 0; i < cellSpan; i++) {
              const placeRow = direction === 'across' ? wrapperRow : wrapperRow + i;
              const placeCol = direction === 'across' ? wrapperCol + i : wrapperCol;
              if (grid[placeRow][placeCol].type !== 'empty') {
                canPlace = false;
                break;
              }
            }

            if (canPlace) {
              return { wrapperRow, wrapperCol };
            }
          }
        }

        return null;
      };

      const findWrapperPlacementInline = (
        baseRow: number,
        baseCol: number,
        direction: 'across' | 'down',
        cellSpan: number,
      ) => {
        for (let offset = 0; offset < gridSize; offset++) {
          const spaceRow = direction === 'across' ? baseRow : baseRow + offset;
          const spaceCol = direction === 'across' ? baseCol + offset : baseCol;
          const wrapperRow = direction === 'across' ? baseRow : baseRow + offset + 1;
          const wrapperCol = direction === 'across' ? baseCol + offset + 1 : baseCol;

          if (wrapperRow < 0 || wrapperCol < 0) continue;
          if (wrapperRow >= gridSize || wrapperCol >= gridSize) break;

          const endRow = direction === 'across' ? wrapperRow : wrapperRow + cellSpan - 1;
          const endCol = direction === 'across' ? wrapperCol + cellSpan - 1 : wrapperCol;
          if (endRow >= gridSize || endCol >= gridSize) break;

          const spaceCell = grid[spaceRow]?.[spaceCol];
          if (!spaceCell || (spaceCell.type !== 'empty' && spaceCell.type !== 'space')) {
            continue;
          }

          let canPlace = true;
          for (let i = 0; i < cellSpan; i++) {
            const placeRow = direction === 'across' ? wrapperRow : wrapperRow + i;
            const placeCol = direction === 'across' ? wrapperCol + i : wrapperCol;
            if (grid[placeRow][placeCol].type !== 'empty') {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            return { spaceRow, spaceCol, wrapperRow, wrapperCol };
          }
        }

        return null;
      };

      // Create a map of placed grid words by techniqueId
      const placedGridWordsByTechnique = new Map<string, CrosswordWord[]>();

      words.forEach((word) => {
        if (!word.isWrapper && word.techniqueId) {
          const existing = placedGridWordsByTechnique.get(word.techniqueId) || [];
          existing.push(word);
          placedGridWordsByTechnique.set(word.techniqueId, existing);
        }
      });

      // Place each wrapper adjacent to its last grid word
      filteredWrapperWords.forEach((wrapperWord) => {
        const gridWordsFromSameTechnique = placedGridWordsByTechnique.get(wrapperWord.techniqueId);

        if (gridWordsFromSameTechnique && gridWordsFromSameTechnique.length > 0) {
          const orderedGridWords = [...gridWordsFromSameTechnique].sort(
            (a, b) => (a.partIndex ?? 0) - (b.partIndex ?? 0),
          );
          let lastGridWord =
            wrapperWord.segmentId !== undefined
              ? orderedGridWords.find((word) => word.segmentId === wrapperWord.segmentId)
              : undefined;
          if (!lastGridWord) {
            const fallback = orderedGridWords.filter(
              (word) => (word.partIndex ?? 0) <= wrapperWord.partIndex,
            );
            lastGridWord = fallback.length > 0 ? fallback[fallback.length - 1] : orderedGridWords[0];
          }

          let spaceRow: number;
          let spaceCol: number;

          if (lastGridWord.direction === 'across') {
            // Place space cell right after last letter
            spaceRow = lastGridWord.startRow;
            spaceCol = lastGridWord.startCol + lastGridWord.word.length;
          } else {
            // Place space cell right after last letter
            spaceRow = lastGridWord.startRow + lastGridWord.word.length;
            spaceCol = lastGridWord.startCol;
          }

          // Calculate cell span based on text length - more cells for longer text
          // Aim for ~6-8 characters per cell to keep cells square
          const cellSpan = getWrapperSpan(wrapperWord.originalName);

          const wordLength = Math.max(1, lastGridWord.word.length);
          const anchorOffset =
            typeof wrapperWord.anchorOffset === 'number'
              ? Math.min(Math.max(0, wrapperWord.anchorOffset), wordLength - 1)
              : wordLength - 1;
          const anchorAfter =
            typeof wrapperWord.anchorAfter === 'boolean' ? wrapperWord.anchorAfter : true;

          const anchorRow =
            lastGridWord.direction === 'across'
              ? lastGridWord.startRow
              : lastGridWord.startRow + anchorOffset;
          const anchorCol =
            lastGridWord.direction === 'across'
              ? lastGridWord.startCol + anchorOffset
              : lastGridWord.startCol;

          const placement =
            findWrapperPlacementInline(
              spaceRow,
              spaceCol,
              lastGridWord.direction,
              cellSpan,
            ) ??
            findWrapperPlacementNearAnchor(
              anchorRow,
              anchorCol,
              lastGridWord.direction,
              cellSpan,
              anchorAfter,
            );

          if (placement) {
            const wrapperId = `${
              wrapperWord.segmentId ?? `${wrapperWord.techniqueId}-${wrapperWord.partIndex}`
            }-wrapper`;

            if ('spaceRow' in placement) {
              if (grid[placement.spaceRow][placement.spaceCol].type === 'empty') {
                grid[placement.spaceRow][placement.spaceCol] = {
                  row: placement.spaceRow,
                  col: placement.spaceCol,
                  letter: '',
                  value: '',
                  type: 'space',
                };
              }
            }

            for (let i = 0; i < cellSpan; i++) {
              const placeRow =
                lastGridWord.direction === 'across'
                  ? placement.wrapperRow
                  : placement.wrapperRow + i;
              const placeCol =
                lastGridWord.direction === 'across'
                  ? placement.wrapperCol + i
                  : placement.wrapperCol;

              grid[placeRow][placeCol] = {
                row: placeRow,
                col: placeCol,
                letter: '',
                value: '',
                type: 'wrapper',
                wrapperText: i === 0 ? wrapperWord.originalName : '',
                wordId: wrapperId,
                cellSpan: i === 0 ? cellSpan : undefined, // Only first cell stores span info
                direction: lastGridWord.direction, // Store direction for rendering
              };
            }

            words.push({
              id: wrapperId,
              word: wrapperWord.word,
              clue: wrapperWord.clue,
              direction: lastGridWord.direction,
              startRow: placement.wrapperRow,
              startCol: placement.wrapperCol,
              number: wordNumber++,
              isWrapper: true,
              techniqueId: wrapperWord.techniqueId,
              partIndex: wrapperWord.partIndex,
              segmentId: wrapperWord.segmentId,
            });
          }
        }
      });
    }

    // Trim empty rows and columns from the edges
    let minRow = gridSize,
      maxRow = -1,
      minCol = gridSize,
      maxCol = -1;

    // Find bounding box including placeholders
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col].type !== 'empty') {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, col);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    // Safety check
    if (minRow > maxRow) {
      minRow = 0;
      maxRow = gridSize - 1;
      minCol = 0;
      maxCol = gridSize - 1;
    }

    // Create trimmed grid
    const trimmedGrid: CrosswordCell[][] = [];
    for (let row = minRow; row <= maxRow; row++) {
      const newRow: CrosswordCell[] = [];
      for (let col = minCol; col <= maxCol; col++) {
        const cell = grid[row][col];
        // Update cell coordinates to match new grid
        newRow.push({
          ...cell,
          row: row - minRow,
          col: col - minCol,
        });
      }
      trimmedGrid.push(newRow);
    }

    // Update word positions to match trimmed grid
    const updatedWords = words.map((word) => ({
      ...word,
      startRow: word.startRow - minRow,
      startCol: word.startCol - minCol,
    }));

    if (PLACEHOLDER_CONFIG.position === 'top-right') {
      const expanded = expandGridWithTopRightPlaceholder(trimmedGrid, imagePlaceholder);
      return { grid: expanded.grid, words: updatedWords, size: expanded.size };
    }

    return {
      grid: trimmedGrid,
      words: updatedWords,
      size: { rows: trimmedGrid.length, cols: trimmedGrid[0].length },
    };
  }, [selectedDeckId, decks, cards, imagePlaceholder]);

  const startGame = () => {
    const newPuzzle = generatePuzzle();
    if (newPuzzle) {
      // Pre-reveal letters based on difficulty with EVEN DISTRIBUTION across words
      const selectedDifficulty = difficultyLevels.find((d) => d.level === difficulty);
      if (selectedDifficulty && selectedDifficulty.revealPercent > 0) {
        const revealedCells = new Set<string>();

        // For each word, calculate how many letters to reveal
        newPuzzle.words.forEach((word) => {
          // Skip wrapper words - they don't have letter cells
          if (word.isWrapper) return;

          // Count non-space characters in the word
          const letterCount = word.word
            .split('')
            .filter((c) => c !== ' ' && c !== WRAPPER_PLACEHOLDER).length;

          // Calculate how many letters to reveal for this word
          const lettersToReveal = Math.floor(
            letterCount * (selectedDifficulty.revealPercent / 100),
          );

          // Make sure we don't reveal ALL letters (always leave at least 1)
          const safeLettersToReveal = Math.min(lettersToReveal, letterCount - 1);

          if (safeLettersToReveal > 0) {
            // Get all letter positions in this word
            const letterPositions: { row: number; col: number; index: number }[] = [];
            for (let i = 0; i < word.word.length; i++) {
              if (word.word[i] !== ' ' && word.word[i] !== WRAPPER_PLACEHOLDER) {
                const row = word.direction === 'across' ? word.startRow : word.startRow + i;
                const col = word.direction === 'across' ? word.startCol + i : word.startCol;
                letterPositions.push({ row, col, index: i });
              }
            }

            // Shuffle and pick random positions to reveal
            const shuffled = [...letterPositions].sort(() => Math.random() - 0.5);
            const positionsToReveal = shuffled.slice(0, safeLettersToReveal);

            // Reveal the selected positions
            positionsToReveal.forEach(({ row, col }) => {
              const cellKey = `${row},${col}`;
              if (!revealedCells.has(cellKey)) {
                newPuzzle.grid[row][col].value = newPuzzle.grid[row][col].letter;
                revealedCells.add(cellKey);
              }
            });
          }
        });
      }

      const resetPan = { x: 0, y: 0 };
      panOffsetRef.current = resetPan;
      setPanOffset(resetPan);
      setPuzzle(newPuzzle);
      setGameStarted(true);
      setCompletedWords(new Set());
      setSelectedCell(null);
    }
  };

  const quitGame = () => {
    const resetPan = { x: 0, y: 0 };
    panOffsetRef.current = resetPan;
    setPanOffset(resetPan);
    setGameStarted(false);
    setPuzzle(null);
    setSelectedCell(null);
    setCompletedWords(new Set());
  };

  const handleCellClick = (row: number, col: number) => {
    // Don't select cell if we were panning
    if (isPanning) return;

    if (!puzzle) return;
    const cell = puzzle.grid[row][col];
    if (isBlockedCellType(cell.type)) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction if clicking the same cell
      setCurrentDirection((prev) => (prev === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell({ row, col });
      // Set direction based on the cell's word
      if (cell.direction) {
        setCurrentDirection(cell.direction);
      }
    }

    // Focus hidden input to trigger mobile keyboard
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  // Panning handlers for desktop (mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan with left mouse button, and not if clicking on a cell
    if (e.button !== 0) return;

    setPanStart({ x: e.clientX, y: e.clientY });
    setPanOffsetStart({ x: panOffsetRef.current.x, y: panOffsetRef.current.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!panStart || !panOffsetStart) return;

    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;

    // If moved more than 5px, consider it a pan (not a click)
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      e.preventDefault(); // Prevent default drag behavior
      setIsPanning(true);
    }

    const nextPan = {
      x: panOffsetStart.x + deltaX,
      y: panOffsetStart.y + deltaY,
    };
    const metrics = getViewMetrics(zoomRef.current);
    const clamped = clampPanOffset(nextPan, metrics);
    panOffsetRef.current = clamped;
    setPanOffset(clamped);
  };

  const handleMouseUp = () => {
    setPanStart(null);
    setPanOffsetStart(null);
    // Reset panning flag after a short delay to prevent cell selection
    setTimeout(() => setIsPanning(false), 100);
  };

  // Panning handlers for mobile (touch)
  const handleTouchStartPan = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = { distance: getTouchDistance(e.touches), zoom: zoomRef.current };
      setPanStart(null);
      setPanOffsetStart(null);
      setIsPanning(true);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      return;
    }

    pinchRef.current = null;

    if (e.touches.length !== 1) return; // Only single finger

    const touch = e.touches[0];
    setPanStart({ x: touch.clientX, y: touch.clientY });
    setPanOffsetStart({ x: panOffsetRef.current.x, y: panOffsetRef.current.y });
  };

  const handleTouchMovePan = (e: React.TouchEvent) => {
    if (pinchRef.current && e.touches.length === 2) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      if (newDistance <= 0) return;
      const nextZoom = clampZoom((newDistance / pinchRef.current.distance) * pinchRef.current.zoom);
      if (nextZoom !== zoomRef.current) {
        const touchA = e.touches[0];
        const touchB = e.touches[1];
        const centerX = (touchA.clientX + touchB.clientX) / 2;
        const centerY = (touchA.clientY + touchB.clientY) / 2;
        applyZoom(nextZoom, { x: centerX, y: centerY });
      }
      pinchRef.current = { distance: newDistance, zoom: nextZoom };
      return;
    }

    if (!panStart || !panOffsetStart) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - panStart.x;
    const deltaY = touch.clientY - panStart.y;

    // If moved more than 5px, consider it a pan
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      e.preventDefault(); // Prevent default scrolling
      setIsPanning(true);
      // Cancel long-press if panning
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    }

    const nextPan = {
      x: panOffsetStart.x + deltaX,
      y: panOffsetStart.y + deltaY,
    };
    const metrics = getViewMetrics(zoomRef.current);
    const clamped = clampPanOffset(nextPan, metrics);
    panOffsetRef.current = clamped;
    setPanOffset(clamped);
  };

  const handleTouchEndPan = () => {
    setPanStart(null);
    setPanOffsetStart(null);
    pinchRef.current = null;
    // Reset panning flag after a short delay
    setTimeout(() => setIsPanning(false), 100);
  };

  const handleGridWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isDesktop) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY === 0) return;
      const nextZoom = clampZoom(zoomRef.current - e.deltaY * 0.0015);
      if (nextZoom !== zoomRef.current) {
        applyZoom(nextZoom, { x: e.clientX, y: e.clientY });
      }
    },
    [isDesktop, applyZoom],
  );

  const getCellFromClient = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current || !puzzle) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const metrics = viewMetricsRef.current;
      const size = metrics.scaledCellSize || scaledCellSizeRef.current;
      if (size <= 0) return null;
      const x = clientX - rect.left - metrics.originX;
      const y = clientY - rect.top - metrics.originY;
      if (x < 0 || y < 0) return null;
      const col = Math.floor(x / size);
      const row = Math.floor(y / size);
      if (row < 0 || col < 0) return null;
      if (row >= puzzle.grid.length || col >= puzzle.grid[0]?.length) return null;
      return { row, col };
    },
    [puzzle],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromClient(e.clientX, e.clientY);
      if (!cell) return;
      handleCellClick(cell.row, cell.col);
    },
    [getCellFromClient, handleCellClick],
  );

  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromClient(e.clientX, e.clientY);
      if (!cell) return;
      handleContextMenu(e, cell.row, cell.col);
    },
    [getCellFromClient, handleContextMenu],
  );

  const handleCanvasTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const cell = getCellFromClient(touch.clientX, touch.clientY);
      touchCellRef.current = cell;
      if (!cell) return;
      handleTouchStart(cell.row, cell.col);
    },
    [getCellFromClient, handleTouchStart],
  );

  const handleCanvasTouchEnd = useCallback(() => {
    if (touchCellRef.current && !isPanning) {
      handleCellClick(touchCellRef.current.row, touchCellRef.current.col);
    }
    touchCellRef.current = null;
    handleTouchEnd();
  }, [handleCellClick, handleTouchEnd, isPanning]);
  function handleContextMenu(e: React.MouseEvent, row: number, col: number) {
    e.preventDefault();
    if (!puzzle) return;
    const cell = puzzle.grid[row][col];
    if (isBlockedCellType(cell.type)) return;

    // Reveal the letter
    const newGrid = [...puzzle.grid];
    newGrid[row][col] = { ...cell, value: cell.letter };
    setPuzzle({ ...puzzle, grid: newGrid });
    checkWordCompletion(row, col);
  }

  // Long-press handlers for mobile
  function handleTouchStart(row: number, col: number) {
    const timer = setTimeout(() => {
      if (!puzzle) return;
      const cell = puzzle.grid[row][col];
      if (isBlockedCellType(cell.type)) return;

      // Reveal the letter on long press
      const newGrid = [...puzzle.grid];
      newGrid[row][col] = { ...cell, value: cell.letter };
      setPuzzle({ ...puzzle, grid: newGrid });
      checkWordCompletion(row, col);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  }

  function handleTouchEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!puzzle || !selectedCell) return;

    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    if (isBlockedCellType(cell.type)) return;

    if (e.key === 'Backspace') {
      // Don't clear correct letters
      if (cell.value && cell.value === cell.letter) return;

      // Clear current cell - create a proper deep copy of the grid
      const newGrid = puzzle.grid.map((row) => [...row]);
      newGrid[row][col] = { ...newGrid[row][col], value: '' };
      setPuzzle({ ...puzzle, grid: newGrid });

      // Move to previous cell
      moveToPreviousCell();
    } else if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown'
    ) {
      handleArrowKey(e.key);
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      // Don't override correct letters
      if (cell.value && cell.value === cell.letter) return;

      // Input letter - create a proper deep copy of the grid
      const newGrid = puzzle.grid.map((row) => [...row]);
      const inputLetter = e.key.toUpperCase();
      newGrid[row][col] = { ...newGrid[row][col], value: inputLetter };
      setPuzzle({ ...puzzle, grid: newGrid });

      // Check if word is complete
      checkWordCompletion(row, col);

      // Only move to next cell if the letter is correct
      if (inputLetter === cell.letter) {
        moveToNextCell();
      }
    }
  };

  const moveToNextCell = () => {
    if (!puzzle || !selectedCell) return;

    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    const maxRow = typeof puzzle.size === 'number' ? puzzle.size : puzzle.size.rows;
    const maxCol = typeof puzzle.size === 'number' ? puzzle.size : puzzle.size.cols;

    // Move to next position
    if (currentDirection === 'across') {
      newCol++;
    } else {
      newRow++;
    }

    // Find the next empty cell (skip blocked cells and cells with values)
    while (newRow < maxRow && newCol < maxCol) {
      const nextCell = puzzle.grid[newRow][newCol];

      // Skip blocked cells
      if (isBlockedCellType(nextCell.type)) {
        if (currentDirection === 'across') {
          newCol++;
        } else {
          newRow++;
        }
        continue;
      }

      // If it's a playable cell with no value, select it
      if (!nextCell.value || nextCell.value === '') {
        setSelectedCell({ row: newRow, col: newCol });
        break;
      }

      // Cell has a value, continue searching
      if (currentDirection === 'across') {
        newCol++;
      } else {
        newRow++;
      }
    }
  };

  const moveToPreviousCell = () => {
    if (!puzzle || !selectedCell) return;

    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    if (currentDirection === 'across') {
      newCol--;
    } else {
      newRow--;
    }

    if (newRow >= 0 && newCol >= 0) {
      const prevCell = puzzle.grid[newRow][newCol];
      if (!isBlockedCellType(prevCell.type)) {
        setSelectedCell({ row: newRow, col: newCol });
      }
    }
  };

  const handleArrowKey = (key: string) => {
    if (!puzzle || !selectedCell) return;

    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    switch (key) {
      case 'ArrowLeft':
        newCol--;
        setCurrentDirection('across');
        break;
      case 'ArrowRight':
        newCol++;
        setCurrentDirection('across');
        break;
      case 'ArrowUp':
        newRow--;
        setCurrentDirection('down');
        break;
      case 'ArrowDown':
        newRow++;
        setCurrentDirection('down');
        break;
    }

    // Find next valid cell in that direction
    const maxRow = typeof puzzle.size === 'number' ? puzzle.size : puzzle.size.rows;
    const maxCol = typeof puzzle.size === 'number' ? puzzle.size : puzzle.size.cols;

    while (
      newRow >= 0 &&
      newRow < maxRow &&
      newCol >= 0 &&
      newCol < maxCol &&
      isBlockedCellType(puzzle.grid[newRow][newCol].type)
    ) {
      if (key === 'ArrowLeft') newCol--;
      else if (key === 'ArrowRight') newCol++;
      else if (key === 'ArrowUp') newRow--;
      else if (key === 'ArrowDown') newRow++;
    }

    if (newRow >= 0 && newRow < maxRow && newCol >= 0 && newCol < maxCol) {
      const next = puzzle.grid[newRow][newCol];
      if (!isBlockedCellType(next.type)) {
        setSelectedCell({ row: newRow, col: newCol });
      }
    }
  };

  const checkWordCompletion = (row: number, col: number) => {
    if (!puzzle) return;

    // Find words containing this cell
    const wordsAtCell = puzzle.words.filter((word) => {
      if (word.direction === 'across') {
        return (
          row === word.startRow && col >= word.startCol && col < word.startCol + word.word.length
        );
      } else {
        return (
          col === word.startCol && row >= word.startRow && row < word.startRow + word.word.length
        );
      }
    });

    wordsAtCell.forEach((word) => {
      let isComplete = true;
      for (let i = 0; i < word.word.length; i++) {
        const checkRow = word.direction === 'across' ? word.startRow : word.startRow + i;
        const checkCol = word.direction === 'across' ? word.startCol + i : word.startCol;
        const cell = puzzle.grid[checkRow][checkCol];

        if (cell.value !== cell.letter) {
          isComplete = false;
          break;
        }
      }

      if (isComplete && !completedWords.has(word.id)) {
        setCompletedWords((prev) => new Set(prev).add(word.id));
      }
    });
  };

  const getActiveWord = useMemo(() => {
    if (!puzzle || !selectedCell) return null;

    return puzzle.words.find((word) => {
      const { row, col } = selectedCell;
      if (word.direction === currentDirection) {
        if (word.direction === 'across') {
          return (
            row === word.startRow && col >= word.startCol && col < word.startCol + word.word.length
          );
        } else {
          return (
            col === word.startCol && row >= word.startRow && row < word.startRow + word.word.length
          );
        }
      }
      return false;
    });
  }, [puzzle, selectedCell, currentDirection]);

  const progress = useMemo(() => {
    if (!puzzle) return 0;
    return Math.round((completedWords.size / puzzle.words.length) * 100);
  }, [puzzle, completedWords]);

  // Find placeholder bounds for rendering image correctly regardless of position
  const placeholderBounds = useMemo(() => {
    if (!puzzle) return null;
    let minRow = Infinity,
      minCol = Infinity;
    let maxRow = -1,
      maxCol = -1;
    let hasPlaceholder = false;

    for (let r = 0; r < puzzle.grid.length; r++) {
      for (let c = 0; c < puzzle.grid[r].length; c++) {
        if (puzzle.grid[r][c].type === 'placeholder') {
          hasPlaceholder = true;
          minRow = Math.min(minRow, r);
          minCol = Math.min(minCol, c);
          maxRow = Math.max(maxRow, r);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    if (!hasPlaceholder) return null;

    const rows = maxRow - minRow + 1;
    const cols = maxCol - minCol + 1;

    // Calculate "Cover" metrics if image dimensions are known
    let bgOffsetX = 0;
    let bgOffsetY = 0;
    let bgScaleW = cols;
    let bgScaleH = rows;

    if (imageDimensions) {
      const gridAspect = cols / rows;
      const imageAspect = imageDimensions.width / imageDimensions.height;

      if (imageAspect > gridAspect) {
        // Image is wider than grid: Fit Height, Crop Width
        bgScaleH = rows; // Total height matches grid height
        bgScaleW = rows * imageAspect; // Total width is proportional
        bgOffsetY = 0;
        bgOffsetX = (bgScaleW - cols) / 2; // Center horizontally
      } else {
        // Image is taller than grid: Fit Width, Crop Height
        bgScaleW = cols; // Total width matches grid width
        bgScaleH = cols / imageAspect; // Total height is proportional
        bgOffsetX = 0;
        bgOffsetY = (bgScaleH - rows) / 2; // Center vertically
      }
    }

    return {
      minRow,
      minCol,
      maxRow,
      maxCol,
      rows,
      cols,
      bgScaleW,
      bgScaleH,
      bgOffsetX,
      bgOffsetY,
    };
  }, [puzzle, imageDimensions]);

  const drawCanvas = useCallback(() => {
    if (!puzzle || !canvasRef.current || !gridContainerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridRows = puzzle.grid.length;
    const gridCols = puzzle.grid[0]?.length || 0;
    if (gridRows === 0 || gridCols === 0) return;

    const metrics = getViewMetrics(zoom);
    if (!metrics) return;

    const {
      viewWidth,
      viewHeight,
      baseCell,
      scaledCell,
      gridWidth,
      gridHeight,
      baseOffsetX,
      baseOffsetY,
    } = metrics;
    const scaledCellSize = scaledCell;

    cellSizeRef.current = baseCell;
    scaledCellSizeRef.current = scaledCell;

    const effectivePan = clampPanOffset(panOffset, metrics);
    const originX = baseOffsetX + effectivePan.x;
    const originY = baseOffsetY + effectivePan.y;

    viewMetricsRef.current = {
      viewWidth,
      viewHeight,
      baseOffsetX,
      baseOffsetY,
      gridWidth,
      gridHeight,
      scaledCellSize: scaledCell,
      originX,
      originY,
    };

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;
    canvas.width = Math.max(1, Math.round(viewWidth * dpr));
    canvas.height = Math.max(1, Math.round(viewHeight * dpr));

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.palette.background.default;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, originX * dpr, originY * dpr);

    const mode = theme.palette.mode;
    const wrapperBg =
      mode === 'dark' ? 'rgba(66, 165, 245, 0.35)' : 'rgba(66, 165, 245, 0.25)';
    const wrapperBorder = theme.palette.primary.main;
    const emptyBg = theme.palette.background.default;
    const defaultBg = theme.palette.background.paper;
    const activeBg = theme.palette.action.hover;
    const selectedBg = theme.palette.action.selected;
    const correctBg = theme.palette.success.light;
    const incorrectBg = theme.palette.error.light;

    if (!spacePatternRef.current || spacePatternModeRef.current !== mode) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 8;
      patternCanvas.height = 8;
      const pctx = patternCanvas.getContext('2d');
      if (pctx) {
        pctx.fillStyle = mode === 'dark' ? 'rgba(100,100,120,0.3)' : 'rgba(0,0,0,0.05)';
        pctx.fillRect(0, 0, 8, 8);
        pctx.strokeStyle = mode === 'dark' ? 'rgba(180,180,200,0.4)' : 'rgba(0,0,0,0.3)';
        pctx.lineWidth = 1;
        pctx.beginPath();
        pctx.moveTo(0, 8);
        pctx.lineTo(8, 0);
        pctx.moveTo(-4, 8);
        pctx.lineTo(4, 0);
        pctx.moveTo(4, 8);
        pctx.lineTo(12, 0);
        pctx.stroke();
      }
      spacePatternRef.current = ctx.createPattern(patternCanvas, 'repeat');
      spacePatternModeRef.current = mode;
    }

    if (placeholderBounds && placeholderImageRef.current?.complete) {
      const img = placeholderImageRef.current;
      const destX = placeholderBounds.minCol * scaledCellSize;
      const destY = placeholderBounds.minRow * scaledCellSize;
      const destW = placeholderBounds.cols * scaledCellSize;
      const destH = placeholderBounds.rows * scaledCellSize;

      const imageAspect = img.width / img.height;
      const destAspect = destW / destH;
      let drawW = destW;
      let drawH = destH;
      let drawX = destX;
      let drawY = destY;

      if (imageAspect > destAspect) {
        drawH = destH;
        drawW = destH * imageAspect;
        drawX = destX - (drawW - destW) / 2;
      } else {
        drawW = destW;
        drawH = destW / imageAspect;
        drawY = destY - (drawH - destH) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(destX, destY, destW, destH);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(destX, destY, destW, destH);
    }

    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      maxHeight: number,
      fontSize: number,
    ) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      const lineHeight = fontSize * 1.1;
      const totalHeight = lines.length * lineHeight;
      let startY = y + maxHeight / 2 - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line) => {
        ctx.fillText(line, x + maxWidth / 2, startY);
        startY += lineHeight;
      });
    };

    const wrapperCoverage = new Set<string>();
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
      for (let colIndex = 0; colIndex < gridCols; colIndex++) {
        const cell = puzzle.grid[rowIndex][colIndex];
        if (cell.type !== 'wrapper' || !cell.cellSpan || !cell.direction) continue;
        for (let i = 0; i < cell.cellSpan; i++) {
          const coverRow = cell.direction === 'across' ? rowIndex : rowIndex + i;
          const coverCol = cell.direction === 'across' ? colIndex + i : colIndex;
          if (coverRow >= gridRows || coverCol >= gridCols) break;
          wrapperCoverage.add(`${coverRow},${coverCol}`);
        }
      }
    }

    const incorrectCells: Array<{ row: number; col: number }> = [];
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
      const row = puzzle.grid[rowIndex];
      for (let colIndex = 0; colIndex < gridCols; colIndex++) {
        const cell = row[colIndex];
        const x = colIndex * scaledCellSize;
        const y = rowIndex * scaledCellSize;

        if (wrapperCoverage.has(`${rowIndex},${colIndex}`) && cell.type !== 'wrapper') {
          continue;
        }

        if (cell.type === 'placeholder') {
          continue;
        }

        if (cell.type === 'empty') {
          ctx.fillStyle = emptyBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          continue;
        }

        if (cell.type === 'space') {
          ctx.fillStyle = spacePatternRef.current || emptyBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          continue;
        }

        if (cell.type === 'wrapper') {
          if (cell.wrapperText && cell.cellSpan) {
            const spanW =
              cell.direction === 'across'
                ? scaledCellSize * cell.cellSpan
                : scaledCellSize;
            const spanH =
              cell.direction === 'down' ? scaledCellSize * cell.cellSpan : scaledCellSize;

            ctx.fillStyle = wrapperBg;
            ctx.fillRect(x, y, spanW, spanH);
            ctx.strokeStyle = wrapperBorder;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, spanW, spanH);

            const fontSize = Math.max(12, scaledCellSize * 0.35);
            ctx.fillStyle = theme.palette.text.primary;
            ctx.font = `${fontSize}px 'Caveat', cursive`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawWrappedText(cell.wrapperText, x, y, spanW, spanH, fontSize);
          }
          continue;
        }

        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
        const isInActiveWord = getActiveWord
          ? getActiveWord.direction === 'across'
            ? rowIndex === getActiveWord.startRow &&
              colIndex >= getActiveWord.startCol &&
              colIndex < getActiveWord.startCol + getActiveWord.word.length
            : colIndex === getActiveWord.startCol &&
              rowIndex >= getActiveWord.startRow &&
              rowIndex < getActiveWord.startRow + getActiveWord.word.length
          : false;

        const isCorrect = cell.value && cell.value === cell.letter;
        const isIncorrect = cell.value && cell.value !== cell.letter;

        ctx.fillStyle = defaultBg;
        ctx.fillRect(x, y, scaledCellSize, scaledCellSize);

        if (isCorrect) {
          ctx.fillStyle = correctBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        } else if (isIncorrect) {
          ctx.fillStyle = incorrectBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        } else if (isSelected) {
          ctx.fillStyle = selectedBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        } else if (isInActiveWord) {
          ctx.fillStyle = activeBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        }

        if (isIncorrect) {
          incorrectCells.push({ row: rowIndex, col: colIndex });
        }

        if (cell.number) {
          const numberSize = Math.max(10, scaledCellSize * 0.3);
          ctx.fillStyle = theme.palette.text.primary;
          ctx.font = `${numberSize}px 'Caveat', cursive`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(cell.number.toString(), x + scaledCellSize * 0.12, y + 1);
        }

        if (cell.value) {
          const letterSize = Math.max(14, scaledCellSize * 0.6);
          ctx.fillStyle = theme.palette.text.primary;
          ctx.font = `${letterSize}px 'Caveat', cursive`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.value, x + scaledCellSize / 2, y + scaledCellSize / 2);
        }
      }
    }

    const isHiddenForGrid = (rowIndex: number, colIndex: number) => {
      if (rowIndex < 0 || rowIndex >= gridRows || colIndex < 0 || colIndex >= gridCols) {
        return true;
      }
      const cell = puzzle.grid[rowIndex][colIndex];
      if (cell.type === 'placeholder') return true;
      return wrapperCoverage.has(`${rowIndex},${colIndex}`);
    };

    ctx.strokeStyle = theme.palette.divider;
    ctx.lineWidth = 1;
    const lineOffset = 0.5;
    ctx.beginPath();
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
      for (let colIndex = 0; colIndex < gridCols; colIndex++) {
        if (isHiddenForGrid(rowIndex, colIndex)) continue;
        const x = colIndex * scaledCellSize;
        const y = rowIndex * scaledCellSize;
        const x1 = x + scaledCellSize;
        const y1 = y + scaledCellSize;

        if (rowIndex === 0) {
          ctx.moveTo(x, y + lineOffset);
          ctx.lineTo(x1, y + lineOffset);
        }
        if (colIndex === 0) {
          ctx.moveTo(x + lineOffset, y);
          ctx.lineTo(x + lineOffset, y1);
        }

        if (colIndex === gridCols - 1) {
          ctx.moveTo(x1 + lineOffset, y);
          ctx.lineTo(x1 + lineOffset, y1);
        } else if (!isHiddenForGrid(rowIndex, colIndex + 1)) {
          ctx.moveTo(x1 + lineOffset, y);
          ctx.lineTo(x1 + lineOffset, y1);
        }

        if (rowIndex === gridRows - 1) {
          ctx.moveTo(x, y1 + lineOffset);
          ctx.lineTo(x1, y1 + lineOffset);
        } else if (!isHiddenForGrid(rowIndex + 1, colIndex)) {
          ctx.moveTo(x, y1 + lineOffset);
          ctx.lineTo(x1, y1 + lineOffset);
        }
      }
    }
    ctx.stroke();

    if (incorrectCells.length > 0) {
      ctx.strokeStyle = theme.palette.error.main;
      ctx.lineWidth = 2;
      incorrectCells.forEach(({ row, col }) => {
        const x = col * scaledCellSize + 1;
        const y = row * scaledCellSize + 1;
        ctx.strokeRect(x, y, scaledCellSize - 2, scaledCellSize - 2);
      });
    }

    if (selectedCell && !isBlockedCellType(puzzle.grid[selectedCell.row][selectedCell.col].type)) {
      ctx.strokeStyle = theme.palette.primary.main;
      ctx.lineWidth = 3;
      const x = selectedCell.col * scaledCellSize + 1.5;
      const y = selectedCell.row * scaledCellSize + 1.5;
      ctx.strokeRect(x, y, scaledCellSize - 3, scaledCellSize - 3);
    }
  }, [
    puzzle,
    zoom,
    theme,
    isDesktop,
    placeholderBounds,
    selectedCell,
    getActiveWord,
    getViewMetrics,
    clampPanOffset,
    panOffset,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, canvasRevision]);

  useEffect(() => {
    const metrics = getViewMetrics(zoom);
    if (!metrics) return;
    const clamped = clampPanOffset(panOffsetRef.current, metrics);
    if (clamped.x !== panOffsetRef.current.x || clamped.y !== panOffsetRef.current.y) {
      setPanOffset(clamped);
    }
  }, [zoom, puzzle, canvasRevision, getViewMetrics, clampPanOffset]);

  // Deck selection screen
  if (!gameStarted) {
    return (
      <Box>
        <Paper
          elevation={3}
          sx={{
            p: theme.spacing(4),
            maxWidth: 600,
            mx: 'auto',
            background:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h4" gutterBottom fontWeight={700}>
                Crossword Puzzle
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete the crossword using karate techniques and katas
              </Typography>
            </Box>

            <DeckSelector
              selectedDeckId={selectedDeckId}
              onDeckChange={setSelectedDeckId}
              label="Select Deck"
              filterEmpty
            />

            {/* Difficulty Selector */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600} textAlign="center">
                Select Difficulty
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level.level}
                    variant={difficulty === level.level ? 'contained' : 'outlined'}
                    onClick={() => setDifficulty(level.level)}
                    sx={{
                      minWidth: { xs: '100%', sm: 100 },
                      textTransform: 'none',
                      flexDirection: 'column',
                      py: theme.spacing(1),
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {level.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {level.revealPercent}% revealed
                    </Typography>
                  </Button>
                ))}
              </Stack>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={startGame}
              disabled={!selectedDeckId}
              sx={{
                py: theme.spacing(1.5),
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Start Puzzle
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Game screen
  return (
    <Box onKeyDown={handleKeyPress} tabIndex={0} sx={{ position: 'relative' }}>
      {/* Hidden input for mobile keyboard */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck="false"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        onInput={(e) => {
          const input = e.target as HTMLInputElement;
          const letter = input.value.toUpperCase().slice(-1);
          input.value = ''; // Clear BEFORE processing to prevent duplicate input
          if (letter && /^[A-Z]$/.test(letter)) {
            handleKeyPress({ key: letter, preventDefault: () => {} } as React.KeyboardEvent);
          }
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Backspace' || e.key.startsWith('Arrow')) {
            handleKeyPress(e as React.KeyboardEvent);
          }
        }}
      />
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: theme.spacing(0.5), sm: theme.spacing(1) },
          mb: theme.spacing(1),
          background: deckColor
            ? `linear-gradient(135deg, ${deckColor}dd 0%, ${deckColor}99 100%)`
            : theme.palette.primary.main,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
          <Stack direction="row" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
            <IconButton onClick={quitGame} sx={{ color: 'white', p: 0.5 }} size="small">
              <ArrowBack fontSize="small" />
            </IconButton>
            <IconButton
              onClick={startGame}
              sx={{ color: 'white', p: 0.5 }}
              size="small"
              title="Regenerate Puzzle"
            >
              <Refresh fontSize="small" />
            </IconButton>
            <Typography
              variant="h6"
              color="white"
              fontWeight={600}
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Crossword Puzzle
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            gap={{ xs: 0.5, sm: 1 }}
            justifyContent={{ xs: 'center', sm: 'flex-end' }}
          >
            <Chip
              label={`${completedWords.size} / ${puzzle?.words.length || 0} words`}
              color="default"
              size="small"
              sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
            <Chip
              label={`${progress}%`}
              color="success"
              size="small"
              sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
            {isFullscreen && (
              <IconButton
                onClick={toggleFullscreen}
                sx={{ color: 'white', p: 0.5 }}
                size="small"
                title="Exit Fullscreen"
              >
                <FullscreenExit fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Grid
        container
        spacing={1}
        sx={{
          height: isFullscreen
            ? `calc(${viewportHeight} - ${isMobile ? 64 : 80}px)`
            : `calc(${viewportHeight} - ${isMobile ? 150 : 180}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Crossword Grid - Full Width */}
        <Grid item xs={12} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Active Clue Display */}
          {getActiveWord && (
            <Paper
              elevation={2}
              sx={{
                p: theme.spacing(1.5),
                mb: theme.spacing(1),
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(66, 165, 245, 0.15), rgba(66, 165, 245, 0.05))'
                    : 'linear-gradient(135deg, rgba(66, 165, 245, 0.1), rgba(66, 165, 245, 0.05))',
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={getActiveWord.direction.toUpperCase()}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {getActiveWord.number}. {getActiveWord.clue}
                </Typography>
              </Stack>
            </Paper>
          )}
          <Paper
            elevation={3}
            sx={{
              p: { xs: theme.spacing(0.5), sm: theme.spacing(1) },
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(145deg, rgba(30,30,36,0.95), rgba(40,40,48,0.95))'
                  : 'rgba(255,255,255,0.9)',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              ref={gridContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStartPan}
              onTouchMove={handleTouchMovePan}
              onTouchEnd={handleTouchEndPan}
              onTouchCancel={handleTouchEndPan}
              onWheel={handleGridWheel}
              sx={{
                width: '100%',
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                overscrollBehavior: 'contain',
                cursor: isMobile ? 'auto' : panStart ? 'grabbing' : 'grab',
                userSelect: 'none',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onContextMenu={handleCanvasContextMenu}
                onTouchStart={handleCanvasTouchStart}
                onTouchEnd={handleCanvasTouchEnd}
                onTouchCancel={handleCanvasTouchEnd}
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </Box>

            {/* Hint: Right-click or long-press to reveal - Hidden in fullscreen */}
            {!isFullscreen && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                {isDesktop
                  ? 'Right-click a cell to reveal its letter'
                  : 'Long-press a cell to reveal its letter'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Completion Dialog */}
      <Dialog open={progress === 100} onClose={quitGame}>
        <DialogTitle>Congratulations! 🎉</DialogTitle>
        <DialogContent>
          <Typography>You've completed the crossword puzzle!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={quitGame}>Back to Menu</Button>
          <Button onClick={startGame} variant="contained">
            New Puzzle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CardCrossword;
