// 云端排行榜适配层 —— 可选增强，绝不阻塞游戏
//
// 设计原则：
// 1. 本机榜是唯一可靠的数据源；云端只是把它"共享出去"，连不上就静默降级。
// 2. 云服务未配置时（CLOUD_CONFIG 为 null），所有函数直接走本机路径，不报错。
// 3. 只用浏览器原生 fetch，不引入任何 SDK —— 没有依赖，也就不存在"装不上/打不进包"的问题。
//
// 后端选用 kvdb.io（免费、免注册的键值存储，明确支持浏览器跨域直连）：
//   - 写：PUT  https://kvdb.io/<bucket>/s_<玩家身份>      正文为一条榜单记录的 JSON
//   - 读：GET  https://kvdb.io/<bucket>/?format=json&values=1
//         一次请求拿回全部 [[key, value], ...]，不必逐条取，避免 N+1 请求
//
// 为什么是"一个身份一个 key"而不是"整榜一个文档"：
//   40 个学生几乎同时交卷时，整榜文档需要"读-改-写"，会互相覆盖丢分；
//   一人一键则是各自独立写入，天然没有竞争。
//
// 这里的"玩家身份"= 本机标识 + 名号（见 leaderboard.identityOf），由调用方传入：
//   同一身份重复提交是覆盖，不会堆行；换个名号就是另一个身份，各占一行。

import {
  entryFromState,
  mergeEntries,
  readLocalEntries,
  writeLocalEntry,
  type LeaderboardEntry,
} from './leaderboard';
import type { GameState } from './state';

/**
 * 云端存储配置。
 *
 * bucket 是 kvdb.io 的桶 ID：它只标识"哪个班/哪个游戏的榜"，本身不含任何密钥，
 * 可以安全地放在前端源码里（前端产物本来就会暴露它）。
 *
 * 为 null 时 = 云端未配置，排行榜仅本机可见。
 */
export const CLOUD_CONFIG: { bucket: string } | null = {
  bucket: 'WHYadeFF5ToQKYZtsZM4mU',
};

/** kvdb.io 数据面根地址 */
const BASE = 'https://kvdb.io';

/** 单条记录的 key 前缀：便于将来在同一桶内存放其他用途的键而不冲突 */
const KEY_PREFIX = 's_';

/** 网络超时（毫秒）。机房网络慢时宁可降级到本机榜，也不要让学生干等 */
const TIMEOUT_MS = 8000;

/** 云端是否已配置（只影响 UI 上那句说明文字） */
export function isCloudConfigured(): boolean {
  return CLOUD_CONFIG !== null;
}

export type SyncResult =
  | { ok: true; entries: LeaderboardEntry[]; scope: 'cloud' }
  | { ok: false; entries: LeaderboardEntry[]; scope: 'local'; reason: string };

/** 带超时的 fetch：任何失败都表现为抛出，由调用方统一降级 */
async function kvFetch(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BASE}/${CLOUD_CONFIG!.bucket}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** 读取云端已存的同一身份记录（单键读取，不受列表接口缓存影响） */
async function readEntry(playerId: string): Promise<LeaderboardEntry | null> {
  try {
    const res = await kvFetch(`/${encodeURIComponent(KEY_PREFIX + playerId)}`);
    if (!res.ok) return null;
    const raw = await res.text();
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRemoteEntry(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 把一条成绩写入本机榜，再尽力同步到云端；返回合并后的可见榜单 */
export async function submitScore(
  state: GameState,
  playerId: string,
  name: string,
): Promise<SyncResult> {
  const entry = entryFromState(state, playerId, name);
  const local = writeLocalEntry(entry);

  if (!CLOUD_CONFIG) {
    return { ok: false, entries: local, scope: 'local', reason: 'cloud-not-configured' };
  }
  try {
    // 以"玩家身份"为 key 写入：同一身份重复提交是覆盖，不会在榜上堆出多行；
    // 名号不同则是不同身份，各占一行。用 text/plain 正文可避免 CORS 预检，少一次往返、少一个失败点。
    //
    // 先读回旧值，只写"更高分"：本机榜按"保留更高分"合并，云端也必须一致，
    // 否则同一个学生重玩出低分后，别人的浏览器会看到低分、他自己的浏览器看到高分。
    const prev = await readEntry(playerId);
    const best = prev && prev.score > entry.score ? prev : entry;

    const res = await kvFetch(`/${encodeURIComponent(KEY_PREFIX + playerId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(best),
    });
    if (!res.ok) throw new Error(`kvdb write ${res.status}`);
    const remote = await fetchRemote();
    return { ok: true, entries: mergeEntries(local, remote), scope: 'cloud' };
  } catch (err) {
    return {
      ok: false,
      entries: local,
      scope: 'local',
      reason: err instanceof Error ? err.message : 'cloud-write-failed',
    };
  }
}

/** 拉取云端榜单（取积分最高的若干条）。任何异常都返回空数组，绝不打断游戏 */
export async function fetchRemote(limit = 100): Promise<LeaderboardEntry[]> {
  if (!CLOUD_CONFIG) return [];
  try {
    const res = await kvFetch('/?format=json&values=1');
    if (!res.ok) return [];
    const pairs: unknown = await res.json();
    if (!Array.isArray(pairs)) return [];

    const out: LeaderboardEntry[] = [];
    for (const pair of pairs) {
      if (!Array.isArray(pair) || pair.length < 2) continue;
      const raw = pair[1];
      if (typeof raw !== 'string') continue;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isRemoteEntry(parsed)) out.push(parsed);
      } catch {
        /* 单条脏数据不影响整榜 */
      }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * 读取榜单：优先云端（全班可见），失败则退回本机榜。
 * UI 据此决定显示"全班排行"还是"本机排行"。
 */
export async function loadLeaderboard(
  playerId: string,
): Promise<{ entries: LeaderboardEntry[]; scope: 'cloud' | 'local'; playerId: string }> {
  if (!CLOUD_CONFIG) {
    return { entries: readLocalEntries(), scope: 'local', playerId };
  }
  const remote = await fetchRemote();
  if (remote.length === 0) {
    // 云端空但可用，或云端读取失败——两种情况合并展示本机内容，避免榜单看起来是空的
    const local = readLocalEntries();
    const merged = mergeEntries(local, remote);
    return { entries: merged, scope: remote.length ? 'cloud' : 'local', playerId };
  }
  return { entries: mergeEntries(readLocalEntries(), remote), scope: 'cloud', playerId };
}

function isRemoteEntry(v: unknown): v is LeaderboardEntry {
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
