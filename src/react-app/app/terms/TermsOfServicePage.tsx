// File: ./src/app/terms/TermsOfServicePage.tsx

import { Box, Container, Divider, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';

type TermsSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: 'Agreement to Terms',
    paragraphs: [
      'By accessing or using Kyokushin-Kai, you agree to these Terms of Service.',
      'If you do not agree, you may not use the app.',
    ],
  },
  {
    title: 'Eligibility and Accounts',
    paragraphs: [
      'You must provide accurate information and keep your account details up to date.',
      'You are responsible for activity that occurs under your account.',
    ],
    bullets: [
      'Maintain the security of your credentials.',
      'Notify us of any unauthorized access to your account.',
    ],
  },
  {
    title: 'Acceptable Use',
    paragraphs: ['You agree not to misuse the app or its services.'],
    bullets: [
      'Do not attempt to access systems or data you are not authorized to use.',
      'Do not disrupt or interfere with the app or its infrastructure.',
      'Do not submit content that is unlawful, abusive, or infringes on others rights.',
    ],
  },
  {
    title: 'Training and Health Disclaimer',
    paragraphs: [
      'Training content is provided for informational purposes only and does not replace professional instruction or medical advice.',
      'You are responsible for your own safety and should consult a qualified professional before beginning any training program.',
    ],
  },
  {
    title: 'User Content',
    paragraphs: [
      'You retain ownership of the content you submit, such as training logs and feedback.',
      'You grant us a limited license to use this content solely to provide and improve the service.',
    ],
  },
  {
    title: 'Intellectual Property',
    paragraphs: [
      'The app, including its branding, design, and features, is owned by Kyokushin-Kai and protected by applicable laws.',
    ],
  },
  {
    title: 'Termination',
    paragraphs: [
      'We may suspend or terminate access if you violate these terms or misuse the service.',
      'You may stop using the app at any time and request account deletion through the feedback page.',
    ],
  },
  {
    title: 'Disclaimers and Limitation of Liability',
    paragraphs: [
      'The app is provided on an "as is" and "as available" basis without warranties of any kind.',
      'To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages.',
    ],
  },
  {
    title: 'Changes to These Terms',
    paragraphs: [
      'We may update these terms from time to time. The latest version will always be available in the app.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      'For questions about these terms, use the feedback page to reach our team.',
    ],
  },
];

function TermsOfServicePage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
          }}
        >
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Terms of Service
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680 }}>
            These terms define the rules for using Kyokushin-Kai and help keep the community safe
            and respectful.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            Last updated: March 1, 2025
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {TERMS_SECTIONS.map((section) => (
            <Paper
              key={section.title}
              elevation={1}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
                {section.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {section.paragraphs.map((paragraph, index) => (
                <Typography key={`${section.title}-p-${index}`} variant="body1" paragraph>
                  {paragraph}
                </Typography>
              ))}
              {section.bullets && (
                <Box component="ul" sx={{ pl: 3, mb: 0, mt: 1 }}>
                  {section.bullets.map((bullet) => (
                    <Box component="li" key={`${section.title}-${bullet}`} sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {bullet}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default TermsOfServicePage;
