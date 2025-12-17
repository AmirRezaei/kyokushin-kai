// HEADER-START
// * Path: ./src/BreathingTechniquesPage.tsx
// HEADER-END

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';
// Interface for each breathing technique
interface BreathingTechnique {
   nameEn: string;
   nameJp: string;
   type: string;
   description: string;
   usage: string;
}

// Data for breathing techniques
const breathingTechniques: BreathingTechnique[] = [
   {
      nameEn: 'Ibuki',
      nameJp: '息吹',
      type: 'Tension Breathing',
      description:
         'Ibuki is a powerful breathing technique that involves tensing the body and forcefully exhaling through the nose. The breath is controlled and sharp, often accompanied by muscle contraction, especially in the abdomen. This method helps to align the body, generate internal power, and harden the muscles to absorb strikes. The breathing pace is typically slow on the inhale, followed by a quick, forceful exhalation.',
      usage: 'Ibuki is often practiced during katas like Sanchin, where the focus is on strengthening the core and solidifying the body’s structure. It’s also useful in sparring or self-defense situations where endurance and focus are essential. The practitioner can use Ibuki to brace for impact and build concentration.',
   },
   {
      nameEn: 'Nogare',
      nameJp: '逃れ',
      type: 'Relaxation Breathing',
      description:
         'Nogare is a gentle, flowing breathing technique that emphasizes relaxation and smooth airflow. In contrast to Ibuki, Nogare focuses on letting go of tension and facilitating smooth transitions between movements. Inhalation is long and deep, and exhalation is slow and controlled, helping the practitioner release any pent-up tension.',
      usage: 'Nogare breathing is typically used after high-intensity movements or techniques. It is helpful between rounds of sparring or between katas to calm the mind and body. It brings the body back into a balanced state, promoting recovery and maintaining fluid movement during training.',
   },
   {
      nameEn: 'Kiai',
      nameJp: '気合',
      type: 'Expulsion Breathing',
      description:
         "Kiai is a short, explosive breathing technique combined with a loud shout, designed to project energy outward and intimidate opponents. The exhalation is rapid and forceful, and the accompanying shout can help synchronize the body’s physical power with mental focus. Kiai can also disrupt the opponent's concentration and create a psychological advantage.",
      usage: 'Kiai is used during key moments in kata and sparring when executing powerful strikes, blocks, or kicks. It is often performed at the peak of a technique to maximize its impact. In combat, it is a tool to unnerve opponents and break their rhythm. It is also employed to release internal energy and amplify the force of a strike.',
   },
   {
      nameEn: 'Mokuso',
      nameJp: '黙想',
      type: 'Meditative Breathing',
      description:
         'Mokuso is a deep and calm breathing technique used to clear the mind and prepare the body for training. The breathing is slow and deliberate, focusing on the diaphragm. This technique helps practitioners enter a meditative state, allowing them to let go of distractions and focus on the present moment. It brings mental clarity and emotional stability.',
      usage: 'Mokuso is typically performed at the beginning and end of a training session, or before starting a kata. It prepares the practitioner mentally and physically by creating a calm, focused state. It’s also used to wind down after an intense training session, ensuring the mind and body are in harmony before and after practice.',
   },
   {
      nameEn: 'Sanchin Breathing',
      nameJp: 'Sanchin',
      type: 'Controlled Breathing',
      description:
         'Sanchin breathing is a special technique used in the Sanchin kata. It combines elements of both Ibuki and Nogare, blending tension and relaxation to develop internal power. The practitioner maintains muscular tension, especially in the core, while breathing deeply and slowly. The breath is controlled and matched to the movements of the kata, allowing the practitioner to generate power while staying grounded and centered.',
      usage: 'This breathing is essential during the Sanchin kata, which focuses on building a solid stance, core strength, and endurance. Practitioners use Sanchin breathing to channel energy throughout the body and protect vital areas while performing the slow, deliberate movements of the kata. It also helps to develop discipline and mental fortitude.',
   },
   {
      nameEn: 'Shinkokyu',
      nameJp: '深呼吸',
      type: 'Deep Breathing',
      description:
         'Shinkokyu is a deep breathing technique designed to rejuvenate the body and mind. It involves full, deep breaths that fill the lungs completely, followed by long, smooth exhalations. This type of breathing promotes oxygenation and relaxation, allowing the body to recover after intense physical exertion. It also calms the nervous system and promotes mental clarity.',
      usage: 'Shinkokyu is often used between rounds in sparring or after high-intensity training sessions. It allows practitioners to regain their breath, lower their heart rate, and calm their nerves. This breathing technique is also useful in managing stress and bringing the practitioner back to a state of equilibrium during challenging moments.',
   },
];

// BreathingTechniquesPage component
const BreathingTechniquesPage: React.FC = () => {
   return (
      <Paper
         elevation={3}
         style={{
            padding: '16px',
            marginTop: '16px',
         }}>
         <Typography variant='h5' align='left' gutterBottom>
            Kyokushin Breathing Techniques
         </Typography>

         <Grid container spacing={3} columns={1}>
            {breathingTechniques.map(technique => (
               <Grid item xs={12} sm={6} key={technique.nameEn}>
                  <Card>
                     <CardContent>
                        <Typography variant='h5' component='div'>
                           {technique.nameEn} ({technique.nameJp})
                        </Typography>
                        <Typography color='textSecondary' gutterBottom>
                           {technique.type}
                        </Typography>
                        <Typography variant='body2' paragraph>
                           <strong>Description:</strong> {technique.description}
                        </Typography>
                        <Typography variant='body2' paragraph>
                           <strong>Usage:</strong> {technique.usage}
                        </Typography>
                     </CardContent>
                  </Card>
               </Grid>
            ))}
         </Grid>
      </Paper>
   );
};

export default BreathingTechniquesPage;
