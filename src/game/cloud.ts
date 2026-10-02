// 云端排行榜适配层 —— 可选增强，绝不阻塞游戏
//
// 设计原则：
// 1. 本机榜是唯一可靠的数据源；云端只是把它"共享出去"，连不上就静默降级。
// 2. 云服务未开通时（cloudConfig 为 null），所有函数直接走本机路径，不报错。
// 3. SDK 用动态 import 加载：没装 SDK / 装不上，也只影响云端同步，不影响打包与游戏。
//
// 接入云端时只需一步：把 cloud-service 返回的 publicConfig 填进 CLOUD_CONFIG。
// 其余代码无需改动。

import {
  entryFromState,
  mergeEntries,
  readLocalEntries,
  writeLocalEntry,
  type LeaderboardEntry,
} from './leaderboard';
import type { GameState } from './state';

/**
 * 云服务公开配置。endpoint 与 publishableKey 都来自云服务的 publicConfig，
 * 二者均**必须**传入客户端初始化；publishableKey 只标识"哪个应用"，本身不含权限，
 * 服务端会做严格 Origin 校验，因此可以放在前端源码里。
 *
 * 为 null 时 = 云端未开通，排行榜仅本机可见。
 */
export const CLOUD_CONFIG: { endpoint: string; publishableKey: string } | null = null;

/** 云端是否已配置（只影响 UI 上那句说明文字） */
export function isCloudConfigured(): boolean {
  return CLOUD_CONFIG !== null;
}

/** 集合名：玩家每人的最高分记录 */
const COLLECTION = 'scores';

export type SyncResult =
  | { ok: true; entries: LeaderboardEntry[]; scope: 'cloud' }
  | { ok: false; entries: LeaderboardEntry[]; scope: 'local'; reason: string };

// 单例 client：SDK 初始化一次，所有调用复用（见 cloud-service 约定）。
// 缓存 Promise<CloudClient | null>：null 表示"不可用"，调用方据此降级，不重复重试。
let clientPromise: Promise<CloudClient | null> | null = null;

interface CloudDatabase {
  collection(name: string): {
    doc(id: string): { set(data: Record<string, unknown>): Promise<unknown> };
    orderBy(field: string, direction: 'asc' | 'desc'): {
      limit(n: number): { get(): Promise<{ data: unknown[] }> };
    };
  };
}

interface CloudClient {
  database(): CloudDatabase;
}

/**
 * 懒加载并初始化 SDK。任何一步失败都返回 null（调用方据此降级），不抛出。
 *
 * 动态 import 用变量拼接路径，让打包器无法静态解析：
 * SDK 尚未安装 / 未开通云服务时，构建与运行都不受影响。
 * 打包器在看到无法解析的裸包名时只会尝试解析并在失败时报错；
 * 这里通过外部化 + 运行时 try/catch 双保险确保"没有云端也能正常出包"。
 */
async function getClient(): Promise<CloudClient | null> {
  if (!CLOUD_CONFIG) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
      // 变量拼接：避免打包器在构建期静态解析这个可选依赖
      const pkg = ['@tencent-ai', 'workbuddy-cloud-sdk'].join('/');
      const mod = (await import(/* @vite-ignore */ pkg)) as {
        createWorkBuddyCloud?: (c: typeof CLOUD_CONFIG) => CloudClient;
      };
      const create = mod.createWorkBuddyCloud;
      if (!create) throw new Error('cloud sdk missing createWorkBuddyCloud');
      // endpoint 与 publishableKey 必须同时传入，缺一不可
      return create({ endpoint: CLOUD_CONFIG!.endpoint, publishableKey: CLOUD_CONFIG!.publishableKey });
    })().catch(() => null);
  }
  return clientPromise;
}

/** 把一条成绩写入本机榜，再尽力同步到云端；返回合并后的可见榜单 */
export async function submitScore(
  state: GameState,
  playerId: string,
  name: string,
): Promise<SyncResult> {
  const entry = entryFromState(state, playerId, name);
  const local = writeLocalEntry(entry);

  const client = await getClient();
  if (!client) {
    return { ok: false, entries: local, scope: 'local', reason: 'cloud-not-configured' };
  }
  try {
    // 以 playerId 为主键写入：同一玩家重复提交是覆盖，不会在榜上堆出多行
    await client.database().collection(COLLECTION).doc(playerId).set({ ...entry });
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

/** 拉取云端榜单（取积分最高的若干条） */
export async function fetchRemote(limit = 100): Promise<LeaderboardEntry[]> {
  const client = await getClient();
  if (!client) return [];
  try {
    const res = await client.database().collection(COLLECTION).orderBy('score', 'desc').limit(limit).get();
    return (res.data ?? []).filter(isRemoteEntry);
  } catch {
    return [];
  }
}

/**
 * 读取榜单：优先云端（全班可见），失败则退回本机榜。
 * UI 据此决定显示"全班排行"还是"本机排行"。
 */
export async function loadLeaderboard(playerId: string): Promise<{ entries: LeaderboardEntry[]; scope: 'cloud' | 'local'; playerId: string }> {
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
  return typeof o.playerId === 'string' && typeof o.name === 'string' && typeof o.score === 'number';
}
