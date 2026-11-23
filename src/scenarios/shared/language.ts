import { createContext, useContext } from 'react';

export type Language = 'en' | 'ru';

export const LanguageContext = createContext<Language>('en');

export function useLanguage(): Language
{
  return useContext(LanguageContext);
}

export function localize(language: Language, english: string, russian: string): string
{
  return language === 'ru' ? russian : english;
}
