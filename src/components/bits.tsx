import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Impact } from '@/game/types';

export function fmtDelta(v: number): string {
  return v > 0 ? `+${v}` : `${v}`;
}

export function ImpactChips({ impact }: { impact: Impact }) {
  const { t } = useLanguage();
  const chips: ReactNode[] = [];
  if (impact.investor) {
    chips.push(
      <span
        key="inv"
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          impact.investor > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {t.ui.impactInvestor} {fmtDelta(impact.investor)}
      </span>,
    );
  }
  if (impact.stakeholder) {
    chips.push(
      <span
        key="stk"
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          impact.stakeholder > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {t.ui.impactStakeholder} {fmtDelta(impact.stakeholder)}
      </span>,
    );
  }
  if (chips.length === 0) return null;
  return <div className="flex flex-wrap gap-2">{chips}</div>;
}

export function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-[10px] font-semibold tracking-wide text-stone-500">{label}</div>
      <div className="flex items-center gap-1.5">
        <div className="h-2 min-w-8 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="shrink-0 text-sm font-bold tabular-nums text-stone-900">{value}</span>
      </div>
    </div>
  );
}

export function ScreenShell({ kicker, children, footer }: { kicker?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-[fadein_.35s_ease] px-5 py-10">
      {kicker && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">{kicker}</span>
          <span className="h-px flex-1 bg-stone-300" />
        </div>
      )}
      {children}
      {footer && <div className="mt-10">{footer}</div>}
    </div>
  );
}

export function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-stone-900 px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
