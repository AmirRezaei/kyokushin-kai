// File: ./src/app/dojo-kun/DojoKunPage.tsx

import {Box, Chip, Container, Divider, Grid, Paper, Typography, useTheme} from '@mui/material';
import React from 'react';

const DOJO_KUN_LINES = [
   {
      english: 'We will train our hearts and bodies, for a firm unshaking spirit.',
      japanese: '一、吾々は心身を錬磨し 確固不抜の心技を極めること',
      romanization: 'Hitotsu, wareware wa, shinshin o renmashi, kakko fubatsu no shingi o kiwameru koto.',
   },
   {
      english: 'We will pursue the true meaning of the Martial Way, so that in time our senses may be alert.',
      japanese: '一、吾々は武の真髄を極め 機に発し感に敏なること',
      romanization: 'Hitotsu, wareware wa, bu no shinzui o kiwame, ki ni hasshi, kan ni bin naru koto.',
   },
   {
      english: 'With true vigor, we will seek to cultivate a spirit of self-denial.',
      japanese: '一、吾々は質実剛健を以て 克己の精神を涵養すること',
      romanization: 'Hitotsu, wareware wa, shitsujitsu gōken o motte, kokki no seishin o kanyo suru koto.',
   },
   {
      english: 'We will observe the rules of courtesy, respect our superiors, and refrain from violence.',
      japanese: '一、吾々は礼節を重んじ 長上を敬し粗暴の振る舞いを慎むこと',
      romanization: 'Hitotsu, wareware wa, reisetsu o omonji, chōjō o keishi sobō no furumai o tsutsushimu koto.',
   },
   {
      english: 'We will follow our religious principles, and never forget the true virtue of humility.',
      japanese: '一、吾々は神仏を尊び 謙譲の美徳を忘れざること',
      romanization: 'Hitotsu, wareware wa, shinbutsu o tōtobi, kenjō no bitoku o wasurezaru koto.',
   },
   {
      english: 'We will look upwards to wisdom and strength, not seeking other desires.',
      japanese: '一、吾々は智性と体力とを向上させ 事に臨んで過たざること',
      romanization: 'Hitotsu, wareware wa, chisei to tairyoku to o kōjō sase, koto ni nozonde ayamatazaru koto.',
   },
   {
      english: 'All our lives, through the discipline of Karate, we will seek to fulfill the true meaning of the Kyokushin Way.',
      japanese: '一、吾々は生涯の修行を空手の道に通じ 極真の道を全うすること',
      romanization: 'Hitotsu, wareware wa, shōgai no shūgyō o karate no michi ni tsūji, Kyokushin no michi o mattō suru koto.',
   },
];

function DojoKunPage() {
   const theme = useTheme();

   return (
      <Box
         sx={{
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
         }}>
         {/* Main Content */}
         <Container
            maxWidth='lg'
            sx={{
               flexGrow: 1,
               py: {xs: 2, md: 4},
               px: {xs: 2, sm: 3, lg: 4},
            }}>
            {/* Hero Section */}
            <Box textAlign='center' mb={6} maxWidth='900px' mx='auto'>
               <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <Typography variant='h3' component='span' fontWeight='bold' sx={{mb: 2}}>
                     道場訓
                  </Typography>
                  <Typography variant='h4' component='span' sx={{fontSize: {xs: '2rem', md: '2.5rem'}}}>
                     Dojo Kun
                  </Typography>
                  <Typography variant='h5' component='span' color='text.secondary' sx={{mb: 2}}>
                     Training Hall Oath
                  </Typography>
                  <Typography
                     variant='body1'
                     color='text.secondary'
                     sx={{
                        fontFamily: 'serif',
                        lineHeight: 1.6,
                        maxWidth: '700px',
                        mx: 'auto',
                        mb: 3,
                     }}>
                     The Kyokushin Dōjō Kun was written by Mas Oyama with the help of his friend Eiji Yoshikawa. It embodies the philosophical foundation and principles of Kyokushin karate.
                  </Typography>
                  <Chip
                     label="Sosai Mas Oyama's Legacy"
                     sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
                        color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                     }}
                  />
               </Box>
            </Box>

            {/* Dojo Kun Lines */}
            <Grid container spacing={3} mb={6}>
               {DOJO_KUN_LINES.map((line, index) => (
                  <Grid item xs={12} key={index}>
                     <Paper
                        elevation={2}
                        sx={{
                           p: 3,
                           backgroundColor: theme.palette.background.paper,
                           borderRadius: 2,
                           border: `1px solid ${theme.palette.divider}`,
                        }}>
                        <Box sx={{display: 'flex', alignItems: 'flex-start', mb: 2}}>
                           <Typography
                              variant='h6'
                              sx={{
                                 minWidth: '40px',
                                 fontWeight: 'bold',
                                 color: theme.palette.primary.main,
                                 mr: 2,
                              }}>
                              {index + 1}.
                           </Typography>
                           <Box sx={{flex: 1}}>
                              <Typography
                                 variant='h6'
                                 sx={{
                                    mb: 2,
                                    fontWeight: 500,
                                    lineHeight: 1.4,
                                 }}>
                                 {line.english}
                              </Typography>
                              <Divider sx={{my: 2}} />
                              <Typography
                                 variant='body1'
                                 sx={{
                                    fontFamily: 'serif',
                                    mb: 1,
                                    color: theme.palette.text.secondary,
                                 }}>
                                 {line.japanese}
                              </Typography>
                              <Typography
                                 variant='body2'
                                 sx={{
                                    fontStyle: 'italic',
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.875rem',
                                 }}>
                                 {line.romanization}
                              </Typography>
                           </Box>
                        </Box>
                     </Paper>
                  </Grid>
               ))}
            </Grid>

            {/* Historical Context */}
            <Paper
               elevation={1}
               sx={{
                  p: 4,
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                  borderRadius: 2,
               }}>
               <Typography variant='h5' gutterBottom sx={{fontWeight: 'bold', mb: 3}}>
                  Historical Context
               </Typography>
               <Typography variant='body1' paragraph sx={{lineHeight: 1.7, mb: 3}}>
                  The Dojo Kun is usually recited at the end of each training session when the students and instructors are lined up by rank in Seiza (formal kneeling position). The most senior student will recite each line of the Dojo Kun, and the entire class will repeat it together.
               </Typography>
               <Typography variant='body1' paragraph sx={{lineHeight: 1.7, mb: 3}}>
                  Sosai Oyama was a great admirer of Miyamoto Musashi, who is Japan's most famous samurai. When he did his mountain training as a young man, it was Musashi's book, "Go Rin No Sho," that he took with him to read and study. Yoshikawa was the author of the novel "Musashi", which was
                  based on Miyamoto Musashi's life.
               </Typography>
               <Typography variant='body1' paragraph sx={{lineHeight: 1.7, mb: 2}}>
                  In the Japanese version, the number "one" (一) is stated at the beginning of each line. The significance being that no one line is superior to another, but that all are equally important.
               </Typography>
               <Typography variant='body2' sx={{fontStyle: 'italic', color: theme.palette.text.secondary}}>
                  Note: In some dojos, especially in the west, "We will follow our God..." is used in the fifth line. In other dojos (more common in the east) "We will follow our Gods and Buddha...", is used and is a more "literal" translation of Shinbutsu 神仏.
               </Typography>
            </Paper>
         </Container>
      </Box>
   );
}

export default DojoKunPage;
