// File: ./src/components/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { getClientConfigSnapshot, loadClientConfig } from '@/config/clientConfig';
import {
  hydrateSettingsFromServer,
  isSettingsSyncAvailable,
  pushLocalSettingsToServer,
} from '@/services/userSettingsService';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  token: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp in seconds
  role: 'admin' | 'user';
  providers?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  refreshProfile: (overrideToken?: string) => Promise<void>;
  renderGoogleButton: (container: HTMLElement) => Promise<boolean>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeProviders = (providers?: string[] | null): string[] | undefined => {
  if (!providers) {
    return ['google'];
  }
  return providers;
};

const readStoredUser = (): User | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }
  try {
    const parsed = JSON.parse(storedUser) as User;
    return {
      ...parsed,
      providers: normalizeProviders(parsed.providers),
    };
  } catch (parseError) {
    console.warn('Failed to parse stored user session', parseError);
    return null;
  }
};

const syncUserSettings = async (token: string) => {
  if (!isSettingsSyncAvailable() || !token) {
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(
    () => getClientConfigSnapshot().googleClientId ?? null,
  );
  const refreshTimerRef = React.useRef<number | null>(null);
  const refreshUserProfile = React.useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = (await res.json()) as { role?: 'admin' | 'user'; providers?: string[] };
      if (!data?.role) return;

      setUser((current) => {
        const baseUser = current ?? readStoredUser();
        if (!baseUser) return current;
        const incomingProviders = Array.isArray(data.providers) ? data.providers : undefined;
        const nextProviders = incomingProviders ?? baseUser.providers;
        const updated = {
          ...baseUser,
          role: data.role ?? baseUser.role,
          providers: normalizeProviders(nextProviders),
        };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch (profileError) {
      console.warn('Unable to refresh user profile', profileError);
    }
  }, []);
  const resolveClientId = React.useCallback(async (): Promise<string | null> => {
    if (googleClientId) {
      return googleClientId;
    }

    try {
      const config = await loadClientConfig();
      if (config.googleClientId) {
        setGoogleClientId(config.googleClientId);
        return config.googleClientId;
      }
    } catch (configError) {
      console.warn('Unable to load Google client configuration', configError);
    }

    return null;
  }, [googleClientId]);

  /**
   * Auto-refresh JWT access token using refresh token
   *
   * Implementation Status: ✅ WORKING
   * Backend now issues new custom JWT tokens on each refresh.
   *
   * Flow:
   * 1. Call /auth/refresh with current refresh token
   * 2. Receive new JWT access token (1 hour expiry)
   * 3. Update user state with new token and expiry
   * 4. Save to localStorage
   * 5. Reschedule next refresh for 55 minutes from now
   *
   * ⚠️ KNOWN ISSUE - Stale Closure:
   * This function captures 'user' from the parent scope, which may become outdated
   * if user state changes between function definition and execution.
   *
   * Recommended Fix:
   * Use functional setState: setUser(currentUser => {...})
   * instead of: setUser({...user, ...})
   *
   * Other Limitations:
   * - No retry logic: single failure logs user out (poor UX for network hiccups)
   * - No request queuing: concurrent API calls during refresh may fail
   *
   * @returns Promise<boolean> - true if refresh succeeded, false if failed (triggers logout)
   */
  const refreshAccessToken = React.useCallback(async (): Promise<boolean> => {
    if (!user?.refreshToken) {
      console.warn('No refresh token available');
      return false;
    }

    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });

      if (!res.ok) {
        throw new Error('Token refresh failed');
      }

      const data = (await res.json()) as {
        accessToken: string;
        expiresIn: number;
        role?: 'admin' | 'user';
        providers?: string[];
      };
      const expiresAt = Math.floor(Date.now() / 1000) + data.expiresIn;

      // Update user with new access token and expiry
      const updatedUser = {
        ...user,
        token: data.accessToken,
        expiresAt,
        role: data.role ?? user.role,
        providers: data.providers ?? user.providers,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force logout on refresh failure
      setUser(null);
      localStorage.removeItem('user');
      return false;
    }
  }, [user]);

  /**
   * Schedule automatic token refresh 5 minutes before expiry
   *
   * Behavior:
   * - Sets setTimeout to call refreshAccessToken
   * - Calculates delay: (expiresAt - now - 5 minutes)
   * - Minimum delay: 60 seconds
   * - Clears any existing timer first
   *
   * Triggers:
   * - On initial login (when user.expiresAt is set)
   * - After successful token refresh (new expiresAt)
   * - On user state change
   *
   * Cleanup:
   * - Timer cleared on component unmount
   * - Timer cleared on new schedule
   * - Timer cleared on logout
   */
  const scheduleTokenRefresh = React.useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!user?.expiresAt) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = user.expiresAt - now;
    const refreshIn = Math.max(timeUntilExpiry - 5 * 60, 60); // Refresh 5 min before expiry, min 60s

    if (refreshIn > 0) {
      refreshTimerRef.current = window.setTimeout(() => {
        void refreshAccessToken();
      }, refreshIn * 1000);
    }
  }, [user, refreshAccessToken]);

  // Setup refresh timer on user change
  useEffect(() => {
    scheduleTokenRefresh();
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser?.token) {
          const hydratedUser = {
            ...parsedUser,
            role: parsedUser.role ?? 'user',
          };
          setUser(hydratedUser);
          localStorage.setItem('user', JSON.stringify(hydratedUser));
          void syncUserSettings(parsedUser.token);
          void refreshUserProfile(parsedUser.token);
        } else {
          localStorage.removeItem('user');
        }
      } catch (parseError) {
        console.warn('Failed to parse stored user session', parseError);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, [refreshUserProfile]);

  useEffect(() => {
    let isCancelled = false;
    loadClientConfig()
      .then((config) => {
        if (isCancelled) {
          return;
        }
        if (config.googleClientId) {
          setGoogleClientId(config.googleClientId);
        } else if (!googleClientId) {
          setError('Google Client ID is missing.');
        }
      })
      .catch((loadError) => {
        if (isCancelled) {
          return;
        }
        console.warn('Failed to load Google client configuration', loadError);
        if (!googleClientId) {
          setError('Google Client ID is missing.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [googleClientId]);

  const handleCredentialResponse = React.useCallback(async (response: GoogleCredentialResponse) => {
    try {
      if (!response?.credential) {
        throw new Error('Missing Google credential');
      }

      // Call backend to exchange Google token for access + refresh tokens
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!res.ok) {
        throw new Error('Backend authentication failed');
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
          id: string;
          email: string;
          name?: string;
          picture?: string;
          role?: 'admin' | 'user';
          providers?: string[];
        };
      };

      const expiresAt = Math.floor(Date.now() / 1000) + data.expiresIn;

      const userData: User = {
        id: data.user.id,
        name: data.user.name || '',
        email: data.user.email,
        imageUrl: data.user.picture,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt,
        role: data.user.role ?? 'user',
        providers: data.user.providers,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      void syncUserSettings(userData.token);
    } catch (error) {
      console.error('Error during authentication:', error);
      setError('Unable to complete Google authentication.');
    }
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }
    if (!window.google?.accounts?.id) {
      return;
    }

    window.google!.accounts!.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });
  }, [googleClientId, handleCredentialResponse]);

  const login = async () => {
    const clientId = await resolveClientId();
    if (!clientId) {
      setError('Google Client ID is missing.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setError('Google authentication script is not loaded. Please refresh the page.');
      return;
    }

    setError(null);

    // Always re-initialize to be safe before prompting
    window.google!.accounts!.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google!.accounts!.id.prompt((notification: PromptNotification) => {
      if (notification.isNotDisplayed()) {
        console.warn('Google Sign-In prompt not displayed:', notification.getNotDisplayedReason());
        const reason = notification.getNotDisplayedReason();
        setError(`Unable to show Google Login: ${reason}`);
        if (reason === 'suppressed_by_user' || reason === 'browser_not_supported') {
          window.location.href = '/#/login?provider=google';
        }
      } else if (notification.isSkippedMoment()) {
        console.warn('Google Sign-In skipped:', notification.getSkippedReason());
      }
    });
  };

  /**
   * Logout: Invalidate tokens both client and server-side
   *
   * Flow:
   * 1. Call /auth/logout to delete refresh token from database
   * 2. Clear refresh timer
   * 3. Clear user state and localStorage
   *
   * Security:
   * - Prevents further token refresh attempts
   * - Invalidates 30-day refresh token
   * - Continues even if backend call fails (graceful degradation)
   */
  const logout = async () => {
    // Call backend to invalidate refresh token
    if (user?.refreshToken) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: user.refreshToken }),
        });
      } catch (error) {
        console.error('Logout endpoint error:', error);
        // Continue with client-side logout even if backend fails
      }
    }

    // Clear refresh timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

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
    refreshProfile: async (overrideToken?: string) => {
      const storedUser = readStoredUser();
      const tokenToUse = overrideToken ?? user?.token ?? storedUser?.token;
      if (tokenToUse) {
        await refreshUserProfile(tokenToUse);
      }
    },
    renderGoogleButton: async (container: HTMLElement) => {
      const clientId = await resolveClientId();
      if (!clientId) {
        setError('Google Client ID is missing.');
        return false;
      }
      if (!window.google?.accounts?.id?.renderButton) {
        setError('Google authentication script is not loaded. Please refresh the page.');
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320,
      });
      return true;
    },
    token: user?.token || null,
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

// Google Identity Services Types
interface GoogleCredentialResponse {
  credential: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
    }) => void;
    prompt: (callback: (notification: PromptNotification) => void) => void;
    renderButton: (
      container: HTMLElement,
      options: {
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        width?: number;
        locale?: string;
      },
    ) => void;
  };
}

// Extend window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: GoogleAccounts;
    };
  }
}
