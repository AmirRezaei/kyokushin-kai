// File: ./src/main.tsx
import './index.css';
import './styles/browserNormalization.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './components/context/AuthContext';
import { CustomThemeProvider } from './components/context/CustomThemeProvider';
import { LanguageProvider } from './components/context/LanguageContext';
import ErrorBoundary from './components/utils/ErrorBoundary';
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <CustomThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <HashRouter>
            {process.env.NODE_ENV === 'development' ? (
              <StrictMode>
                <App />
              </StrictMode>
            ) : (
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            )}
          </HashRouter>
        </AuthProvider>
      </LanguageProvider>
    </CustomThemeProvider>,
  );
} else {
  // Handle the error appropriately
  alert('Root element not found');
}
