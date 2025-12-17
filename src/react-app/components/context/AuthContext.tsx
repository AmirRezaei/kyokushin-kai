// File: ./src/components/context/AuthContext.tsx

import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';

import {hydrateSettingsFromServer, isSettingsSyncAvailable, pushLocalSettingsToServer} from '@/services/userSettingsService';

// Ensure the Google Client ID is available
const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
   console.warn('GOOGLE_CLIENT_ID is missing in environment variables.');
}

interface User {
   id: string;
   name: string;
   email: string;
   imageUrl?: string;
   token: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const syncUserSettings = async (token: string) => {
   if (!isSettingsSyncAvailable || !token) {
      return;
   }
   try {
      const settings = await hydrateSettingsFromServer(token);
      if (!settings) {
         await pushLocalSettingsToServer(token);
      }
   } catch (syncError) {
      console.warn('Unable to synchronize user settings', syncError);
   }
};

interface AuthProviderProps {
   children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);




   useEffect(() => {
      // Check for stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
         try {
            const parsedUser = JSON.parse(storedUser) as User;
            if (parsedUser?.token) {
               setUser(parsedUser);
               void syncUserSettings(parsedUser.token);
            } else {
               localStorage.removeItem('user');
            }
         } catch (parseError) {
            console.warn('Failed to parse stored user session', parseError);
            localStorage.removeItem('user');
         }
      }
      setIsLoading(false);
   }, []);

   const handleCredentialResponse = React.useCallback(async (response: { credential: string }) => {
      try {
         if (!response?.credential) {
            throw new Error('Missing Google credential');
         }
         // Decode the JWT token
         const decoded = JSON.parse(atob(response.credential.split('.')[1]));

         const userData: User = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            imageUrl: decoded.picture,
            token: response.credential,
         };

         setUser(userData);
         localStorage.setItem('user', JSON.stringify(userData));
         void syncUserSettings(userData.token);
      } catch (error) {
         console.error('Error parsing Google credential:', error);
         setError('Unable to complete Google authentication.');
      }
   }, []);

   useEffect(() => {
      const initializeGoogle = () => {
         if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
               client_id: GOOGLE_CLIENT_ID,
               callback: handleCredentialResponse,
               auto_select: false, // Start with false to avoid loops if that's the issue
            });
         }
      };

      initializeGoogle();
   }, [handleCredentialResponse]);

   const login = async () => {
      if (!window.google?.accounts?.id) {
         setError('Google authentication script is not loaded. Please refresh the page.');
         return;
      }
      console.log('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID);
      if (!GOOGLE_CLIENT_ID) {
         setError('Google Client ID is missing.');
         return;
      }

      setError(null);
      
      // Always re-initialize to be safe before prompting
      window.google.accounts.id.initialize({
         client_id: GOOGLE_CLIENT_ID,
         callback: handleCredentialResponse,
      });

      window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
              console.warn('Google Sign-In prompt not displayed:', notification.getNotDisplayedReason());
              setError(`Unable to show Google Login: ${notification.getNotDisplayedReason()}`);
          } else if (notification.isSkippedMoment()) {
               console.warn('Google Sign-In skipped:', notification.getSkippedReason());
          }
      });
   };

   const logout = () => {
      setUser(null);
      localStorage.removeItem('user');
      setError(null);
   };

   const value: AuthContextType = {
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
};

// Extend window interface for Google Identity Services
declare global {
   interface Window {
      google: any;
   }
}

