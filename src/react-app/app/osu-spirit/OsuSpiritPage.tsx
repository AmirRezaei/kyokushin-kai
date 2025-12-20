// File: ./src/app/osu-spirit/OsuSpiritPage.tsx

import { Box, Chip, Container, Link, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';
import { OsuNoSeishinHover } from './OsuNoSeishinHover';

function OsuSpiritPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        {/* Hero Section */}
        <Box textAlign="center" mb={6} maxWidth="900px" mx="auto">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <OsuNoSeishinHover
              locale="en"
              textSx={{ typography: 'h3', fontWeight: 'bold', mb: 2 }}
            />
            <Typography
              variant="h4"
              component="span"
              sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              The Spirit of Osu
            </Typography>
            <Typography variant="h5" component="span" color="text.secondary" sx={{ mb: 2 }}>
              Osu no Seishin
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontFamily: 'serif',
                lineHeight: 1.6,
                maxWidth: '700px',
                mx: 'auto',
                mb: 2,
              }}
            >
              "Osu" (押忍) is the word you'll hear more than any other in a Kyokushin dojo. We say
              it when we bow, when we greet, when we answer a command, when we accept correction—and
              even when we acknowledge a clean, hard technique from a training partner. It's simple
              on the surface, but deep in practice:{' '}
              <strong>a single word that carries respect, readiness, and resolve.</strong>
            </Typography>
            <Chip
              label="Kyokushin Philosophy"
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
                color:
                  theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            />
          </Box>
        </Box>

        {/* What "Osu" really communicates */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}
          >
            What "Osu" really communicates
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            Depending on the moment, "Osu" can mean:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            <Typography component="li" variant="body1">
              <strong>Yes / I understand</strong> (clear, present, attentive)
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Thank you / I acknowledge you</strong> (respect without excuses)
            </Typography>
            <Typography component="li" variant="body1">
              <strong>I'm ready</strong> (body and mind aligned)
            </Typography>
            <Typography component="li" variant="body1">
              <strong>I will endure and continue</strong> (even when it's hard)
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.7, mt: 2, fontStyle: 'italic' }}>
            It's not a slogan. It's a <em>stance</em>.
          </Typography>
        </Paper>

        {/* Where the word comes from */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}
          >
            Where the word comes from
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            In Kyokushin, "Osu" is commonly explained as a contraction of two ideas:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              <strong>押し (oshi)</strong> — <em>to push</em>
            </Typography>
            <Typography component="li" variant="body1">
              <strong>忍ぶ (shinobu)</strong> — <em>to endure / persevere</em>
            </Typography>
          </Box>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            Together: <strong>to push forward while enduring pressure</strong>—not aggressively, but
            patiently and relentlessly.
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
              borderLeft: `4px solid ${theme.palette.info.main}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, fontStyle: 'italic', color: theme.palette.text.secondary }}
            >
              <strong>Note:</strong> Outside Kyokushin, you'll sometimes see other theories about
              the origin and usage of "osu/oss" in Japanese culture. Regardless of etymology
              debates, <strong>Kyokushin uses "Osu" as a practical training philosophy</strong>:
              perseverance, humility, and respectful intensity.
            </Typography>
          </Paper>
        </Paper>

        {/* Osu in training */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
          >
            Osu in training
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
            Kyokushin is demanding by design. Early on, <strong>your body wants to stop</strong>
            —lungs burn, legs shake, technique falls apart. You keep going anyway. Later,{' '}
            <strong>your mind wants to stop</strong>—boredom, frustration, doubt. You keep going
            anyway. Eventually, what carries you is something quieter and stronger:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'left',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            Osu.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            Osu shows up in the unglamorous places:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              drilling basics until they're honest,
            </Typography>
            <Typography component="li" variant="body1">
              repeating kata until timing and posture sharpen,
            </Typography>
            <Typography component="li" variant="body1">
              taking impact, standing back up, bowing, continuing,
            </Typography>
            <Typography component="li" variant="body1">
              returning after a bad session—without drama.
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            In Japanese training language, this is close to <strong>renma (錬磨)</strong>—continuous
            polishing—and <strong>mushin (無心)</strong>—"no mind," when technique becomes natural
            and unforced.
          </Typography>
        </Paper>

        {/* Perseverance as a way of life */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}
          >
            Perseverance as a way of life
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            A traditional Japanese proverb often quoted in Kyokushin is:
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              石の上にも三年 (Ishi no ue ni mo sannen)
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}
            >
              "Three years on a rock."
            </Typography>
          </Paper>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            It points to a simple truth: real change takes time, discomfort, and consistency.
            Kyokushin doesn't promise quick results. It teaches you how to stay the course.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 2 }}>
            This is what <strong>Osu no Seishin (押忍の精神)</strong>—the Spirit of Osu—means in
            daily life:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            <Typography component="li" variant="body1">
              showing up when motivation is gone,
            </Typography>
            <Typography component="li" variant="body1">
              doing the work when nobody is watching,
            </Typography>
            <Typography component="li" variant="body1">
              staying respectful under pressure,
            </Typography>
            <Typography component="li" variant="body1">
              choosing discipline over excuses,
            </Typography>
            <Typography component="li" variant="body1">
              starting again after failure.
            </Typography>
          </Box>
        </Paper>

        {/* How to live "Osu" (practical habits) */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}
          >
            How to live "Osu" (practical habits)
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.0, mb: 2 }}>
            If you want Osu to be more than a word, practice it like a technique:
          </Typography>
          <Box component="ol" sx={{ pl: 3, mb: 0 }}>
            <Typography component="li" variant="body1">
              <strong>Bow with attention</strong> — respect starts in posture.
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Answer clearly</strong> — Osu means "I heard you; I'm here."
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Accept correction immediately</strong> — no defensiveness, no delay.
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Finish the round</strong> — even if you're behind, even if you're tired.
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Do one more honest repetition</strong> — quality over ego.
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Return tomorrow</strong> — the strongest Osu is consistency.
            </Typography>
          </Box>
        </Paper>

        {/* Closing */}
        <Paper
          elevation={1}
          sx={{
            p: 4,
            mb: 2,
            backgroundColor:
              theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
            borderRadius: 2,
            textAlign: 'left',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}
          >
            Closing
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.0 }}>
            Osu is the bridge between who you are today and who you're becoming.
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Push. Endure. Keep going.
          </Typography>
          <Typography variant="body1" sx={{}}>
            That is{' '}
            <Box component="span" sx={{ fontWeight: 'bold' }}>
              Osu no Seishin.
            </Box>
          </Typography>
        </Paper>

        {/* References */}
        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            References:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <Link
                href="https://uskyokushin.com/spirit-of-osu"
                target="_blank"
                rel="noopener noreferrer"
              >
                USA-IFK Kyokushin Karate - The Spirit of Osu
              </Link>
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <Link
                href="https://www.2018.australiankyokushin.com/kyokushin/osu"
                target="_blank"
                rel="noopener noreferrer"
              >
                Australian Kyokushin - The Meaning of Osu!
              </Link>
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <Link
                href="https://www.karatebyjesse.com/meaning-oss-osu-japanese/"
                target="_blank"
                rel="noopener noreferrer"
              >
                KARATE by Jesse - The Meaning of "OSS" / "OSU"
              </Link>
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <Link
                href="https://m.facebook.com/Oyama20thAnniversary/photos/a.491205067666045/502883006498251/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Oyama Sosai Memorial 20th Anniversary - Meaning of Osu
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default OsuSpiritPage;
