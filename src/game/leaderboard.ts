// 排行榜数据层 —— 纯逻辑 + 本地存储 + 云端同步（三块相互独立，可分别测试）
//
// 设计要点：
// - 计分规则（scoreOf）是唯一的"积分"定义，本机榜与云端榜共用，避免两处口径不一致。
// - 本机榜（local）永远可用：云端没开通 / 网络不通 / 学校机房断网时，游戏本身不受影响。
// - 云端榜（cloud）是可选增强：连不上就静默降级，只在 UI 上以一行小字说明。
// - 玩家身份 = 本机标识 + 名号（见 identityOf）。同一身份重复提交按覆盖处理而非追加，
//   这样"再玩一局"不会在榜上堆出一串自己的名字；而换个名号就是另一个人，各占一行。

import type { GameState } from './state';

export interface LeaderboardEntry {
  /** 玩家唯一标识（随机生成，非账号，不含任何个人信息） */
  playerId: string;
  /** 学生自己填写的名号 */
  name: string;
  /** 积分 = 投资者支持度 + 利益相关者支持度 */
  score: number;
  investor: number;
  stakeholder: number;
  /** 是否中途出局（任一方支持度归零） */
  failed: boolean;
  /** 完成时间戳（毫秒） */
  at: number;
}

/** 名号长度上限（中英文统一按字符数计，与 UI 的 maxLength 保持一致） */
export const NAME_MAX = 12;

/**
 * 积分 = 投资者支持度 + 利益相关者支持度。
 * 负值按 0 计：出局玩家的支持度可能为负，不让他们靠"负分"反而排到后面显得更差，
 * 统一视作 0 分底部（用 failed 字段做区分，见 sortEntries）。
 */
export function scoreOf(state: Pick<GameState, 'investor' | 'stakeholder'>): number {
  return Math.max(0, state.investor) + Math.max(0, state.stakeholder);
}

/** 由终局状态生成一条榜单记录 */
export function entryFromState(state: GameState, playerId: string, name: string, at = Date.now()): LeaderboardEntry {
  return {
    playerId,
    name,
    score: scoreOf(state),
    investor: Math.max(0, state.investor),
    stakeholder: Math.max(0, state.stakeholder),
    failed: state.failed !== null,
    at,
  };
}

/** 名号清洗：去首尾空白、压掉连续空白、截断到上限；空名回退为「匿名玩家」 */
export function normalizeName(raw: string, fallback = '匿名玩家'): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  return cleaned || fallback;
}

/** 名号是否合法（非空即合法，宽松处理，避免课堂上的无谓摩擦） */
export function isValidName(raw: string): boolean {
  return raw.trim().length > 0;
}

/**
 * 排序：积分降序 → 未出局优先 → 时间早的在前。
 * 同分时"活到最后"的玩家排前面，避免出局者与完成者同分并列。
 */
export function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.failed !== b.failed) return a.failed ? 1 : -1;
    return a.at - b.at;
  });
}

/** 合并两份榜单，同一 playerId 保留积分高的那条（用于本机榜 ↔ 云端榜合并展示） */
export function mergeEntries(a: LeaderboardEntry[], b: LeaderboardEntry[]): LeaderboardEntry[] {
  const byPlayer = new Map<string, LeaderboardEntry>();
  for (const e of [...a, ...b]) {
    const prev = byPlayer.get(e.playerId);
    if (!prev || e.score > prev.score || (e.score === prev.score && e.at > prev.at)) byPlayer.set(e.playerId, e);
  }
  return sortEntries([...byPlayer.values()]);
}

/** 在榜单中找出某位玩家的名次（1-based），找不到返回 0 */
export function rankOf(entries: LeaderboardEntry[], playerId: string): number {
  const idx = sortEntries(entries).findIndex((e) => e.playerId === playerId);
  return idx < 0 ? 0 : idx + 1;
}

// ---------------------------------------------------------------- 本机榜（localStorage）

const LOCAL_KEY = 'tradeoff-leaderboard';
const PLAYER_KEY = 'tradeoff-player-id';
const NAME_KEY = 'tradeoff-player-name';
/** 本机榜最多保留多少条，防止长期使用后 localStorage 无限膨胀 */
const LOCAL_MAX = 200;

function safeLocalStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** 读取本机榜；任何异常都退化为空数组，绝不抛错打断游戏 */
export function readLocalEntries(): LeaderboardEntry[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  try {
    const raw = ls.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortEntries(parsed.filter(isEntry));
  } catch {
    return [];
  }
}

/** 写入本机榜：同名玩家（playerId 相同）覆盖旧记录，只在积分更高时更新 */
export function writeLocalEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const merged = mergeEntries(readLocalEntries(), [entry]).slice(0, LOCAL_MAX);
  const ls = safeLocalStorage();
  if (ls) {
    try {
      ls.setItem(LOCAL_KEY, JSON.stringify(merged));
    } catch {
      /* 隐私模式或配额满：静默忽略，不影响当前对局 */
    }
  }
  return merged;
}

export function clearLocalEntries(): void {
  safeLocalStorage()?.removeItem(LOCAL_KEY);
}

/** 玩家标识：本机生成一次并持久化，用于"同一个人重复提交覆盖" */
export function getPlayerId(): string {
  const ls = safeLocalStorage();
  if (!ls) return 'anon';
  let id = ls.getItem(PLAYER_KEY);
  if (!id) {
    id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      ls.setItem(PLAYER_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

/** 上次用过的名号，作为输入框默认值，省得每局重打 */
export function getSavedName(): string {
  return safeLocalStorage()?.getItem(NAME_KEY) ?? '';
}

/**
 * 玩家身份 = 本机标识 + 名号。榜单的去重、名次、高亮与云端 key 全部以此为准。
 *
 * 为什么不能只用本机标识：一台电脑上换名号（老师试玩、或几个同学共用一台机器）
 * 会被当成同一个人，后一次提交直接覆盖前一次，榜上永远只有一行。
 * 为什么不能只用名号：两台设备上同名（班里重名）会互相覆盖。
 * 两者结合后：换名号 = 新的一行；同名再玩 = 覆盖自己那行（不堆行）；不同设备同名 = 各占一行。
 *
 * 分隔符用 '~'：本机标识由 getPlayerId() 生成，字符集为 [a-z0-9_]，不含 '~'，
 * 因此拆分无歧义、也不会与名号内容撞车。
 */
export function identityOf(deviceId: string, name: string): string {
  return `${deviceId}~${name}`;
}

export function saveName(name: string): void {
  try {
    safeLocalStorage()?.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

/** 运行时类型守卫：localStorage 里的内容可能被手动改过或用旧版本写过 */
function isEntry(v: unknown): v is LeaderboardEntry {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.playerId === 'string' &&
    typeof o.name === 'string' &&
    typeof o.score === 'number' &&
    typeof o.investor === 'number' &&
    typeof o.stakeholder === 'number' &&
    typeof o.failed === 'boolean' &&
    typeof o.at === 'number'
  );
}
