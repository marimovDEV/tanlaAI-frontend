import { createContext } from 'react';

export interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramWebAppUser | null;
  ready: boolean;
  haptic: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
}

export const TelegramContext = createContext<TelegramContextType | undefined>(undefined);
