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

/**
 * 由"累计投入"推导领域等级（对齐原游戏机制：投入逐年累计，等级看累计值）。
 * thresholds = 达到 1/2/3 级分别所需的累计投入。
 */
export function levelFor(cumulative: number, thresholds: readonly [number, number, number]): number {
  let lv = 0;
  for (const t of thresholds) if (cumulative >= t) lv++;
  return Math.min(lv, MAX_LEVEL);
}

/** 历年分配之和（history 含本回合时即为本回合确认后的累计） */
export function cumulativeOf(history: Allocation[]): Allocation {
  const cum = emptyAllocation();
  for (const h of history) for (const k of AREA_ORDER) cum[k] += h[k];
  return cum;
}

/**
 * 支持度对下回合资源的修正：双方支持度均值偏离 5 越多，修正越大，范围 [-2, +2]。
 * 均值 5 → 0；均值 8.5 → +2；均值 1.5 → -2（对齐原游戏"玩得差资源缩水"的体验）。
 */
export function resourceAdjust(investor: number, stakeholder: number): number {
  return Math.max(-2, Math.min(2, Math.round(((investor + stakeholder) / 2 - 5) / 2)));
}

function emptyAllocation(): Allocation {
  return { growth: 0, environment: 0, social: 0, longterm: 0 };
}

/** 结局评级阈值：0–3 差 / 3.5–6.5 中 / 7+ 好 */
export function classifyHappiness(score: number): Happiness {
  if (score <= 3) return 'sad';
  if (score <= 6.5) return 'neutral';
  return 'happy';
}

export function sumAllocation(a: Allocation): number {
  return AREA_ORDER.reduce((s, k) => s + a[k], 0);
}
