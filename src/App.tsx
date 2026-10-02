import { LanguageProvider } from '@/i18n/LanguageContext';
import { PlayerProvider } from '@/i18n/PlayerContext';
import { Game } from '@/components/Game';

export default function App() {
  return (
    <LanguageProvider>
      <PlayerProvider>
        <Game />
      </PlayerProvider>
    </LanguageProvider>
  );
}
