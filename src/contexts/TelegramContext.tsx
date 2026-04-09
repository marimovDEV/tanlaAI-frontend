import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { TelegramContext } from './telegram-context';

const browserFallbackUser: TelegramWebAppUser = {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
};

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp] = useState<TelegramWebApp | null>(() => window.Telegram?.WebApp ?? null);
  const [user] = useState<TelegramWebAppUser | null>(() => webApp?.initDataUnsafe?.user ?? browserFallbackUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      try {
        if (webApp?.initData) {
          await apiClient.post('/auth/telegram/', { initData: webApp.initData });
        } else {
          await apiClient.get('/auth/telegram/');
        }
      } catch (err) {
        console.error('Authentication failed:', err);
      }
    };

    if (webApp) {
      webApp.ready();
      webApp.expand();
      
      // Features supported since v6.1+
      if (webApp.isVersionAtLeast('6.1')) {
        webApp.setHeaderColor('#f9f9f9');
        webApp.setBackgroundColor('#f9f9f9');
      }
    }
 
    void authenticate().finally(() => setReady(true));
  }, [webApp]);
 
  const haptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    // Check if property exists AND if version supports it (v6.1+)
    if (webApp?.HapticFeedback && webApp.isVersionAtLeast('6.1')) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  };

  return (
    <TelegramContext.Provider value={{ webApp, user, ready, haptic }}>
      {children}
    </TelegramContext.Provider>
  );
};
