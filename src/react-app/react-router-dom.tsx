// HEADER-START
// * Path: ./src/react-router-dom.tsx
// HEADER-END

// ./src/react-router-dom.tsx
'use client';
// ./src/react-router-dom.tsx
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import KarateTimeline from './app/Technique/KarateTimeline';
import Grading from './Grading';

const App: React.FC = () => {
   return (
      <Router>
         <Routes>
            <Route path='/' element={<Grading />} />
            <Route path='/grading' element={<Grading />} />
            <Route path='/belts' element={<KarateTimeline />} />
         </Routes>
      </Router>
   );
};

export default App;
