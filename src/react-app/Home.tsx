// File: ./src/Home.tsx
import Box from '@mui/material/Box';
import { useState } from 'react';

import MottoDeck from './components/kyokushin/MottoDeck';
import QuoteDeck from './Quote/QuoteDeck';
import quoteData from './Quote/quoteData';
import mainBackground from './media/400x600/main.png';

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
            backgroundImage: `url(${mainBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
         }}>
         {showMottos ? <MottoDeck onClose={() => setShowMottos(false)} /> : <QuoteDeck quotes={quoteData} />}
      </Box>
   );
};

export default Home;
