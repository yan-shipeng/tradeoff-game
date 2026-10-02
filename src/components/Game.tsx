import { useMemo, useReducer } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { initialGameState, makeReducer, type Action } from '@/game/state';
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

export function Game() {
  const { t } = useLanguage();
  // content 随语言切换重建 reducer（React 每渲染都更新 lastRenderedReducer，状态保留）
  const reducer = useMemo(() => makeReducer(t), [t]);
  const [state, dispatchBase] = useReducer(reducer, initialGameState);
  const dispatch = (a: Action) => dispatchBase(a);

  const inGame = !['landing', 'score', 'recap'].includes(state.screen);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-stone-900">
      {!inGame && <TopBar />}
      {inGame && <StatusBar state={state} />}
      <main className="pb-16">
        {state.screen === 'landing' && <Landing onStart={() => dispatch({ type: 'START' })} />}

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

        {state.screen === 'score' && <ScoreScreen state={state} onNext={() => dispatch({ type: 'TO_RECAP' })} />}

        {state.screen === 'recap' && <RecapScreen state={state} onRestart={() => dispatch({ type: 'RESTART' })} />}
      </main>
    </div>
  );
}
