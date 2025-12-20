// File: src/react-app/components/OsuNoSeishinHover.tsx
import React from 'react';
import { Box, Divider, Stack, Tooltip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type KanjiInfo = {
  char: string;
  reading?: string;
  meaningEn: string;
  meaningSv?: string;
};

type TokenInfo = {
  text: string; // 押忍 | の | 精神
  readingKana: string;
  romaji: string;
  meaningShortEn: string;
  meaningLongEn: string;
  meaningShortSv?: string;
  meaningLongSv?: string;
  kanji?: KanjiInfo[]; // omit for の
};

const TOKENS: TokenInfo[] = [
  {
    text: '押忍',
    readingKana: 'おす',
    romaji: 'osu',
    meaningShortEn: '“Osu” — acknowledgement + perseverance: push forward and endure.',
    meaningLongEn:
      '押忍 (Osu) is used in Kyokushin as “Yes / I understand / I’m ready.” It also represents the training mindset: pushing through difficulty and enduring without quitting (often explained as oshi “push” + shinobu “endure”).',
    meaningShortSv: '“Osu” — bekräftelse + uthållighet: pressa vidare och uthärda.',
    meaningLongSv:
      '押忍 (Osu) används i Kyokushin som “Ja / jag förstår / jag är redo.” Det står också för inställningen att fortsätta under press och inte ge upp.',
    kanji: [
      {
        char: '押',
        reading: 'お(す) / おし',
        meaningEn: 'Push / press forward — steady pressure through resistance.',
        meaningSv: 'Pressa / driva framåt — fortsätta trots motstånd.',
      },
      {
        char: '忍',
        reading: 'しの(ぶ)',
        meaningEn: 'Endure / persevere — patience, resilience, self-control under hardship.',
        meaningSv: 'Uthärda / kämpa vidare — tålamod, motståndskraft, självkontroll.',
      },
    ],
  },
  {
    text: 'の',
    readingKana: 'の',
    romaji: 'no',
    meaningShortEn: '“no” — the “of” connector (possessive/attributive particle).',
    meaningLongEn:
      'の links two nouns, like “of” or “’s” in English. Here it connects Osu to spirit: “the spirit of Osu.”',
    meaningShortSv: '“no” — “av”-kopplingen (äger/beskriver).',
    meaningLongSv:
      'の binder ihop två ord, ungefär som “av” eller genitiv på svenska. Här: “Osus anda / Osus spirit.”',
  },
  {
    text: '精神',
    readingKana: 'せいしん',
    romaji: 'seishin',
    meaningShortEn: 'Spirit / mindset — the inner attitude that guides actions.',
    meaningLongEn:
      '精神 (Seishin) means spirit, mentality, inner attitude. In budo it points to the disciplined mindset behind training—calm focus, determination, and character.',
    meaningShortSv: 'Ande / sinnelag — den inre inställningen som styr handlingar.',
    meaningLongSv:
      '精神 (Seishin) betyder ande, mentalitet, sinnelag. I budo handlar det om den disciplinerade inställningen bakom träningen—fokus, beslutsamhet och karaktär.',
    kanji: [
      {
        char: '精',
        reading: 'せい',
        meaningEn: 'Refined essence / focus — clarity, sincerity, mental sharpness.',
        meaningSv: 'Ren kärna / fokus — klarhet, ärlighet, mental skärpa.',
      },
      {
        char: '神',
        reading: 'しん',
        meaningEn: 'Spirit — here meaning inner spirit/mind (not necessarily religious).',
        meaningSv: 'Ande — här som inre anda/sinne (inte nödvändigtvis religiöst).',
      },
    ],
  },
];

function TooltipContent({
  token,
  activeKanji,
  locale,
}: {
  token: TokenInfo;
  activeKanji?: string;
  locale: 'en' | 'sv';
}) {
  const shortText =
    locale === 'sv' ? (token.meaningShortSv ?? token.meaningShortEn) : token.meaningShortEn;
  const longText =
    locale === 'sv' ? (token.meaningLongSv ?? token.meaningLongEn) : token.meaningLongEn;

  const kanjiRows = token.kanji ?? [];

  return (
    <Box
      sx={{
        maxWidth: 'min(360px, 90vw)',
        // Prevent horizontal overflow in ALL cases (long words/romaji, etc.)
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}
    >
      <Stack spacing={0.75}>
        {/* Header */}
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 900, lineHeight: 1.1, textAlign: 'center' }}
          >
            {token.text}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, textAlign: 'center' }}>
            {token.readingKana} · {token.romaji}
          </Typography>
        </Box>

        {/* Meaning */}
        <Box>
          <Typography variant="body1">{shortText}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {longText}
          </Typography>
        </Box>

        {/* Kanji breakdown (keeps original order; no reordering) */}
        {kanjiRows.length > 0 && (
          <>
            <Divider sx={{ opacity: 0.25 }} />
            <Stack spacing={0.6}>
              {kanjiRows.map((k) => {
                const meaning = locale === 'sv' ? (k.meaningSv ?? k.meaningEn) : k.meaningEn;
                const isActive = k.char === activeKanji;

                return (
                  <Stack
                    key={k.char}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{
                      px: 0.5,
                      py: 0.35,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: isActive ? 900 : 'inherit',
                            color: isActive ? 'red' : 'inherit',
                          }}
                        >
                          {k.char}
                          {' - '}
                          {k.reading}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{meaning}</Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}

function TokenWithTooltip({ token, locale }: { token: TokenInfo; locale: 'en' | 'sv' }) {
  const [activeKanji, setActiveKanji] = React.useState<string | undefined>(undefined);

  return (
    <Tooltip
      arrow
      placement="bottom-start"
      enterDelay={150}
      leaveDelay={250}
      enterTouchDelay={0}
      leaveTouchDelay={3500}
      disableInteractive={false}
      title={<TooltipContent token={token} activeKanji={activeKanji} locale={locale} />}
      slotProps={{
        tooltip: {
          sx: {
            // Make tooltip itself wrap and never overflow horizontally
            maxWidth: 'min(360px, 90vw)',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',

            // Lean look
            borderRadius: 2,
            px: 1.25,
            py: 1,
            boxShadow: 6,
            pointerEvents: 'auto',
          },
        },
        popper: {
          modifiers: [
            { name: 'flip', enabled: true },
            { name: 'preventOverflow', enabled: true, options: { padding: 8 } },
          ],
        },
      }}
    >
      {/* One stable wrapper per token => avoids flicker */}
      <Box
        component="span"
        onMouseLeave={() => setActiveKanji(undefined)}
        sx={{
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'baseline',
          borderRadius: 1,
          px: 0.25,

          // Requirement: red on hover, no other styling
          '&:hover': { color: 'red' },
        }}
      >
        {token.kanji?.length ? (
          token.text.split('').map((ch, idx) => (
            <Box
              key={`${token.text}-${idx}`}
              component="span"
              onMouseEnter={() => setActiveKanji(ch)}
              sx={{ display: 'inline-block' }}
            >
              {ch}
            </Box>
          ))
        ) : (
          <Box component="span">{token.text}</Box>
        )}
      </Box>
    </Tooltip>
  );
}

export function OsuNoSeishinHover({
  locale = 'en',
  textSx,
}: {
  locale?: 'en' | 'sv';
  /**
   * Optional sx for the phrase text. Example:
   * textSx={{ typography: "h4" }} or textSx={{ fontSize: 48, fontWeight: 900 }}
   */
  textSx?: SxProps<Theme>;
}) {
  return (
    <Typography component="div" sx={{ ...textSx }}>
      {TOKENS.map((t, i) => (
        <TokenWithTooltip key={`${t.text}-${i}`} token={t} locale={locale} />
      ))}
    </Typography>
  );
}
