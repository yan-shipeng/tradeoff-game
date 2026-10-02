import { LanguageProvider } from '@/i18n/LanguageContext';
import { Game } from '@/components/Game';

export default function App() {
  return (
    <LanguageProvider>
      <Game />
    </LanguageProvider>
  );
}
