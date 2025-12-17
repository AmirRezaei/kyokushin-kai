// File: ./src/Home.tsx
import Box from '@mui/material/Box';
import { useState } from 'react';

import MottoDeck from './components/kyokushin/MottoDeck';
import QuoteDeck from './Quote/QuoteDeck';
import quoteData from './Quote/quoteData';

const Home: React.FC = () => {
   const [showMottos, setShowMottos] = useState(true);
   return (
      <Box
         sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
         }}>
            TEST
         {showMottos ? <MottoDeck onClose={() => setShowMottos(false)} /> : <QuoteDeck quotes={quoteData} />}
      </Box>
   );
};

export default Home;
