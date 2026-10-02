import { useLanguage } from '@/i18n/LanguageContext';
import { LANGUAGE_OPTIONS } from '@/content';

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex shrink-0 rounded-full border border-stone-300 bg-white/80 p-0.5 shadow-sm backdrop-blur">
      {LANGUAGE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setLang(opt.id)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            lang === opt.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
