import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { usePlayer } from '@/i18n/PlayerContext';
import { initialGameState, makeReducer, type Action } from '@/game/state';
import { submitScore } from '@/game/cloud';
import { rankOf } from '@/game/leaderboard';
import {
  AllocationScreen,
  DilemmaScreen,
  EventScreen,
  FeedbackScreen,
  Landing,
  RecapScreen,
  ResponseScreen,
  ScoreScreen,
  StatusBar,
  StoryScreen,
  TopBar,
  YearRecapScreen,
} from './screens';
import { LeaderboardScreen, NameEntryScreen } from './Leaderboard';

export function Game() {
  const { t } = useLanguage();
  const { playerId, savedName, rememberName } = usePlayer();
  // content 随语言切换重建 reducer（React 每渲染都更新 lastRenderedReducer，状态保留）
  const reducer = useMemo(() => makeReducer(t), [t]);
  const [state, dispatchBase] = useReducer(reducer, initialGameState);
  const dispatch = (a: Action) => dispatchBase(a);

  // 结算后自动提交成绩，并拿回"我的名次"用于结算屏提示
  const [myRank, setMyRank] = useState(0);
  const submitted = useRef(false);

  useEffect(() => {
    if (state.screen !== 'score' || submitted.current || !state.playerName) return;
    submitted.current = true;
    submitScore(state, playerId, state.playerName).then((res) => {
      setMyRank(rankOf(res.entries, playerId));
    });
  }, [state, playerId]);

  useEffect(() => {
    if (state.screen !== 'score') submitted.current = false;
  }, [state.screen]);

  const inGame = !['landing', 'score', 'recap', 'nameEntry', 'leaderboard'].includes(state.screen);
  const showTopBar = state.screen === 'landing' || state.screen === 'score' || state.screen === 'recap';

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-stone-900">
      {showTopBar && <TopBar playerName={state.playerName} onOpenLeaderboard={() => dispatch({ type: 'OPEN_LEADERBOARD' })} />}
      {inGame && <StatusBar state={state} onOpenLeaderboard={() => dispatch({ type: 'OPEN_LEADERBOARD' })} />}
      <main className="pb-16">
        {state.screen === 'landing' && (
          <Landing
            onStart={() => dispatch({ type: 'START' })}
            onOpenLeaderboard={() => dispatch({ type: 'OPEN_LEADERBOARD' })}
          />
        )}

        {state.screen === 'nameEntry' && (
          <NameEntryScreen
            initialName={savedName}
            onConfirm={(name) => {
              rememberName(name);
              dispatch({ type: 'SET_NAME', name });
            }}
          />
        )}

        {state.screen === 'leaderboard' && (
          <LeaderboardScreen playerId={playerId} onClose={() => dispatch({ type: 'CLOSE_LEADERBOARD' })} />
        )}

        {state.screen === 'tutorial' && (
          <StoryScreen
            kicker={t.meta.title}
            paragraphs={[t.tutorial.pages[state.tutorialPage]]}
            button={state.tutorialPage < t.tutorial.pages.length - 1 ? t.ui.tutorialNext : t.ui.tutorialPlay}
            onNext={() => dispatch({ type: 'TUTORIAL_NEXT' })}
          />
        )}

        {state.screen === 'bridge' && (
          <StoryScreen
            kicker={t.meta.title}
            paragraphs={[t.turns[state.turn - 1].bridge ?? '']}
            button={t.ui.tutorialNext}
            onNext={() => dispatch({ type: 'NEXT_STORY' })}
          />
        )}

        {state.screen === 'intro' && (
          <StoryScreen
            kicker={t.ui.turnOf(state.turn)}
            paragraphs={[t.turns[state.turn - 1].intro]}
            button={t.ui.tutorialNext}
            onNext={() => dispatch({ type: 'NEXT_STORY' })}
          />
        )}

        {state.screen === 'allocate' && <AllocationScreen state={state} dispatch={dispatch} />}

        {state.screen === 'yearRecap' && <YearRecapScreen state={state} onNext={() => dispatch({ type: 'NEXT_FEEDBACK' })} />}

        {state.screen === 'feedback' && <FeedbackScreen state={state} onNext={() => dispatch({ type: 'NEXT_FEEDBACK' })} />}

        {state.screen === 'event' && <EventScreen state={state} onNext={() => dispatch({ type: 'NEXT_EVENT' })} />}

        {state.screen === 'dilemma' && <DilemmaScreen state={state} dispatch={dispatch} />}

        {state.screen === 'response' && <ResponseScreen state={state} onNext={() => dispatch({ type: 'NEXT_RESPONSE' })} />}

        {state.screen === 'score' && <ScoreScreen state={state} myRank={myRank} onNext={() => dispatch({ type: 'TO_RECAP' })} />}

        {state.screen === 'recap' && (
          <RecapScreen
            state={state}
            onRestart={() => dispatch({ type: 'RESTART' })}
            onOpenLeaderboard={() => dispatch({ type: 'OPEN_LEADERBOARD' })}
          />
        )}
      </main>
    </div>
  );
}
