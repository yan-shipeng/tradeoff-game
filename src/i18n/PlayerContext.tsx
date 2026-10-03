// 玩家上下文 —— 名号与玩家身份的唯一来源
//
// 与 LanguageContext 分开：语言是"看什么文案"，玩家是"以谁的身份玩"。
// 本机标识在首次加载时生成并持久化；对外暴露的身份 = 本机标识 + 名号（identityOf），
// 这样换名号就是另一个人，不会把一台设备上的多次试玩覆盖成一行。
//
// 这里刻意不用 useEffect + setState 去读 localStorage：那是"渲染后立即再渲染一次"，
// 会触发级联渲染。改为惰性初始化（useState 传入函数），只在首次渲染时读一次。
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { getPlayerId, getSavedName, identityOf, normalizeName, saveName } from '@/game/leaderboard';

interface PlayerContextValue {
  /** 玩家身份（本机标识 + 名号），用于榜单去重与"找出我的名次" */
  playerId: string;
  /** 上次用过的名号（作为输入框默认值） */
  savedName: string;
  /** 保存名号，供下次直接复用 */
  rememberName: (name: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // 惰性初始化：函数只在首次渲染执行一次；SSR / 测试环境无 localStorage 时自动回退
  const [deviceId] = useState(getPlayerId);
  const [savedName, setSavedName] = useState(getSavedName);

  // 身份随名号变化。未填名号时 savedName 为空串，此时不会与任何榜单记录匹配，符合预期。
  const playerId = useMemo(() => identityOf(deviceId, savedName), [deviceId, savedName]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      playerId,
      savedName,
      rememberName: (name: string) => {
        const clean = normalizeName(name);
        saveName(clean);
        setSavedName(clean);
      },
    }),
    [playerId, savedName],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
