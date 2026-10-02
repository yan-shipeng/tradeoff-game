// 核心玩法类型 —— 与语言无关，所有文案都在 content/ 中按语言定义

export type AreaId = 'growth' | 'environment' | 'social' | 'longterm';
export type LangId = 'zh' | 'en';
export type Happiness = 'sad' | 'neutral' | 'happy';

export interface Impact {
  investor?: number;
  stakeholder?: number;
}

export type Allocation = Record<AreaId, number>;

export const AREA_ORDER: AreaId[] = ['growth', 'environment', 'social', 'longterm'];

export const AREA_COLORS: Record<AreaId, string> = {
  growth: '#F48158',
  environment: '#4C9A2A',
  social: '#D9A514',
  longterm: '#2079C1',
};

export const MAX_LEVEL = 3;
export const TURN_COUNT = 4;

/** 结局评级阈值：0–3 差 / 3.5–6.5 中 / 7+ 好 */
export function classifyHappiness(score: number): Happiness {
  if (score <= 3) return 'sad';
  if (score <= 6.5) return 'neutral';
  return 'happy';
}

export function sumAllocation(a: Allocation): number {
  return AREA_ORDER.reduce((s, k) => s + a[k], 0);
}
