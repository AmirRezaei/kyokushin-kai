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
import { useAllTechniques, useCurriculumGrades } from '@/hooks/useCatalog';

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
  numberDirection?: 'across' | 'down';
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

interface VisibleRect {
  left: number;
  top: number;
  width: number;
  height: number;
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

const isSelectableCellType = (type: CellType) =>
  type !== 'empty' && type !== 'space' && type !== 'placeholder';

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
  const { grades } = useCurriculumGrades();
  const { techniques } = useAllTechniques();

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
  const dashOffsetRef = React.useRef(0);
  const dashAnimRef = React.useRef<number | null>(null);
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const selectedBorderDashSpeed = 0.5;

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  const clampZoom = (value: number) => Math.min(2.5, Math.max(0.6, value));
  const getTouchDistance = (touches: React.TouchList) => {
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
      const baseCell = Math.max(minCell, Math.min(viewHeight / gridRows, viewWidth / gridCols));

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

  const getVisibleViewRect = useCallback((): VisibleRect | null => {
    if (!gridContainerRef.current) return null;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = viewport ? viewport.offsetLeft : 0;
    const viewportTop = viewport ? viewport.offsetTop : 0;
    const viewportWidth = viewport ? viewport.width : window.innerWidth;
    const viewportHeight = viewport ? viewport.height : window.innerHeight;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;
    const viewportShrink = viewport ? window.innerHeight - viewportHeight - viewportTop : 0;
    const keyboardInset =
      isMobile && isKeyboardVisible && viewportShrink <= 0
        ? Math.round(window.innerHeight * 0.35)
        : 0;

    const left = Math.max(rect.left, viewportLeft);
    const top = Math.max(rect.top, viewportTop);
    const right = Math.min(rect.right, viewportRight);
    const bottom = Math.min(rect.bottom, viewportBottom - keyboardInset);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    if (width <= 0 || height <= 0) {
      return { left: 0, top: 0, width: rect.width, height: rect.height };
    }

    return {
      left: left - rect.left,
      top: top - rect.top,
      width,
      height,
    };
  }, [isMobile, isKeyboardVisible]);

  const clampPanOffset = useCallback(
    (
      next: { x: number; y: number },
      metrics: ViewMetrics | null,
      visibleRect?: VisibleRect | null,
    ) => {
      if (!metrics) return next;
      const { gridWidth, gridHeight, viewWidth, viewHeight, baseOffsetX, baseOffsetY } = metrics;
      const viewLeft = visibleRect ? visibleRect.left : 0;
      const viewTop = visibleRect ? visibleRect.top : 0;
      const effectiveViewWidth = visibleRect ? visibleRect.width : viewWidth;
      const effectiveViewHeight = visibleRect ? visibleRect.height : viewHeight;
      let x = next.x;
      let y = next.y;

      const minOriginX = viewLeft + effectiveViewWidth - gridWidth;
      const maxOriginX = viewLeft;
      const rawMinPanX = minOriginX - baseOffsetX;
      const rawMaxPanX = maxOriginX - baseOffsetX;
      const minPanX = Math.min(rawMinPanX, rawMaxPanX);
      const maxPanX = Math.max(rawMinPanX, rawMaxPanX);
      x = Math.min(maxPanX, Math.max(minPanX, x));

      const minOriginY = viewTop + effectiveViewHeight - gridHeight;
      const maxOriginY = viewTop;
      const rawMinPanY = minOriginY - baseOffsetY;
      const rawMaxPanY = maxOriginY - baseOffsetY;
      const minPanY = Math.min(rawMinPanY, rawMaxPanY);
      const maxPanY = Math.max(rawMinPanY, rawMaxPanY);
      y = Math.min(maxPanY, Math.max(minPanY, y));

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
      const visibleRect = getVisibleViewRect();
      const clamped = clampPanOffset(nextPan, nextMetrics, visibleRect);
      panOffsetRef.current = clamped;
      setPanOffset(clamped);
    },
    [getViewMetrics, clampPanOffset, getVisibleViewRect, puzzle],
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
      const grade = grades.find((g) => g.id === gradeId);
      if (grade) {
        return getBeltColorHex(grade.beltColor);
      }
    }
    return null;
  }, [selectedDeckId, grades]);

  // Generate crossword puzzle
  const generatePuzzle = useCallback(() => {
    const selectedDeck = decks.find((d) => d.id === selectedDeckId);
    if (!selectedDeck) return null;

    // Get techniques and katas from catalog data to ensure we use Romaji names
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
      const allTechniques = techniques;
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

        let gridText = tokens
          .filter((_, index) => gridIndices.has(index))
          .join(' ')
          .trim();
        if (gridText.length < 3) {
          for (let index = 0; index < tokens.length && gridText.length < 3; index++) {
            if (!gridIndices.has(index)) {
              gridIndices.add(index);
              gridText = tokens
                .filter((_, i) => gridIndices.has(i))
                .join(' ')
                .trim();
            }
          }
        }

        const wrapperSegments: { start: number; span: number; text: string }[] = [];
        let wordWithWrappers = '';
        let prevWasWrapper = false;

        tokens.forEach((token, index) => {
          const isGridToken = gridIndices.has(index);
          const isWrapperToken = !isGridToken;

          if (wordWithWrappers.length > 0 && !prevWasWrapper && !isWrapperToken) {
            wordWithWrappers += ' ';
          }

          if (isGridToken) {
            wordWithWrappers += token;
          } else {
            const span = getWrapperSpan(token);
            wrapperSegments.push({
              start: wordWithWrappers.length,
              span,
              text: token,
            });
            wordWithWrappers += WRAPPER_PLACEHOLDER.repeat(span);
          }

          prevWasWrapper = isWrapperToken;
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

    let numberAssigned = false;
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
        const shouldNumber = !numberAssigned;
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
          number: shouldNumber ? wordNumber : undefined,
          numberDirection: shouldNumber ? 'across' : undefined,
        };
        if (shouldNumber) {
          numberAssigned = true;
        }
      } else {
        // Letter
        const shouldNumber = !numberAssigned;
        grid[startRow][startCol + i] = {
          row: startRow,
          col: startCol + i,
          letter: char,
          value: '',
          type: shouldNumber ? 'start' : 'filled',
          wordId: firstWordId,
          direction: 'across',
          number: shouldNumber ? wordNumber : undefined,
          numberDirection: shouldNumber ? 'across' : undefined,
        };
        if (shouldNumber) {
          numberAssigned = true;
        }
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
      let best: {
        row: number;
        col: number;
        direction: 'across' | 'down';
        intersections: number;
        dist: number;
      } | null = null;

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
      currentWord: (typeof filteredGridWords)[number],
      startRow: number,
      startCol: number,
      direction: 'across' | 'down',
    ) => {
      const wordId = currentWord.segmentId ?? `${currentWord.techniqueId}-${currentWord.partIndex}`;
      const wrapperStartMap = new Map<number, { span: number; text: string }>();
      currentWord.wrapperSegments?.forEach((segment) => {
        wrapperStartMap.set(segment.start, { span: segment.span, text: segment.text });
      });

      let numberAssigned = false;
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
          const shouldNumber = !numberAssigned;
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
            number: shouldNumber ? wordNumber : undefined,
            numberDirection: shouldNumber ? direction : undefined,
          };
          if (shouldNumber) {
            numberAssigned = true;
          }
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
          const shouldNumber = !numberAssigned;
          grid[placeRow][placeCol] = {
            row: placeRow,
            col: placeCol,
            letter: char,
            value: '',
            type: shouldNumber ? 'start' : 'filled',
            wordId,
            direction,
            number: shouldNumber ? wordNumber : undefined,
            numberDirection: shouldNumber ? direction : undefined,
          };
          if (shouldNumber) {
            numberAssigned = true;
          }
          continue;
        }

        if (existingCell.type === 'start' || existingCell.type === 'filled') {
          if (!numberAssigned && !existingCell.number) {
            existingCell.number = wordNumber;
            existingCell.type = 'start';
            existingCell.numberDirection = direction;
          }
          numberAssigned = true;
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
        findBestPlacement(currentWord.word, true) || findBestPlacement(currentWord.word, false);

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
          const wrapperRow = direction === 'across' ? baseRow : baseRow + offset;
          const wrapperCol = direction === 'across' ? baseCol + offset : baseCol;

          if (wrapperRow < 0 || wrapperCol < 0) continue;
          if (wrapperRow >= gridSize || wrapperCol >= gridSize) break;

          const endRow = direction === 'across' ? wrapperRow : wrapperRow + cellSpan - 1;
          const endCol = direction === 'across' ? wrapperCol + cellSpan - 1 : wrapperCol;
          if (endRow >= gridSize || endCol >= gridSize) break;

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
            lastGridWord =
              fallback.length > 0 ? fallback[fallback.length - 1] : orderedGridWords[0];
          }

          let spaceRow: number;
          let spaceCol: number;

          if (lastGridWord.direction === 'across') {
            // Anchor directly after the last letter (no gap cell).
            spaceRow = lastGridWord.startRow;
            spaceCol = lastGridWord.startCol + lastGridWord.word.length;
          } else {
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
            findWrapperPlacementInline(spaceRow, spaceCol, lastGridWord.direction, cellSpan) ??
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
  }, [selectedDeckId, decks, cards, imagePlaceholder, grades, techniques]);

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

  const checkWordCompletion = useCallback(
    (row: number, col: number) => {
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
    },
    [puzzle, completedWords],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (!puzzle) return;
      const cell = puzzle.grid[row][col];
      if (isBlockedCellType(cell.type)) return;

      // Reveal the letter
      const newGrid = [...puzzle.grid];
      newGrid[row][col] = { ...cell, value: cell.letter };
      setPuzzle({ ...puzzle, grid: newGrid });
      checkWordCompletion(row, col);
    },
    [puzzle, checkWordCompletion],
  );

  // Long-press handlers for mobile
  const handleTouchStart = useCallback(
    (row: number, col: number) => {
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
    },
    [puzzle, checkWordCompletion],
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const ensureCellVisible = useCallback(
    (row: number, col: number) => {
      if (!gridContainerRef.current) return;
      const metrics = getViewMetrics(zoomRef.current);
      if (!metrics) return;
      const visibleRect = getVisibleViewRect();
      if (!visibleRect) return;

      const rect = gridContainerRef.current.getBoundingClientRect();
      const originX = metrics.baseOffsetX + panOffsetRef.current.x;
      const originY = metrics.baseOffsetY + panOffsetRef.current.y;
      const cellLeft = originX + col * metrics.scaledCell;
      const cellTop = originY + row * metrics.scaledCell;
      const cellRight = cellLeft + metrics.scaledCell;
      const cellBottom = cellTop + metrics.scaledCell;

      const visibleLeft = rect.left + visibleRect.left;
      const visibleTop = rect.top + visibleRect.top;
      const visibleRight = visibleLeft + visibleRect.width;
      const visibleBottom = visibleTop + visibleRect.height;

      const padding = Math.max(12, metrics.scaledCell * 0.45);
      let deltaX = 0;
      let deltaY = 0;

      const cellLeftScreen = rect.left + cellLeft;
      const cellRightScreen = rect.left + cellRight;
      const cellTopScreen = rect.top + cellTop;
      const cellBottomScreen = rect.top + cellBottom;

      if (cellLeftScreen < visibleLeft + padding) {
        deltaX = visibleLeft + padding - cellLeftScreen;
      } else if (cellRightScreen > visibleRight - padding) {
        deltaX = visibleRight - padding - cellRightScreen;
      }

      if (cellTopScreen < visibleTop + padding) {
        deltaY = visibleTop + padding - cellTopScreen;
      } else if (cellBottomScreen > visibleBottom - padding) {
        deltaY = visibleBottom - padding - cellBottomScreen;
      }

      if (deltaX === 0 && deltaY === 0) return;

      const nextPan = {
        x: panOffsetRef.current.x + deltaX,
        y: panOffsetRef.current.y + deltaY,
      };
      const clamped = clampPanOffset(nextPan, metrics, visibleRect);
      panOffsetRef.current = clamped;
      setPanOffset(clamped);
    },
    [getViewMetrics, getVisibleViewRect, clampPanOffset],
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Don't select cell if we were panning
      if (isPanning) return;

      if (!puzzle) return;
      const cell = puzzle.grid[row][col];
      if (!isSelectableCellType(cell.type)) return;

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
        try {
          hiddenInputRef.current.focus({ preventScroll: true });
        } catch {
          hiddenInputRef.current.focus();
        }
      }

      if (isMobile && isKeyboardVisible) {
        ensureCellVisible(row, col);
      }
    },
    [isPanning, puzzle, selectedCell, isMobile, isKeyboardVisible, ensureCellVisible],
  );

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
    const visibleRect = getVisibleViewRect();
    const clamped = clampPanOffset(nextPan, metrics, visibleRect);
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
    const visibleRect = getVisibleViewRect();
    const clamped = clampPanOffset(nextPan, metrics, visibleRect);
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
      e.preventDefault();
      e.stopPropagation();
      if (!isDesktop) return;
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

  useEffect(() => {
    if (!isMobile || !selectedCell || !isKeyboardVisible) return;
    const raf = requestAnimationFrame(() => {
      ensureCellVisible(selectedCell.row, selectedCell.col);
    });
    return () => cancelAnimationFrame(raf);
  }, [isMobile, isKeyboardVisible, selectedCell, zoom, ensureCellVisible]);

  useEffect(() => {
    if (!isMobile || !selectedCell || !isKeyboardVisible || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const handleViewportChange = () => {
      ensureCellVisible(selectedCell.row, selectedCell.col);
    };
    viewport.addEventListener('resize', handleViewportChange);
    viewport.addEventListener('scroll', handleViewportChange);
    return () => {
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
    };
  }, [isMobile, isKeyboardVisible, selectedCell, ensureCellVisible]);

  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
    };

    const handleGesture = (event: Event) => {
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('gesturestart', handleGesture as EventListener, { passive: false });
    container.addEventListener('gesturechange', handleGesture as EventListener, { passive: false });
    container.addEventListener('gestureend', handleGesture as EventListener, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('gesturestart', handleGesture as EventListener);
      container.removeEventListener('gesturechange', handleGesture as EventListener);
      container.removeEventListener('gestureend', handleGesture as EventListener);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameStarted]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!puzzle || !selectedCell) return;

    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (isBlockedCellType(cell.type)) return;
      // Don't clear correct letters
      if (cell.value && cell.value === cell.letter) return;

      // Clear current cell - create a proper deep copy of the grid
      const newGrid = puzzle.grid.map((row) => [...row]);
      newGrid[row][col] = { ...newGrid[row][col], value: '' };
      setPuzzle({ ...puzzle, grid: newGrid });

      if (e.key === 'Backspace') {
        // Move to previous cell
        moveToPreviousCell();
      }
    } else if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown'
    ) {
      e.preventDefault();
      e.stopPropagation();
      handleArrowKey(e.key);
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      if (isBlockedCellType(cell.type)) return;
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

    const visibleRect = getVisibleViewRect();
    const effectivePan = clampPanOffset(panOffset, metrics, visibleRect);
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
    const wrapperBg = mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light;
    const wrapperBorder = theme.palette.primary.dark;
    const wrapperTextPadding = 4;
    const wrapperBorderWidth = 1;
    // const emptyBg = theme.palette.background.default;
    const emptyBg = mode === 'dark' ? 'rgba(0,0,0, 1)' : 'rgba(200, 200, 200, 0.22)';

    const defaultBg = theme.palette.background.paper;
    const selectedBg = theme.palette.action.selected;
    const correctBg = mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light;
    const incorrectBg = mode === 'dark' ? theme.palette.error.dark : theme.palette.error.light;
    // const activeSentenceBg = mode === 'dark' ? 'rgba(66, 165, 245, 0.18)' : 'rgba(66, 165, 245, 0.42)';
    const activeSentenceBg =
      mode === 'dark' ? 'rgba(66, 165, 245, 0.18)' : 'rgba(200, 200, 240, 0.22)';
    const activeSentenceBorder = theme.palette.primary.main;
    const activeSentenceBorderWidth = 2.5;

    // const correctBorder = theme.palette.success.main;
    const correctBorder = mode === 'dark' ? 'black' : 'white';
    const selectedBorder = theme.palette.primary.main;
    const emptyBorder = theme.palette.divider;
    const defaultBorder = theme.palette.divider;
    const activeBorder = theme.palette.primary.light;
    const incorrectBorder = theme.palette.error.main;
    const emptyBorderWidth = Math.max(1, scaledCellSize * 0.03);
    const defaultBorderWidth = Math.max(1, scaledCellSize * 0.03);
    const activeBorderWidth = Math.max(1, scaledCellSize * 0.04);
    const correctBorderWidth = Math.max(1, scaledCellSize * 0.04);
    const incorrectBorderWidth = Math.max(1, scaledCellSize * 0.05);
    const selectedBorderWidth = Math.max(2, scaledCellSize * 0.08);
    const selectedBorderRadius = Math.max(2, scaledCellSize * 0.18);
    const incorrectOutlineWidth = Math.max(1.5, scaledCellSize * 0.06);
    const incorrectOutlineRadius = Math.max(2, scaledCellSize * 0.12);
    const wrapperBorderRadius = Math.max(3, scaledCellSize * 0.16);
    const tooltipBackground = theme.palette.background.paper;
    const tooltipBorder = theme.palette.primary.main;
    const tooltipText = theme.palette.text.primary;
    const tooltipBorderWidth = 1.5;
    const tooltipBorderRadius = 10;
    const tooltipPaddingX = 10;
    const tooltipPaddingY = 6;
    const tooltipArrowSize = 8;
    const tooltipArrowGap = 6;
    const tooltipArrowScale = Math.max(0.8, scaledCellSize / 32);
    const tooltipArrowSizeScaled = tooltipArrowSize * tooltipArrowScale;
    const tooltipMaxWidth = Math.max(160, scaledCellSize * 6);
    const tooltipFontSize = Math.max(12, scaledCellSize * 0.35);
    const tooltipShadowColor = mode === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)';
    const tooltipShadowBlur = 12;
    const tooltipShadowOffsetX = 0;
    const tooltipShadowOffsetY = 6;
    const numberArrowAcrossEdgeOffset = Math.max(2, scaledCellSize * 0.008);
    const numberArrowDownEdgeOffset = Math.max(2, scaledCellSize * 0.008);
    const numberArrowAcrossLength = Math.max(6, scaledCellSize * 0.2);
    const numberArrowDownLength = Math.max(6, scaledCellSize * 0.2);
    const numberArrowAcrossHead = Math.max(3, scaledCellSize * 0.12);
    const numberArrowDownHead = Math.max(3, scaledCellSize * 0.12);
    const numberArrowAcrossOrthoOffset = 0;
    const numberArrowDownOrthoOffset = 0;
    const numberTextOffsetX = scaledCellSize * 0.012;
    const numberTextOffsetY = 2;

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
      const originalFont = ctx.font;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, maxWidth, maxHeight);
      ctx.clip();

      const innerX = x + wrapperTextPadding;
      const innerY = y + wrapperTextPadding;
      const innerW = Math.max(1, maxWidth - wrapperTextPadding * 2);
      const innerH = Math.max(1, maxHeight - wrapperTextPadding * 2);

      let currentFontSize = fontSize;
      let lines = buildWrappedLines(text, innerW);
      let lineHeight = currentFontSize * 1.1;
      let totalHeight = lines.length * lineHeight;

      while (totalHeight > innerH && currentFontSize > 8) {
        currentFontSize -= 1;
        ctx.font = `${currentFontSize}px 'Caveat', cursive`;
        lines = buildWrappedLines(text, innerW);
        lineHeight = currentFontSize * 1.1;
        totalHeight = lines.length * lineHeight;
      }

      let startY = innerY + innerH / 2 - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line) => {
        ctx.fillText(line, innerX + innerW / 2, startY);
        startY += lineHeight;
      });
      ctx.restore();
      ctx.font = originalFont;
    };

    const buildWrappedLines = (text: string, maxWidth: number) => {
      if (maxWidth <= 0) return [text];
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach((word) => {
        if (ctx.measureText(word).width > maxWidth) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          }
          let remaining = word;
          while (remaining.length > 0) {
            let sliceLength = remaining.length;
            while (
              sliceLength > 1 &&
              ctx.measureText(remaining.slice(0, sliceLength)).width > maxWidth
            ) {
              sliceLength -= 1;
            }
            if (sliceLength <= 1) {
              lines.push(remaining.slice(0, 1));
              remaining = remaining.slice(1);
            } else {
              lines.push(remaining.slice(0, sliceLength));
              remaining = remaining.slice(sliceLength);
            }
          }
          return;
        }

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

      return lines;
    };

    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      const radius = Math.max(0, Math.min(r, w / 2, h / 2));
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const drawNumberWithArrow = (
      numberValue: number,
      direction: 'across' | 'down' | undefined,
      x: number,
      y: number,
      numberSize: number,
      cellSize: number,
    ) => {
      const numberText = numberValue.toString();
      const numberX = x + numberTextOffsetX;
      const numberY = y + numberTextOffsetY;
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = `${numberSize}px 'Caveat', cursive`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(numberText, numberX, numberY);

      if (!direction) return;

      const arrowStartX =
        direction === 'across'
          ? x + numberArrowAcrossEdgeOffset
          : x + cellSize / 2 + numberArrowDownOrthoOffset;
      const arrowStartY =
        direction === 'across'
          ? y + cellSize / 2 + numberArrowAcrossOrthoOffset
          : y + numberArrowDownEdgeOffset;
      const maxArrowLength =
        direction === 'across'
          ? Math.max(0, cellSize - (arrowStartX - x) - cellSize * 0.08)
          : Math.max(0, cellSize - (arrowStartY - y) - cellSize * 0.08);
      const desiredLength =
        direction === 'across' ? numberArrowAcrossLength : numberArrowDownLength;
      const arrowLength = Math.min(desiredLength, maxArrowLength);
      if (arrowLength < 4) return;
      const desiredHead = direction === 'across' ? numberArrowAcrossHead : numberArrowDownHead;
      const headSize = Math.min(desiredHead, arrowLength * 0.6);

      ctx.fillStyle = theme.palette.text.primary;
      ctx.beginPath();

      if (direction === 'across') {
        const tipX = arrowStartX + arrowLength;
        ctx.moveTo(tipX, arrowStartY);
        ctx.lineTo(arrowStartX, arrowStartY - headSize);
        ctx.lineTo(arrowStartX, arrowStartY + headSize);
      } else {
        const tipY = arrowStartY + arrowLength;
        ctx.moveTo(arrowStartX, tipY);
        ctx.lineTo(arrowStartX - headSize, arrowStartY);
        ctx.lineTo(arrowStartX + headSize, arrowStartY);
      }

      ctx.closePath();
      ctx.fill();
    };

    const activeSentenceCells = new Set<string>();
    if (selectedCell) {
      const selectedGridCell = puzzle.grid[selectedCell.row]?.[selectedCell.col];
      let sentenceWords: CrosswordWord[] = [];

      if (selectedGridCell?.wordId) {
        const selectedWord = puzzle.words.find((word) => word.id === selectedGridCell.wordId);
        if (selectedWord?.techniqueId) {
          sentenceWords = puzzle.words.filter(
            (word) => word.techniqueId === selectedWord.techniqueId,
          );
        } else if (selectedWord) {
          sentenceWords = [selectedWord];
        }
      } else if (getActiveWord) {
        sentenceWords = [getActiveWord];
      }

      sentenceWords.forEach((word) => {
        if (word.isWrapper) {
          const startCell = puzzle.grid[word.startRow]?.[word.startCol];
          const span =
            startCell?.type === 'wrapper' && startCell.cellSpan
              ? startCell.cellSpan
              : word.word.length;
          const direction = startCell?.direction ?? word.direction;
          for (let i = 0; i < span; i++) {
            const rowIndex = direction === 'across' ? word.startRow : word.startRow + i;
            const colIndex = direction === 'across' ? word.startCol + i : word.startCol;
            if (rowIndex < 0 || colIndex < 0) continue;
            if (rowIndex >= gridRows || colIndex >= gridCols) continue;
            if (puzzle.grid[rowIndex][colIndex].type === 'placeholder') continue;
            activeSentenceCells.add(`${rowIndex},${colIndex}`);
          }
          return;
        }

        for (let i = 0; i < word.word.length; i++) {
          const rowIndex = word.direction === 'across' ? word.startRow : word.startRow + i;
          const colIndex = word.direction === 'across' ? word.startCol + i : word.startCol;
          if (rowIndex < 0 || colIndex < 0) continue;
          if (rowIndex >= gridRows || colIndex >= gridCols) continue;
          if (puzzle.grid[rowIndex][colIndex].type === 'placeholder') continue;
          activeSentenceCells.add(`${rowIndex},${colIndex}`);
        }
      });
    }

    if (activeSentenceCells.size > 0) {
      const maybeAddSpaceRun = (startRow: number, startCol: number, dr: number, dc: number) => {
        let r = startRow;
        let c = startCol;
        const run: string[] = [];
        while (r >= 0 && c >= 0 && r < gridRows && c < gridCols) {
          const cell = puzzle.grid[r][c];
          if (cell.type !== 'space') break;
          run.push(`${r},${c}`);
          r += dr;
          c += dc;
        }

        if (run.length === 0) return;
        if (r >= 0 && c >= 0 && r < gridRows && c < gridCols) {
          if (activeSentenceCells.has(`${r},${c}`)) {
            run.forEach((key) => activeSentenceCells.add(key));
          }
        }
      };

      const activeKeys = Array.from(activeSentenceCells);
      activeKeys.forEach((key) => {
        const [rowIndex, colIndex] = key.split(',').map(Number);
        const directions = [
          { dr: 0, dc: 1 },
          { dr: 0, dc: -1 },
          { dr: 1, dc: 0 },
          { dr: -1, dc: 0 },
        ];
        directions.forEach(({ dr, dc }) => {
          const nextRow = rowIndex + dr;
          const nextCol = colIndex + dc;
          if (nextRow < 0 || nextCol < 0 || nextRow >= gridRows || nextCol >= gridCols) {
            return;
          }
          if (puzzle.grid[nextRow][nextCol].type !== 'space') return;
          if (activeSentenceCells.has(`${nextRow},${nextCol}`)) return;
          maybeAddSpaceRun(nextRow, nextCol, dr, dc);
        });
      });
    }

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

    const wrapperRuns: Array<{
      startRow: number;
      startCol: number;
      endRow: number;
      endCol: number;
      direction: 'across' | 'down';
      text: string;
    }> = [];
    const visitedWrapperStarts = new Set<string>();
    const inBounds = (rowIndex: number, colIndex: number) =>
      rowIndex >= 0 && rowIndex < gridRows && colIndex >= 0 && colIndex < gridCols;

    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
      for (let colIndex = 0; colIndex < gridCols; colIndex++) {
        const cell = puzzle.grid[rowIndex][colIndex];
        if (cell.type !== 'wrapper' || !cell.wrapperText || !cell.cellSpan || !cell.direction) {
          continue;
        }

        const startKey = `${rowIndex},${colIndex}`;
        if (visitedWrapperStarts.has(startKey)) continue;

        let text = cell.wrapperText;
        let endRow =
          cell.direction === 'across' ? rowIndex : rowIndex + Math.max(1, cell.cellSpan) - 1;
        let endCol =
          cell.direction === 'across' ? colIndex + Math.max(1, cell.cellSpan) - 1 : colIndex;

        visitedWrapperStarts.add(startKey);

        let cursorRow = cell.direction === 'across' ? rowIndex : endRow + 1;
        let cursorCol = cell.direction === 'across' ? endCol + 1 : colIndex;

        while (inBounds(cursorRow, cursorCol)) {
          const nextCell = puzzle.grid[cursorRow][cursorCol];

          if (
            nextCell.type === 'wrapper' &&
            nextCell.wrapperText &&
            nextCell.cellSpan &&
            nextCell.direction === cell.direction
          ) {
            text = `${text} ${nextCell.wrapperText}`;
            visitedWrapperStarts.add(`${cursorRow},${cursorCol}`);
            endRow =
              cell.direction === 'across'
                ? cursorRow
                : cursorRow + Math.max(1, nextCell.cellSpan) - 1;
            endCol =
              cell.direction === 'across'
                ? cursorCol + Math.max(1, nextCell.cellSpan) - 1
                : cursorCol;
            cursorRow = cell.direction === 'across' ? cursorRow : endRow + 1;
            cursorCol = cell.direction === 'across' ? endCol + 1 : cursorCol;
            continue;
          }

          if (nextCell.type === 'space') {
            let spaceCount = 0;
            let spaceRow = cursorRow;
            let spaceCol = cursorCol;

            while (
              inBounds(spaceRow, spaceCol) &&
              puzzle.grid[spaceRow][spaceCol].type === 'space'
            ) {
              spaceCount++;
              if (cell.direction === 'across') {
                spaceCol++;
              } else {
                spaceRow++;
              }
            }

            if (inBounds(spaceRow, spaceCol)) {
              const afterSpace = puzzle.grid[spaceRow][spaceCol];
              if (
                afterSpace.type === 'wrapper' &&
                afterSpace.wrapperText &&
                afterSpace.cellSpan &&
                afterSpace.direction === cell.direction
              ) {
                text = `${text}${' '.repeat(spaceCount)}${afterSpace.wrapperText}`;
                visitedWrapperStarts.add(`${spaceRow},${spaceCol}`);
                endRow =
                  cell.direction === 'across'
                    ? spaceRow
                    : spaceRow + Math.max(1, afterSpace.cellSpan) - 1;
                endCol =
                  cell.direction === 'across'
                    ? spaceCol + Math.max(1, afterSpace.cellSpan) - 1
                    : spaceCol;
                cursorRow = cell.direction === 'across' ? spaceRow : endRow + 1;
                cursorCol = cell.direction === 'across' ? endCol + 1 : spaceCol;
                continue;
              }
            }
          }

          break;
        }

        wrapperRuns.push({
          startRow: rowIndex,
          startCol: colIndex,
          endRow,
          endCol,
          direction: cell.direction,
          text,
        });
      }
    }

    const hasWrapperRuns = wrapperRuns.length > 0;
    const wrapperRunCoverage = new Set<string>();
    if (hasWrapperRuns) {
      wrapperRuns.forEach((run) => {
        const spanCells =
          run.direction === 'across'
            ? run.endCol - run.startCol + 1
            : run.endRow - run.startRow + 1;
        const spanW = run.direction === 'across' ? scaledCellSize * spanCells : scaledCellSize;
        const spanH = run.direction === 'down' ? scaledCellSize * spanCells : scaledCellSize;
        const x = run.startCol * scaledCellSize;
        const y = run.startRow * scaledCellSize;

        ctx.fillStyle = wrapperBg;
        ctx.fillRect(x, y, spanW, spanH);

        for (let i = 0; i < spanCells; i++) {
          const coverRow = run.direction === 'across' ? run.startRow : run.startRow + i;
          const coverCol = run.direction === 'across' ? run.startCol + i : run.startCol;
          if (coverRow >= gridRows || coverCol >= gridCols) break;
          wrapperRunCoverage.add(`${coverRow},${coverCol}`);
        }
      });
    }

    const incorrectCells: Array<{ row: number; col: number }> = [];
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
      const row = puzzle.grid[rowIndex];
      for (let colIndex = 0; colIndex < gridCols; colIndex++) {
        const cell = row[colIndex];
        const x = colIndex * scaledCellSize;
        const y = rowIndex * scaledCellSize;

        if (hasWrapperRuns && wrapperRunCoverage.has(`${rowIndex},${colIndex}`)) {
          continue;
        }

        if (cell.type === 'placeholder') {
          continue;
        }

        const isActiveSentenceCell = activeSentenceCells.has(`${rowIndex},${colIndex}`);

        if (cell.type === 'empty') {
          ctx.fillStyle = emptyBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          if (isActiveSentenceCell) {
            ctx.fillStyle = activeSentenceBg;
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          }
          continue;
        }

        if (cell.type === 'space') {
          ctx.fillStyle = spacePatternRef.current || emptyBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          if (isActiveSentenceCell) {
            ctx.fillStyle = activeSentenceBg;
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          }
          continue;
        }

        if (cell.type === 'wrapper') {
          if (cell.wrapperText && cell.cellSpan) {
            const spanW =
              cell.direction === 'across' ? scaledCellSize * cell.cellSpan : scaledCellSize;
            const spanH =
              cell.direction === 'down' ? scaledCellSize * cell.cellSpan : scaledCellSize;

            ctx.fillStyle = wrapperBg;
            ctx.fillRect(x, y, spanW, spanH);
            if (isActiveSentenceCell) {
              ctx.fillStyle = activeSentenceBg;
              ctx.fillRect(x, y, spanW, spanH);
            }
          }
          continue;
        }

        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

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
        }

        if (isActiveSentenceCell) {
          ctx.fillStyle = activeSentenceBg;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        }

        if (isIncorrect) {
          incorrectCells.push({ row: rowIndex, col: colIndex });
        }

        if (cell.number) {
          const numberSize = Math.max(10, scaledCellSize * 0.3);
          drawNumberWithArrow(
            cell.number,
            cell.numberDirection ?? cell.direction,
            x,
            y,
            numberSize,
            scaledCellSize,
          );
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

    if (hasWrapperRuns && activeSentenceCells.size > 0) {
      ctx.fillStyle = activeSentenceBg;
      activeSentenceCells.forEach((key) => {
        if (!wrapperRunCoverage.has(key)) return;
        const [rowIndex, colIndex] = key.split(',').map(Number);
        const x = colIndex * scaledCellSize;
        const y = rowIndex * scaledCellSize;
        ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
      });
    }

    if (wrapperRuns.length > 0) {
      const fontSize = Math.max(12, scaledCellSize * 0.35);
      const numberSize = Math.max(10, scaledCellSize * 0.3);
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = `${fontSize}px 'Caveat', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      wrapperRuns.forEach((run) => {
        const spanCells =
          run.direction === 'across'
            ? run.endCol - run.startCol + 1
            : run.endRow - run.startRow + 1;
        const spanW = run.direction === 'across' ? scaledCellSize * spanCells : scaledCellSize;
        const spanH = run.direction === 'down' ? scaledCellSize * spanCells : scaledCellSize;
        const x = run.startCol * scaledCellSize;
        const y = run.startRow * scaledCellSize;
        const startCell = puzzle.grid[run.startRow]?.[run.startCol];
        if (startCell?.number) {
          drawNumberWithArrow(
            startCell.number,
            startCell.numberDirection ?? startCell.direction,
            x,
            y,
            numberSize,
            scaledCellSize,
          );
        }
        ctx.fillStyle = theme.palette.text.primary;
        ctx.font = `${fontSize}px 'Caveat', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawWrappedText(run.text, x, y, spanW, spanH, fontSize);
      });

      ctx.strokeStyle = wrapperBorder;
      ctx.lineWidth = wrapperBorderWidth;
      const inset = Math.max(1, wrapperBorderWidth * 0.5);
      wrapperRuns.forEach((run) => {
        const spanCells =
          run.direction === 'across'
            ? run.endCol - run.startCol + 1
            : run.endRow - run.startRow + 1;
        const spanW = run.direction === 'across' ? scaledCellSize * spanCells : scaledCellSize;
        const spanH = run.direction === 'down' ? scaledCellSize * spanCells : scaledCellSize;
        const x = run.startCol * scaledCellSize + inset;
        const y = run.startRow * scaledCellSize + inset;
        const w = Math.max(0, spanW - inset * 2);
        const h = Math.max(0, spanH - inset * 2);
        drawRoundedRect(x, y, w, h, wrapperBorderRadius);
        ctx.stroke();
      });
    }

    const isHiddenForGrid = (rowIndex: number, colIndex: number) => {
      if (rowIndex < 0 || rowIndex >= gridRows || colIndex < 0 || colIndex >= gridCols) {
        return true;
      }
      const cell = puzzle.grid[rowIndex][colIndex];
      if (cell.type === 'placeholder') return true;
      if (hasWrapperRuns) {
        return wrapperRunCoverage.has(`${rowIndex},${colIndex}`);
      }
      return wrapperCoverage.has(`${rowIndex},${colIndex}`);
    };

    type BorderKind = 'empty' | 'default' | 'active' | 'correct' | 'incorrect';
    const borderColors: Record<BorderKind, string> = {
      empty: emptyBorder,
      default: defaultBorder,
      active: activeBorder,
      correct: correctBorder,
      incorrect: incorrectBorder,
    };
    const borderPriority: Record<BorderKind, number> = {
      empty: 1,
      default: 2,
      active: 3,
      correct: 4,
      incorrect: 5,
    };
    const borderWidths: Record<BorderKind, number> = {
      empty: emptyBorderWidth,
      default: defaultBorderWidth,
      active: activeBorderWidth,
      correct: correctBorderWidth,
      incorrect: incorrectBorderWidth,
    };
    const pickBorder = (left: BorderKind | null, right: BorderKind | null) => {
      if (!left) return right;
      if (!right) return left;
      return borderPriority[left] >= borderPriority[right] ? left : right;
    };
    const isActiveCell = (rowIndex: number, colIndex: number) =>
      activeSentenceCells.has(`${rowIndex},${colIndex}`);
    const getBorderKind = (rowIndex: number, colIndex: number): BorderKind | null => {
      if (isHiddenForGrid(rowIndex, colIndex)) return null;
      const cell = puzzle.grid[rowIndex][colIndex];
      if (cell.type === 'empty' || cell.type === 'space') return 'empty';
      if (cell.value && cell.value === cell.letter) return 'correct';
      if (cell.value && cell.value !== cell.letter) return 'incorrect';
      if (isActiveCell(rowIndex, colIndex)) return 'active';
      return 'default';
    };

    ctx.setLineDash([]);
    let currentStroke: string | null = null;
    let currentWidth: number | null = null;
    const drawEdge = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      width: number,
      isVertical: boolean,
    ) => {
      if (currentStroke !== color) {
        ctx.strokeStyle = color;
        currentStroke = color;
      }
      if (currentWidth !== width) {
        ctx.lineWidth = width;
        currentWidth = width;
      }
      const offset = Math.round(width) % 2 === 0 ? 0 : 0.5;
      if (isVertical) {
        x1 += offset;
        x2 += offset;
      } else {
        y1 += offset;
        y2 += offset;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
      for (let colIndex = 0; colIndex < gridCols; colIndex++) {
        if (isHiddenForGrid(rowIndex, colIndex)) continue;
        const kind = getBorderKind(rowIndex, colIndex);
        if (!kind) continue;
        const x = colIndex * scaledCellSize;
        const y = rowIndex * scaledCellSize;
        const x1 = x + scaledCellSize;
        const y1 = y + scaledCellSize;

        if (rowIndex === 0) {
          drawEdge(x, y, x1, y, borderColors[kind], borderWidths[kind], false);
        }
        if (colIndex === 0) {
          drawEdge(x, y, x, y1, borderColors[kind], borderWidths[kind], true);
        }

        if (colIndex === gridCols - 1) {
          drawEdge(x1, y, x1, y1, borderColors[kind], borderWidths[kind], true);
        } else if (!isHiddenForGrid(rowIndex, colIndex + 1)) {
          const neighborKind = getBorderKind(rowIndex, colIndex + 1);
          const edgeKind = pickBorder(kind, neighborKind);
          if (edgeKind) {
            drawEdge(x1, y, x1, y1, borderColors[edgeKind], borderWidths[edgeKind], true);
          }
        }

        if (rowIndex === gridRows - 1) {
          drawEdge(x, y1, x1, y1, borderColors[kind], borderWidths[kind], false);
        } else if (!isHiddenForGrid(rowIndex + 1, colIndex)) {
          const neighborKind = getBorderKind(rowIndex + 1, colIndex);
          const edgeKind = pickBorder(kind, neighborKind);
          if (edgeKind) {
            drawEdge(x, y1, x1, y1, borderColors[edgeKind], borderWidths[edgeKind], false);
          }
        }
      }
    }

    if (activeSentenceCells.size > 0) {
      ctx.strokeStyle = activeSentenceBorder;
      ctx.lineWidth = activeSentenceBorderWidth;
      ctx.setLineDash([]);
      const sentenceOffset = activeSentenceBorderWidth % 2 === 0 ? 0 : 0.5;
      ctx.beginPath();
      activeSentenceCells.forEach((key) => {
        const [rowIndex, colIndex] = key.split(',').map(Number);
        const x = colIndex * scaledCellSize;
        const y = rowIndex * scaledCellSize;
        const x1 = x + scaledCellSize;
        const y1 = y + scaledCellSize;

        const topKey = `${rowIndex - 1},${colIndex}`;
        const leftKey = `${rowIndex},${colIndex - 1}`;
        const rightKey = `${rowIndex},${colIndex + 1}`;
        const bottomKey = `${rowIndex + 1},${colIndex}`;

        if (!activeSentenceCells.has(topKey)) {
          ctx.moveTo(x, y + sentenceOffset);
          ctx.lineTo(x1, y + sentenceOffset);
        }
        if (!activeSentenceCells.has(leftKey)) {
          ctx.moveTo(x + sentenceOffset, y);
          ctx.lineTo(x + sentenceOffset, y1);
        }
        if (!activeSentenceCells.has(rightKey)) {
          ctx.moveTo(x1 + sentenceOffset, y);
          ctx.lineTo(x1 + sentenceOffset, y1);
        }
        if (!activeSentenceCells.has(bottomKey)) {
          ctx.moveTo(x, y1 + sentenceOffset);
          ctx.lineTo(x1, y1 + sentenceOffset);
        }
      });
      ctx.stroke();
    }

    if (incorrectCells.length > 0) {
      ctx.strokeStyle = incorrectBorder;
      ctx.lineWidth = incorrectOutlineWidth;
      ctx.setLineDash([]);
      const inset = Math.max(1, incorrectOutlineWidth * 0.5);
      incorrectCells.forEach(({ row, col }) => {
        const x = col * scaledCellSize + inset;
        const y = row * scaledCellSize + inset;
        drawRoundedRect(
          x,
          y,
          scaledCellSize - inset * 2,
          scaledCellSize - inset * 2,
          incorrectOutlineRadius,
        );
        ctx.stroke();
      });
    }

    if (selectedCell && !isBlockedCellType(puzzle.grid[selectedCell.row][selectedCell.col].type)) {
      const dashSize = Math.max(4, Math.round(scaledCellSize * 0.15));
      ctx.strokeStyle = selectedBorder;
      ctx.lineWidth = selectedBorderWidth;
      ctx.setLineDash([dashSize, dashSize]);
      ctx.lineDashOffset = dashOffsetRef.current;
      const inset = Math.max(1, selectedBorderWidth * 0.5);
      const x = selectedCell.col * scaledCellSize + inset;
      const y = selectedCell.row * scaledCellSize + inset;
      drawRoundedRect(
        x,
        y,
        scaledCellSize - inset * 2,
        scaledCellSize - inset * 2,
        selectedBorderRadius,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (selectedCell) {
      const cellX = selectedCell.col * scaledCellSize;
      const cellY = selectedCell.row * scaledCellSize;
      const cellCenterX = cellX + scaledCellSize / 2;
      const cellCenterY = cellY + scaledCellSize / 2;
      const selectedGridCell = puzzle.grid[selectedCell.row]?.[selectedCell.col];
      const selectedWord = selectedGridCell?.wordId
        ? puzzle.words.find((word) => word.id === selectedGridCell.wordId)
        : null;
      const tooltipWord = selectedWord ?? getActiveWord;
      if (!tooltipWord) return;
      const tooltipTextValue = `${tooltipWord.number}. ${tooltipWord.clue}`;
      const tooltipDirection = tooltipWord.direction;

      ctx.save();
      ctx.font = `${tooltipFontSize}px 'Caveat', cursive`;
      const maxTextWidth = Math.max(10, tooltipMaxWidth - tooltipPaddingX * 2);
      const lines = buildWrappedLines(tooltipTextValue, maxTextWidth);
      const lineHeight = tooltipFontSize * 1.2;
      const textWidth =
        Math.min(
          tooltipMaxWidth,
          Math.max(...lines.map((line) => ctx.measureText(line).width), 0) + tooltipPaddingX * 2,
        ) || tooltipMaxWidth;
      const textHeight = lines.length * lineHeight + tooltipPaddingY * 2;

      const viewMinX = -originX;
      const viewMaxX = viewMinX + viewWidth;
      const viewMinY = -originY;
      const viewMaxY = viewMinY + viewHeight;

      let tooltipX = cellCenterX - textWidth / 2;
      let tooltipY = cellY - textHeight - tooltipArrowSizeScaled - tooltipArrowGap;
      let arrowMode: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

      if (tooltipDirection === 'down') {
        const desiredRight = cellX + scaledCellSize + tooltipArrowSizeScaled + tooltipArrowGap;
        tooltipX = desiredRight;
        arrowMode = 'left';
        if (tooltipX + textWidth > viewMaxX - 4) {
          tooltipX = cellX - textWidth - tooltipArrowSizeScaled - tooltipArrowGap;
          arrowMode = 'right';
        }
        tooltipX = Math.min(viewMaxX - textWidth - 4, Math.max(viewMinX + 4, tooltipX));
        tooltipY = cellCenterY - textHeight / 2;
        tooltipY = Math.min(viewMaxY - textHeight - 4, Math.max(viewMinY + 4, tooltipY));
      } else {
        tooltipX = Math.min(viewMaxX - textWidth - 4, Math.max(viewMinX + 4, tooltipX));
        tooltipY = cellY - textHeight - tooltipArrowSizeScaled - tooltipArrowGap;
        arrowMode = 'bottom';
        if (tooltipY < viewMinY + 4) {
          tooltipY = cellY + scaledCellSize + tooltipArrowSizeScaled + tooltipArrowGap;
          arrowMode = 'top';
        }

        if (tooltipY + textHeight > viewMaxY - 4) {
          tooltipY = Math.max(viewMinY + 4, viewMaxY - textHeight - 4);
        }
      }

      ctx.shadowColor = tooltipShadowColor;
      ctx.shadowBlur = tooltipShadowBlur;
      ctx.shadowOffsetX = tooltipShadowOffsetX;
      ctx.shadowOffsetY = tooltipShadowOffsetY;

      drawRoundedRect(tooltipX, tooltipY, textWidth, textHeight, tooltipBorderRadius);
      ctx.fillStyle = tooltipBackground;
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = tooltipBorder;
      ctx.lineWidth = tooltipBorderWidth;
      ctx.stroke();

      const arrowCenterX = Math.min(
        tooltipX + textWidth - tooltipBorderRadius,
        Math.max(tooltipX + tooltipBorderRadius, cellCenterX),
      );
      const arrowCenterY = Math.min(
        tooltipY + textHeight - tooltipBorderRadius,
        Math.max(tooltipY + tooltipBorderRadius, cellCenterY),
      );

      ctx.beginPath();
      if (arrowMode === 'top' || arrowMode === 'bottom') {
        const arrowBaseY = arrowMode === 'top' ? tooltipY : tooltipY + textHeight;
        const arrowTipY =
          arrowMode === 'top'
            ? tooltipY - tooltipArrowSizeScaled
            : tooltipY + textHeight + tooltipArrowSizeScaled;
        ctx.moveTo(arrowCenterX - tooltipArrowSizeScaled, arrowBaseY);
        ctx.lineTo(arrowCenterX + tooltipArrowSizeScaled, arrowBaseY);
        ctx.lineTo(arrowCenterX, arrowTipY);
      } else {
        const arrowBaseX = arrowMode === 'left' ? tooltipX : tooltipX + textWidth;
        const arrowTipX =
          arrowMode === 'left'
            ? tooltipX - tooltipArrowSizeScaled
            : tooltipX + textWidth + tooltipArrowSizeScaled;
        ctx.moveTo(arrowBaseX, arrowCenterY - tooltipArrowSizeScaled);
        ctx.lineTo(arrowBaseX, arrowCenterY + tooltipArrowSizeScaled);
        ctx.lineTo(arrowTipX, arrowCenterY);
      }
      ctx.closePath();
      ctx.fillStyle = tooltipBackground;
      ctx.fill();
      ctx.strokeStyle = tooltipBorder;
      ctx.stroke();

      ctx.fillStyle = tooltipText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      let textY = tooltipY + tooltipPaddingY;
      lines.forEach((line) => {
        ctx.fillText(line, tooltipX + textWidth / 2, textY);
        textY += lineHeight;
      });

      ctx.restore();
    }
  }, [
    puzzle,
    zoom,
    theme,
    placeholderBounds,
    selectedCell,
    getActiveWord,
    getViewMetrics,
    getVisibleViewRect,
    clampPanOffset,
    panOffset,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, canvasRevision]);

  useEffect(() => {
    if (!selectedCell) {
      if (dashAnimRef.current !== null) {
        cancelAnimationFrame(dashAnimRef.current);
        dashAnimRef.current = null;
      }
      return;
    }

    let isActive = true;
    const tick = () => {
      if (!isActive) return;
      dashOffsetRef.current = (dashOffsetRef.current - selectedBorderDashSpeed) % 1000;
      drawCanvas();
      dashAnimRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      isActive = false;
      if (dashAnimRef.current !== null) {
        cancelAnimationFrame(dashAnimRef.current);
        dashAnimRef.current = null;
      }
    };
  }, [selectedCell, drawCanvas]);

  useEffect(() => {
    const metrics = getViewMetrics(zoom);
    if (!metrics) return;
    const visibleRect = getVisibleViewRect();
    const clamped = clampPanOffset(panOffsetRef.current, metrics, visibleRect);
    if (clamped.x !== panOffsetRef.current.x || clamped.y !== panOffsetRef.current.y) {
      setPanOffset(clamped);
    }
  }, [zoom, puzzle, canvasRevision, getViewMetrics, getVisibleViewRect, clampPanOffset]);

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
        onFocus={() => setIsKeyboardVisible(true)}
        onBlur={() => setIsKeyboardVisible(false)}
        style={{
          position: 'fixed',
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
          if (e.key === 'Backspace' || e.key === 'Delete' || e.key.startsWith('Arrow')) {
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
