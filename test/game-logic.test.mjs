// 无头逻辑测试：模拟完整 4 回合游戏，逐项断言计分与事件触发
import { makeReducer, initialGameState, zh, en } from './bundle.mjs';

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  } else {
    console.log('ok:', msg);
  }
}

// ---------- 语言内容结构一致性 ----------
assert(zh.areas.length === 4 && en.areas.length === 4, 'areas 数量一致');
assert(zh.turns.length === 4 && en.turns.length === 4, 'turns 数量一致');
assert(zh.dilemmas.length === 3 && en.dilemmas.length === 3, 'dilemmas 数量一致');
assert(
  JSON.stringify(zh.events.map((e) => e.id)) === JSON.stringify(en.events.map((e) => e.id)),
  '事件 id 顺序一致（zh/en）',
);
for (const a of zh.areas) {
  assert(a.feedback.length === 4 && a.feedback.every((t) => t.length === 4), `zh feedback 矩阵 4x4 (${a.id})`);
  assert(Array.isArray(a.thresholds) && a.thresholds.length === 3, `zh thresholds 存在 (${a.id})`);
  const enA = en.areas.find((x) => x.id === a.id);
  assert(JSON.stringify(a.thresholds) === JSON.stringify(enA.thresholds), `zh/en thresholds 一致 (${a.id})`);
}
// 对齐原游戏：四项满级所需累计投入 = growth 6 + 其余各 5
assert(JSON.stringify(zh.areas.map((a) => a.thresholds[2])) === '[6,5,5,5]', '满级阈值 6/5/5/5');
assert(zh.turns.map((t) => t.resources).join() === '10,8,10,10', '资源序列 10/8/10/10');

// ---------- 完整模拟一局 ----------
const reducer = makeReducer(zh);
let s = initialGameState;
const dispatch = (a) => {
  s = reducer(s, a);
};

dispatch({ type: 'START' });
for (let i = 0; i < 4; i++) dispatch({ type: 'TUTORIAL_NEXT' });
assert(s.screen === 'intro' && s.turn === 1, '教程结束进入回合 1 开场');

function runTurn(alloc, pick, expectEvents = null) {
  if (s.screen === 'bridge') dispatch({ type: 'NEXT_STORY' }); // 回合2起：bridge → intro
  dispatch({ type: 'NEXT_STORY' }); // intro → allocate
  assert(s.screen === 'allocate', '进入分配屏');
  for (const [area, level] of Object.entries(alloc)) {
    dispatch({ type: 'SET_LEVEL', area, level });
  }
  const sum = Object.values(alloc).reduce((x, y) => x + y, 0);
  assert(sum === zh.turns[s.turn - 1].resources, `第 ${s.turn} 回合分配总额合法 (${sum})`);
  dispatch({ type: 'CONFIRM_ALLOC' });
  assert(s.screen === 'yearRecap', '确认后进入年度回顾');
  if (expectEvents) assert(JSON.stringify(s.eventQueue) === JSON.stringify(expectEvents), `触发事件 = ${expectEvents} (实际 ${s.eventQueue})`);
  dispatch({ type: 'NEXT_FEEDBACK' });
  for (let i = 0; i < 4; i++) {
    assert(s.screen === 'feedback' && s.feedbackIdx === i, `反馈屏 ${i}`);
    dispatch({ type: 'NEXT_FEEDBACK' });
  }
  while (s.screen === 'event') dispatch({ type: 'NEXT_EVENT' });
  if (s.screen === 'dilemma') {
    dispatch({ type: 'PICK', option: pick });
    assert(s.screen === 'response', '进入两难回应');
    dispatch({ type: 'NEXT_RESPONSE' });
  }
}

// 回合 1: 3/2/2/3 → 累计 3/2/2/3 → 等级 1/1/1/2（thresholds: growth 1/4/6, 其余 1/3/5）
// inv-0.5, stk-0.5, stk-0.5, inv+1；事件 moonshot(inv-1)；两难选 0: inv-1 stk+0.5 → inv 4, stk 5
runTurn({ growth: 3, environment: 2, social: 2, longterm: 3 }, 0, ['moonshot']);
assert(s.investor === 4 && s.stakeholder === 5, `回合1结束分数 inv=4 stk=5 (实际 ${s.investor}/${s.stakeholder})`);
assert(s.turn === 2 && s.screen === 'bridge', '进入回合 2 过渡剧情');

// 回合 2 (8资源): 3/2/2/1 → 累计 6/4/4/4 → 等级 3/2/2/2
// inv+1, inv-0.5/stk+1, inv-0.5/stk+1, inv-0.5；事件 best-employer(inv+1 stk+1)、rd-backtrack；
// 两难选 1: inv-1 stk-0.5 → inv 3, stk 7.5
runTurn({ growth: 3, environment: 2, social: 2, longterm: 1 }, 1, ['best-employer', 'rd-backtrack']);
assert(s.investor === 3 && s.stakeholder === 7.5, `回合2结束分数 inv=3 stk=7.5 (实际 ${s.investor}/${s.stakeholder})`);

// 回合 3: 3/2/3/2 → 累计 9/6/7/6 → 等级 3/3/3/3；无事件；两难选 0: inv-0.5 stk+1 → inv 5.5, stk 11
runTurn({ growth: 3, environment: 2, social: 3, longterm: 2 }, 0, []);
assert(s.investor === 5.5 && s.stakeholder === 11, `回合3结束分数 inv=5.5 stk=11 (实际 ${s.investor}/${s.stakeholder})`);

// 回合 4: 3/2/3/2 → 四项满级 → score，inv 7, stk 14
runTurn({ growth: 3, environment: 2, social: 3, longterm: 2 }, 0);
assert(s.screen === 'score', '第 4 回合后进入结算');
assert(s.investor === 7 && s.stakeholder === 14, `最终分数 inv=7 stk=14 (实际 ${s.investor}/${s.stakeholder})`);
assert(s.picks.length === 3 && s.history.length === 4, '3 次两难选择 + 4 回合历史完整');

dispatch({ type: 'TO_RECAP' });
assert(s.screen === 'recap', '进入分配回顾');
dispatch({ type: 'RESTART' });
assert(s.screen === 'tutorial' && s.investor === 5 && s.stakeholder === 5, '重开后状态复位');

// ---------- SET_LEVEL 资源约束（对齐原游戏：单项只受剩余资源约束，无每回合单项上限） ----------
dispatch({ type: 'START' });
for (let i = 0; i < 4; i++) dispatch({ type: 'TUTORIAL_NEXT' });
dispatch({ type: 'NEXT_STORY' });
dispatch({ type: 'SET_LEVEL', area: 'growth', level: 3 });
dispatch({ type: 'SET_LEVEL', area: 'environment', level: 3 });
dispatch({ type: 'SET_LEVEL', area: 'social', level: 3 });
dispatch({ type: 'SET_LEVEL', area: 'longterm', level: 3 }); // 超出剩余资源，应被钳到 1
assert(s.draft.longterm === 1, `超额分配被钳制 longterm=1 (实际 ${s.draft.longterm})`);
dispatch({ type: 'SET_LEVEL', area: 'growth', level: 99 }); // 单项无 3 级硬上限，只受剩余资源约束：10-3-3-1=3
assert(s.draft.growth === 3, `等级被钳到剩余资源 growth=3 (实际 ${s.draft.growth})`);
dispatch({ type: 'SET_LEVEL', area: 'environment', level: 0 });
dispatch({ type: 'SET_LEVEL', area: 'social', level: 0 });
dispatch({ type: 'SET_LEVEL', area: 'longterm', level: 0 });
dispatch({ type: 'SET_LEVEL', area: 'growth', level: 99 }); // 空档时可单项投入全部 10 点（对齐原游戏）
assert(s.draft.growth === 10, `单项可拉满至全回合资源 growth=10 (实际 ${s.draft.growth})`);

console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
