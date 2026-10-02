// 排行榜 UI —— 名号输入屏 + 榜单屏
//
// 两个组件都只读 useLanguage() 取文案，满足项目"组件零硬编码文案"的约定。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { NAME_MAX, clearLocalEntries, isValidName, normalizeName, rankOf, type LeaderboardEntry } from '@/game/leaderboard';
import { isCloudConfigured, loadLeaderboard } from '@/game/cloud';
import { PrimaryButton, ScreenShell } from './bits';
import { LanguageSwitcher } from './LanguageSwitcher';

/** 名号输入屏：填完才能开始，输入框自动聚焦 */
export function NameEntryScreen({ initialName, onConfirm }: { initialName: string; onConfirm: (name: string) => void }) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialName);
  const valid = isValidName(value);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-5 text-center animate-[fadein_.5s_ease]">
      <div className="mb-4 text-xs font-bold tracking-[0.35em] text-stone-500">THE TRADE-OFF</div>
      <h1 className="mb-3 text-4xl font-black tracking-tight text-stone-900">{t.ui.nameTitle}</h1>
      <p className="mb-8 max-w-xl text-base leading-relaxed text-stone-500">{t.ui.nameHint}</p>

      <label className="mb-6 block w-full max-w-sm text-left">
        <span className="mb-2 block text-xs font-bold tracking-widest text-stone-500 uppercase">{t.ui.nameLabel}</span>
        <input
          autoFocus
          value={value}
          maxLength={NAME_MAX}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) onConfirm(normalizeName(value));
          }}
          placeholder={t.ui.namePlaceholder}
          className="w-full rounded-2xl border-2 border-stone-900 bg-white px-5 py-4 text-lg font-semibold text-stone-900 shadow-[4px_4px_0_0_#1c1917] outline-none placeholder:font-normal placeholder:text-stone-400"
        />
      </label>

      <PrimaryButton disabled={!valid} onClick={() => onConfirm(normalizeName(value))}>
        {t.ui.nameConfirm}
      </PrimaryButton>
    </div>
  );
}

/** 榜单屏：优先展示云端（全班）数据，云端不可用时展示本机数据 */
export function LeaderboardScreen({ playerId, onClose }: { playerId: string; onClose: () => void }) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [scope, setScope] = useState<'cloud' | 'local'>(isCloudConfigured() ? 'cloud' : 'local');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return loadLeaderboard(playerId)
      .then((res) => {
        setEntries(res.entries);
        setScope(res.scope);
      })
      .finally(() => setLoading(false));
  }, [playerId]);

  useEffect(() => {
    let alive = true;
    loadLeaderboard(playerId)
      .then((res) => {
        if (!alive) return;
        setEntries(res.entries);
        setScope(res.scope);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [playerId]);

  const myRank = useMemo(() => rankOf(entries, playerId), [entries, playerId]);

  // 公用电脑场景：清空本机记录，避免下一个同学看到上一个人的分数
  const handleClear = () => {
    if (!window.confirm(t.ui.lbClearConfirm)) return;
    clearLocalEntries();
    void reload();
  };

  return (
    <ScreenShell
      kicker={t.ui.leaderboardTitle}
      children={
        <div>
          <p className="mb-6 text-sm text-stone-500">
            {scope === 'cloud' ? t.ui.leaderboardScopeCloud : t.ui.leaderboardScopeLocal}
          </p>

          {loading ? (
            <p className="py-12 text-center text-stone-400">…</p>
          ) : entries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 py-12 text-center text-stone-400">{t.ui.lbEmpty}</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="grid grid-cols-[3rem_1fr_4rem_5.5rem] items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-2.5 text-[11px] font-bold tracking-wide text-stone-500 uppercase">
                <span>{t.ui.lbRank}</span>
                <span>{t.ui.lbName}</span>
                <span className="text-right">{t.ui.lbScore}</span>
                <span className="text-right">{t.ui.lbInvestor} / {t.ui.lbStakeholder}</span>
              </div>
              <ol>
                {entries.map((e, i) => {
                  const mine = e.playerId === playerId;
                  const medal = i === 0 ? '#D9A514' : i === 1 ? '#9CA3AF' : i === 2 ? '#C2833F' : null;
                  return (
                    <li
                      key={e.playerId}
                      className={`grid grid-cols-[3rem_1fr_4rem_5.5rem] items-center gap-2 border-b border-stone-100 px-4 py-3 last:border-b-0 ${mine ? 'bg-[#FDF3EC]' : ''}`}
                    >
                      <span className="text-lg font-black tabular-nums" style={{ color: medal ?? '#78716C' }}>
                        {i + 1}
                      </span>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-semibold text-stone-900">{e.name}</span>
                        {mine && (
                          <span className="shrink-0 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold text-white">
                            {t.ui.lbYou}
                          </span>
                        )}
                        {e.failed && (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            {t.ui.lbFailed}
                          </span>
                        )}
                      </span>
                      <span className="text-right text-lg font-black tabular-nums text-stone-900">{e.score}</span>
                      <span className="text-right text-xs tabular-nums text-stone-500">
                        {e.investor} / {e.stakeholder}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <p className="mt-5 text-sm font-semibold text-stone-600">
            {myRank > 0 ? t.ui.lbMyRank(myRank, entries.length) : t.ui.lbNotRanked}
          </p>

          {scope === 'local' && (
            <button onClick={handleClear} className="mt-8 text-xs text-stone-400 underline hover:text-stone-600">
              {t.ui.lbClear}
            </button>
          )}
        </div>
      }
      footer={
        <div className="flex items-center gap-4">
          <PrimaryButton onClick={onClose}>{t.ui.lbClose}</PrimaryButton>
          <LanguageSwitcher />
        </div>
      }
    />
  );
}

/** 状态栏上的"以某名号游戏中"小标签（点击可看排行榜） */
export function PlayerTag({ name, onClick }: { name: string; onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      title={t.ui.leaderboard}
      className="max-w-40 truncate rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100"
    >
      {t.ui.playingAs(name)}
    </button>
  );
}
