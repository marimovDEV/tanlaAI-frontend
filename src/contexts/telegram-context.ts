import { createContext } from 'react';

import { TelegramUser } from '../types';

export interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramWebAppUser | null;
  profile: TelegramUser | null;
  ready: boolean;
  haptic: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  refreshProfile: () => Promise<void>;
}

export const TelegramContext = createContext<TelegramContextType | undefined>(undefined);
