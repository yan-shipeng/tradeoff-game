// 各屏幕组件：所有文案都取自 useLanguage()，支持任意时刻切换语言
import { useLanguage } from '@/i18n/LanguageContext';
import { AREA_COLORS, AREA_ORDER, MAX_LEVEL, classifyHappiness, cumulativeOf, levelFor, sumAllocation } from '@/game/types';
import type { Action, GameState } from '@/game/state';
import type { Dispatch } from 'react';
import { AREA_ICONS, FACES, HERO_IMAGE } from '@/assets/img';
import { ImpactChips, PrimaryButton, ScoreBar, ScreenShell } from './bits';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Landing({ onStart }: { onStart: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center animate-[fadein_.5s_ease]">
      <div className="mb-4 text-xs font-bold tracking-[0.35em] text-stone-500">THE TRADE-OFF</div>
      <img
        src={HERO_IMAGE}
        alt={t.meta.company}
        className="mb-8 w-full max-w-xl rounded-3xl border border-stone-200 shadow-sm"
      />
      <h1 className="mb-3 text-6xl font-black tracking-tight text-stone-900">{t.meta.title}</h1>
      <p className="mb-10 text-xl text-stone-600">{t.meta.subtitle}</p>
      <PrimaryButton onClick={onStart}>{t.meta.start}</PrimaryButton>
      <p className="mt-14 max-w-md text-xs leading-relaxed text-stone-400">{t.ui.madeWith}</p>
    </div>
  );
}

/** 圆形人物头像（插画为徽章式构图，圆形裁切即原游戏的 medallion 风格） */
export function FaceAvatar({ kind, value, size = 40 }: { kind: 'investor' | 'stakeholder'; value: number; size?: number }) {
  const mood = classifyHappiness(value);
  return (
    <img
      src={FACES[kind][mood]}
      alt={kind}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-stone-900/10 object-cover shadow-sm"
      style={{ width: size, height: size }}
    />
  );
}

export function StatusBar({ state }: { state: GameState }) {
  const { t } = useLanguage();
  const remaining = t.turns[state.turn - 1].resources + state.adjust - sumAllocation(state.draft);
  return (
    <div className="sticky top-0 z-40 border-b border-stone-200 bg-[#FAF8F5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
        <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">{t.ui.turnOf(state.turn)}</span>
        <div className="flex min-w-[220px] flex-1 gap-4">
          <div className="flex items-center gap-2">
            <FaceAvatar kind="investor" value={state.investor} size={36} />
            <ScoreBar label={t.ui.investors} value={state.investor} color="#F48158" />
          </div>
          <div className="flex items-center gap-2">
            <FaceAvatar kind="stakeholder" value={state.stakeholder} size={36} />
            <ScoreBar label={t.ui.stakeholders} value={state.stakeholder} color="#4C9A2A" />
          </div>
        </div>
        <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white tabular-nums">
          {t.ui.resources} {state.screen === 'allocate' ? remaining : t.turns[state.turn - 1].resources + state.adjust}
        </span>
        <LanguageSwitcher />
      </div>
    </div>
  );
}

/** 非游戏屏（着陆/结算/回顾）顶部的语言栏 */
export function TopBar() {
  return (
    <div className="mx-auto flex max-w-2xl justify-end px-5 pt-4">
      <LanguageSwitcher />
    </div>
  );
}

export function StoryScreen({ kicker, paragraphs, button, onNext }: { kicker: string; paragraphs: string[]; button: string; onNext: () => void }) {
  return (
    <ScreenShell
      kicker={kicker}
      children={
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-stone-800">
              {p}
            </p>
          ))}
        </div>
      }
      footer={<PrimaryButton onClick={onNext}>{button}</PrimaryButton>}
    />
  );
}

export function YearRecapScreen({ state, onNext }: { state: GameState; onNext: () => void }) {
  const { t } = useLanguage();
  return (
    <ScreenShell
      kicker={t.ui.turnOf(state.turn)}
      children={
        <div>
          <p className="mb-6 text-lg leading-relaxed text-stone-800">{t.ui.yearFollows}</p>
          <div className="flex flex-wrap gap-2">
            {AREA_ORDER.map((id) => (
              <span
                key={id}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                style={{ backgroundColor: AREA_COLORS[id] }}
              >
                {t.areas.find((a) => a.id === id)?.name} · {state.draft[id]}
              </span>
            ))}
          </div>
        </div>
      }
      footer={<PrimaryButton onClick={onNext}>{t.ui.tutorialNext}</PrimaryButton>}
    />
  );
}

export function AllocationScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const { t } = useLanguage();
  const resources = t.turns[state.turn - 1].resources + state.adjust;
  const remaining = resources - sumAllocation(state.draft);
  return (
    <ScreenShell
      kicker={t.ui.turnOf(state.turn)}
      children={
        <div>
          <h2 className="mb-2 text-2xl font-bold text-stone-900">{t.ui.allocateTitle}</h2>
          <p className={`text-sm text-stone-500 ${state.adjust !== 0 ? 'mb-2' : 'mb-8'}`}>
            {t.ui.remaining}：<span className="font-bold text-stone-900 tabular-nums">{remaining}</span>
          </p>
          {state.adjust !== 0 && (
            <p className={`mb-8 text-sm font-medium ${state.adjust > 0 ? 'text-[#4C9A2A]' : 'text-[#C2410C]'}`}>
              {t.ui.adjustNote(state.adjust)}
            </p>
          )}
          <div className="space-y-3">
            {t.areas.map((area) => {
              const level = state.draft[area.id];
              const others = AREA_ORDER.reduce((sum, k) => (k === area.id ? sum : sum + state.draft[k]), 0);
              const maxUp = resources - others;
              const cum = cumulativeOf(state.history)[area.id] + level;
              const lv = levelFor(cum, area.thresholds);
              return (
                <div key={area.id} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={AREA_ICONS[area.id]}
                      alt={area.name}
                      width={44}
                      height={44}
                      className="shrink-0 rounded-full border border-stone-900/10 bg-[#FAF8F5] object-cover"
                      style={{ width: 44, height: 44 }}
                    />
                    <div>
                      <span className="block text-base font-semibold text-stone-800">{area.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-stone-400">
                        <span>{t.ui.cumulative(cum, lv)}</span>
                        <span className="flex gap-1">
                          {Array.from({ length: MAX_LEVEL }, (_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 w-4 rounded-full ${i < lv ? '' : 'bg-stone-200'}`}
                              style={i < lv ? { backgroundColor: AREA_COLORS[area.id] } : undefined}
                            />
                          ))}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch({ type: 'SET_LEVEL', area: area.id, level: level - 1 })}
                      disabled={level <= 0}
                      className="h-9 w-9 rounded-full border border-stone-300 text-lg font-bold text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xl font-bold tabular-nums" style={{ color: AREA_COLORS[area.id] }}>
                      {level}
                    </span>
                    <button
                      onClick={() => dispatch({ type: 'SET_LEVEL', area: area.id, level: level + 1 })}
                      disabled={level >= maxUp}
                      className="h-9 w-9 rounded-full border border-stone-300 text-lg font-bold text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      footer={
        <PrimaryButton disabled={remaining !== 0} onClick={() => dispatch({ type: 'CONFIRM_ALLOC' })}>
          {t.ui.confirm}
        </PrimaryButton>
      }
    />
  );
}

export function FeedbackScreen({ state, onNext }: { state: GameState; onNext: () => void }) {
  const { t } = useLanguage();
  const area = t.areas[state.feedbackIdx];
  const cum = cumulativeOf(state.history)[area.id];
  const cell = area.feedback[state.turn - 1][levelFor(cum, area.thresholds)];
  const isLast = state.feedbackIdx === AREA_ORDER.length - 1;
  return (
    <ScreenShell
      kicker={area.name}
      children={
        <div>
          <div className="mb-5 h-1.5 w-16 rounded-full" style={{ backgroundColor: AREA_COLORS[area.id] }} />
          <p className="mb-6 text-lg leading-relaxed text-stone-800">{cell.text}</p>
          <ImpactChips impact={cell.impact} />
        </div>
      }
      footer={
        <div className="flex items-center gap-4">
          <PrimaryButton onClick={onNext}>{isLast ? t.ui.tutorialNext : t.ui.tutorialNext}</PrimaryButton>
          <span className="text-xs text-stone-400 tabular-nums">
            {state.feedbackIdx + 1} / {AREA_ORDER.length}
          </span>
        </div>
      }
    />
  );
}

export function EventScreen({ state, onNext }: { state: GameState; onNext: () => void }) {
  const { t } = useLanguage();
  const ev = t.events.find((e) => e.id === state.eventQueue[state.eventIdx]);
  if (!ev) return null;
  return (
    <ScreenShell
      kicker={t.ui.eventTag}
      children={
        <div>
          <p className="mb-6 text-lg leading-relaxed text-stone-800">{ev.text}</p>
          <ImpactChips impact={ev.impact} />
        </div>
      }
      footer={
        <div className="flex items-center gap-4">
          <PrimaryButton onClick={onNext}>{t.ui.tutorialNext}</PrimaryButton>
          <span className="text-xs text-stone-400 tabular-nums">
            {state.eventIdx + 1} / {state.eventQueue.length}
          </span>
        </div>
      }
    />
  );
}

export function DilemmaScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const { t } = useLanguage();
  const dilemma = t.dilemmas[state.turn - 1];
  if (!dilemma) return null;
  return (
    <ScreenShell
      kicker={t.ui.dilemmaTag}
      children={
        <div>
          <h2 className="mb-4 text-2xl font-bold leading-snug text-stone-900">{dilemma.title}</h2>
          <p className="mb-8 text-lg leading-relaxed text-stone-700">{dilemma.body}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {dilemma.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => dispatch({ type: 'PICK', option: i as 0 | 1 })}
                className="rounded-2xl border-2 border-stone-900 bg-white p-6 text-left text-lg font-semibold text-stone-900 shadow-[4px_4px_0_0_#1c1917] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1c1917]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}

export function ResponseScreen({ state, onNext }: { state: GameState; onNext: () => void }) {
  const { t } = useLanguage();
  const dilemma = t.dilemmas[state.turn - 1];
  const pick = state.picks[state.picks.length - 1] ?? 0;
  const option = dilemma.options[pick];
  return (
    <ScreenShell
      kicker={t.ui.responseTag}
      children={
        <div>
          <p className="mb-3 text-lg leading-relaxed text-stone-800">{option.response}</p>
          <p className="mb-6 text-sm font-medium text-stone-500">ℹ️ {t.ui.pickedBy(option.pickedPercent)}</p>
          <ImpactChips impact={option.impact} />
        </div>
      }
      footer={<PrimaryButton onClick={onNext}>{t.ui.tutorialNext}</PrimaryButton>}
    />
  );
}

export function ScoreScreen({ state, onNext }: { state: GameState; onNext: () => void }) {
  const { t } = useLanguage();
  const cls = (v: number) => (v <= 3 ? 'sad' : v <= 6.5 ? 'neutral' : 'happy');
  const ending = state.failed
    ? state.failed === 'investor'
      ? t.endings.investorFail
      : t.endings.stakeholderFail
    : t.endings[cls(state.investor)][cls(state.stakeholder)];
  return (
    <ScreenShell
      kicker={t.ui.finalScore}
      children={
        <div>
          <div className="mb-6 flex items-center gap-4">
            <FaceAvatar kind="investor" value={state.investor} size={72} />
            <FaceAvatar kind="stakeholder" value={state.stakeholder} size={72} />
          </div>
          <p className="mb-8 text-2xl font-bold leading-snug text-stone-900">{ending}</p>
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-stone-700">{t.ui.finalInvestor(Math.max(0, state.investor), t.endings.averageInvestor)}</p>
            <p className="text-stone-700">{t.ui.finalStakeholder(Math.max(0, state.stakeholder), t.endings.averageStakeholder)}</p>
          </div>
        </div>
      }
      footer={<PrimaryButton onClick={onNext}>{t.ui.recapTitle}</PrimaryButton>}
    />
  );
}

export function RecapScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const { t } = useLanguage();
  return (
    <ScreenShell
      kicker={t.ui.recapTitle}
      children={
        <div>
          <p className="mb-6 text-sm font-medium text-stone-500">{t.ui.yourAllocations}</p>
          <div className="space-y-4">
            {state.history.map((alloc, turnIdx) => (
              <div key={turnIdx} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="mb-3 text-xs font-bold tracking-widest text-stone-500">{t.ui.turnOf(turnIdx + 1)}</div>
                <div className="grid grid-cols-4 gap-2">
                  {AREA_ORDER.map((id) => (
                    <div key={id} className="text-center">
                      <div className="mx-auto mb-1 h-1.5 w-full rounded-full" style={{ backgroundColor: AREA_COLORS[id] }} />
                      <div className="text-lg font-bold text-stone-900 tabular-nums">{alloc[id]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      footer={<PrimaryButton onClick={onRestart}>{t.ui.playAgain}</PrimaryButton>}
    />
  );
}
