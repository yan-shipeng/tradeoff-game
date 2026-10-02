// 游戏状态机 —— 纯逻辑，文案一律不在这里
import type { GameContent } from '@/content';
import { AREA_ORDER, cumulativeOf, levelFor, resourceAdjust, type Allocation, type AreaId, type Impact } from './types';

export type ScreenName =
  | 'landing'
  | 'nameEntry'
  | 'leaderboard'
  | 'tutorial'
  | 'bridge'
  | 'intro'
  | 'allocate'
  | 'yearRecap'
  | 'feedback'
  | 'event'
  | 'dilemma'
  | 'response'
  | 'score'
  | 'recap';

export type FailReason = 'investor' | 'stakeholder';

export interface GameState {
  screen: ScreenName;
  /** 玩家名号（进入游戏前填写，随对局全程保留） */
  playerName: string;
  /** 打开排行榜前所在的屏幕，用于关闭榜单时原样返回；非榜单屏时为 null */
  returnScreen: ScreenName | null;
  tutorialPage: number;
  turn: number; // 1..4
  investor: number;
  stakeholder: number;
  history: Allocation[]; // 已完成的回合
  draft: Allocation;
  /** 本回合触发的事件 id 队列 */
  eventQueue: string[];
  feedbackIdx: number; // 0..3
  eventIdx: number;
  picks: (0 | 1)[]; // 每回合两难的选项（0/1）
  failed: FailReason | null;
  /** 上回合结束时的支持度给本回合资源带来的修正（-2..+2） */
  adjust: number;
}

export const emptyAllocation = (): Allocation => ({ growth: 0, environment: 0, social: 0, longterm: 0 });

export const initialGameState: GameState = {
  screen: 'landing',
  playerName: '',
  returnScreen: null,
  tutorialPage: 0,
  turn: 1,
  investor: 5,
  stakeholder: 5,
  history: [],
  draft: emptyAllocation(),
  eventQueue: [],
  feedbackIdx: 0,
  eventIdx: 0,
  picks: [],
  failed: null,
  adjust: 0,
};

export type Action =
  | { type: 'START' }
  | { type: 'SET_NAME'; name: string } // 填写名号（并进入教程）
  | { type: 'OPEN_LEADERBOARD' }
  | { type: 'CLOSE_LEADERBOARD' } // 从榜单返回进入前的屏幕
  | { type: 'TUTORIAL_NEXT' }
  | { type: 'NEXT_STORY' } // bridge→intro，intro→allocate
  | { type: 'SET_LEVEL'; area: AreaId; level: number }
  | { type: 'CONFIRM_ALLOC' }
  | { type: 'NEXT_FEEDBACK' } // yearRecap→feedback0，feedback i→i+1 或回合后段
  | { type: 'NEXT_EVENT' }
  | { type: 'PICK'; option: 0 | 1 }
  | { type: 'NEXT_RESPONSE' }
  | { type: 'TO_RECAP' }
  | { type: 'RESTART' };

interface Scores {
  investor: number;
  stakeholder: number;
  failed: FailReason | null;
}

function applyImpact(s: GameState, impact: Impact): Scores {
  const investor = +(s.investor + (impact.investor ?? 0)).toFixed(2);
  const stakeholder = +(s.stakeholder + (impact.stakeholder ?? 0)).toFixed(2);
  const failed: FailReason | null = investor <= 0 ? 'investor' : stakeholder <= 0 ? 'stakeholder' : null;
  return { investor, stakeholder, failed };
}

/** 由 makeReducer 生成，content 通过闭包注入，支持运行期切换语言 */
export function makeReducer(t: GameContent) {
  const eventMap = new Map(t.events.map((e) => [e.id, e]));
  const baseResources = (turn: number) => t.turns[turn - 1]?.resources ?? 10;
  const turnResources = (s: GameState) => baseResources(s.turn) + s.adjust;

  function advanceTurn(s: GameState): GameState {
    if (s.failed) return { ...s, screen: 'score' };
    if (s.turn >= 4) return { ...s, screen: 'score' };
    // 本回合结束时的双方支持度 → 下回合资源修正
    const adjust = resourceAdjust(s.investor, s.stakeholder);
    return { ...s, turn: s.turn + 1, screen: 'bridge', draft: emptyAllocation(), feedbackIdx: 0, eventIdx: 0, eventQueue: [], adjust };
  }

  function afterFeedback(s: GameState): GameState {
    if (s.failed) return { ...s, screen: 'score' };
    if (s.eventQueue.length > 0) {
      const ev = eventMap.get(s.eventQueue[0]);
      const r = applyImpact(s, ev?.impact ?? {});
      return { ...s, screen: 'event', eventIdx: 0, ...r, failed: r.failed };
    }
    if (s.turn <= 3) return { ...s, screen: 'dilemma' };
    return advanceTurn(s);
  }

  function afterEvents(s: GameState): GameState {
    if (s.failed) return { ...s, screen: 'score' };
    if (s.turn <= 3) return { ...s, screen: 'dilemma' };
    return advanceTurn(s);
  }

  return function reducer(state: GameState, action: Action): GameState {
    const s = state;

    // 任一方支持度归零后，一切推进操作都直接跳到结算
    if (s.failed && ['TUTORIAL_NEXT', 'NEXT_STORY', 'CONFIRM_ALLOC', 'NEXT_FEEDBACK', 'NEXT_EVENT', 'PICK', 'NEXT_RESPONSE'].includes(action.type)) {
      return { ...s, screen: 'score' };
    }

    switch (action.type) {
      case 'START':
        return { ...initialGameState, screen: 'nameEntry' };

      case 'SET_NAME':
        // 名号是进入游戏的唯一门槛；空名由 UI 侧拦截，这里再兜一层
        return { ...s, playerName: action.name, screen: 'tutorial', tutorialPage: 0 };

      case 'OPEN_LEADERBOARD':
        // 记住当前屏：从榜单返回时原样退回，不能把玩家从反馈/两难屏踢回分配屏
        return { ...s, screen: 'leaderboard', returnScreen: s.screen };

      case 'CLOSE_LEADERBOARD': {
        // 优先回到进入榜单前的屏幕；returnScreen 缺失时按有无名号兜底
        return { ...s, screen: s.returnScreen ?? (s.playerName ? 'tutorial' : 'landing'), returnScreen: null };
      }

      case 'TUTORIAL_NEXT': {
        if (s.screen !== 'tutorial') return s;
        if (s.tutorialPage < t.tutorial.pages.length - 1) return { ...s, tutorialPage: s.tutorialPage + 1 };
        return { ...s, screen: 'intro', turn: 1 };
      }

      case 'NEXT_STORY':
        if (s.screen === 'bridge') return { ...s, screen: 'intro' };
        if (s.screen === 'intro') return { ...s, screen: 'allocate', draft: emptyAllocation() };
        return s;

      case 'SET_LEVEL': {
        if (s.screen !== 'allocate') return s;
        const others = AREA_ORDER.reduce((sum, k) => (k === action.area ? sum : sum + s.draft[k]), 0);
        const remaining = turnResources(s) - others;
        // 对齐原游戏：单项投入只受本回合剩余资源约束，不设每回合单项上限；
        // 领域等级由历年累计投入推导（见 levelFor）
        const level = Math.max(0, Math.min(action.level, remaining));
        return { ...s, draft: { ...s.draft, [action.area]: level } };
      }

      case 'CONFIRM_ALLOC': {
        if (s.screen !== 'allocate') return s;
        const history = [...s.history, s.draft];
        const eventQueue = t.events.filter((e) => e.when(history)).map((e) => e.id);
        const cum = cumulativeOf(history);
        // 立即应用第一个领域（growth）的反馈影响，等级由累计投入推导
        const r = applyImpact({ ...s, history }, t.areas[0].feedback[s.turn - 1][levelFor(cum.growth, t.areas[0].thresholds)].impact);
        return {
          ...s,
          history,
          eventQueue,
          feedbackIdx: 0,
          eventIdx: 0,
          screen: 'yearRecap',
          investor: r.investor,
          stakeholder: r.stakeholder,
          failed: r.failed,
        };
      }

      case 'NEXT_FEEDBACK': {
        if (s.screen === 'yearRecap') return { ...s, screen: 'feedback', feedbackIdx: 0 };
        if (s.screen !== 'feedback') return s;
        const next = s.feedbackIdx + 1;
        if (next < AREA_ORDER.length) {
          const area = t.areas[next];
          const cum = cumulativeOf(s.history);
          const cell = area.feedback[s.turn - 1][levelFor(cum[area.id], area.thresholds)];
          const r = applyImpact(s, cell.impact);
          return { ...s, screen: 'feedback', feedbackIdx: next, investor: r.investor, stakeholder: r.stakeholder, failed: r.failed };
        }
        return afterFeedback(s);
      }

      case 'NEXT_EVENT': {
        if (s.screen !== 'event') return s;
        const next = s.eventIdx + 1;
        if (next < s.eventQueue.length) {
          const r = applyImpact(s, eventMap.get(s.eventQueue[next])?.impact ?? {});
          return { ...s, eventIdx: next, investor: r.investor, stakeholder: r.stakeholder, failed: r.failed };
        }
        return afterEvents(s);
      }

      case 'PICK': {
        if (s.screen !== 'dilemma' || s.turn > 3) return s;
        const option = t.dilemmas[s.turn - 1].options[action.option];
        const picks = [...s.picks, action.option];
        const r = applyImpact(s, option.impact);
        return { ...s, picks, screen: 'response', investor: r.investor, stakeholder: r.stakeholder, failed: r.failed };
      }

      case 'NEXT_RESPONSE':
        return s.screen === 'response' ? advanceTurn(s) : s;

      case 'TO_RECAP':
        return s.screen === 'score' ? { ...s, screen: 'recap' } : s;

      case 'RESTART':
        // 再来一局：保留名号，不让玩家重新输一遍
        return { ...initialGameState, playerName: s.playerName, screen: 'tutorial' };

      default:
        return s;
    }
  };
}
