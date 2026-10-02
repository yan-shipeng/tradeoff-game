// i18n 内容契约：每种语言导出一个满足本类型的 GameContent。
// 组件里禁止出现任何硬编码文案 —— 这是"一键切换语言"的根本保证。
// 新增语言 = 新增一个 content/<lang>.ts 并在 index.ts 注册，无需改任何组件。

import type { Allocation, AreaId, Happiness, Impact } from '@/game/types';

export interface FeedbackCell {
  text: string;
  impact: Impact;
}

export interface AreaContent {
  id: AreaId;
  name: string;
  /** 达到 1/2/3 级所需的"累计投入"（投入逐年累计，等级按累计值推导） */
  thresholds: [number, number, number];
  /** feedback[回合序号 0..3][投入等级 0..3] */
  feedback: FeedbackCell[][];
}

export interface TriggeredEventContent {
  id: string;
  /** 触发条件：history 为截至本回合的历年分配（含本回合），返回 true 则触发 */
  when: (history: Allocation[]) => boolean;
  text: string;
  impact: Impact;
}

export interface DilemmaOption {
  label: string;
  response: string;
  impact: Impact;
  /** 预设的"玩家选择比例"，用于"N% 的玩家和你一样" */
  pickedPercent: number;
}

export interface DilemmaContent {
  title: string;
  body: string;
  options: [DilemmaOption, DilemmaOption];
}

export interface TurnContent {
  resources: number;
  /** 回合开始前的过渡剧情（第 2 回合起） */
  bridge?: string;
  intro: string;
}

export interface GameContent {
  meta: {
    title: string;
    subtitle: string;
    start: string;
    company: string;
  };
  ui: {
    investors: string;
    stakeholders: string;
    resources: string;
    turnOf: (n: number) => string;
    tutorialNext: string;
    tutorialPlay: string;
    allocateTitle: string;
    remaining: string;
    /** 分配屏每项下方：累计投入与当前等级 */
    cumulative: (cum: number, lv: number) => string;
    confirm: string;
    yearFollows: string;
    eventTag: string;
    dilemmaTag: string;
    responseTag: string;
    pickedBy: (pct: number) => string;
    finalScore: string;
    finalInvestor: (score: number, avg: number) => string;
    finalStakeholder: (score: number, avg: number) => string;
    recapTitle: string;
    yourAllocations: string;
    playAgain: string;
    madeWith: string;
    impactInvestor: string;
    impactStakeholder: string;
  };
  tutorial: { pages: string[] };
  turns: TurnContent[];
  areas: AreaContent[];
  events: TriggeredEventContent[];
  /** 第 1–3 回合的两难抉择（第 4 回合无） */
  dilemmas: DilemmaContent[];
  endings: Record<Happiness, Record<Happiness, string>> & {
    investorFail: string;
    stakeholderFail: string;
    averageInvestor: number;
    averageStakeholder: number;
  };
}
