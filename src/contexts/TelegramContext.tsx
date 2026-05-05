import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { TelegramContext } from './telegram-context';
import type { TelegramUser } from '../types';

const browserFallbackUser: TelegramWebAppUser = {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
};

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp] = useState<TelegramWebApp | null>(() => window.Telegram?.WebApp ?? null);
  const [user] = useState<TelegramWebAppUser | null>(() => webApp?.initDataUnsafe?.user ?? browserFallbackUser);
  const [profile, setProfile] = useState<TelegramUser | null>(null);
  const [ready, setReady] = useState(false);
  const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer');

  const [hasSetInitialMode, setHasSetInitialMode] = useState(false);

  useEffect(() => {
    if (profile && !hasSetInitialMode) {
      setViewMode(profile.role === 'COMPANY' || profile.has_company ? 'seller' : 'buyer');
      setHasSetInitialMode(true);
    }
  }, [profile, hasSetInitialMode]);
  const authenticate = async () => {
    try {
      let response;
      if (webApp?.initData) {
        response = await apiClient.post('/auth/telegram/', { initData: webApp.initData });
      } else {
        response = await apiClient.get('/auth/telegram/');
      }
      if (response.data && response.data.user) {
        setProfile(response.data.user);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  const refreshProfile = async () => {
    await authenticate();
  };

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();

      // Features supported since v6.1+
      if (webApp.isVersionAtLeast('6.1')) {
        webApp.setHeaderColor('#f9f9f9');
        webApp.setBackgroundColor('#f9f9f9');
      }
    }

    authenticate().finally(() => setReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webApp]);
 
  const haptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    // Check if property exists AND if version supports it (v6.1+)
    if (webApp?.HapticFeedback && webApp.isVersionAtLeast('6.1')) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  };

  return (
    <TelegramContext.Provider value={{ webApp, user, profile, ready, haptic, refreshProfile, viewMode, setViewMode }}>
      {children}
    </TelegramContext.Provider>
  );
};
