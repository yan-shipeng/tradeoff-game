// 语言注册表：新增语言只需在这里加一行
import type { LangId } from '@/game/types';
import type { GameContent } from './schema';
import zh from './zh';
import en from './en';

export const contents: Record<LangId, GameContent> = { zh, en };

export const LANGUAGE_OPTIONS: { id: LangId; label: string }[] = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'EN' },
];

export function detectDefaultLang(): LangId {
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')) return 'zh';
  return 'en';
}

export type { GameContent };
