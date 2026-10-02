// 无头逻辑测试：模拟完整 4 回合游戏，逐项断言计分与事件触发
import { makeReducer, initialGameState, zh, en, scoreOf, entryFromState, normalizeName, sortEntries, mergeEntries, rankOf, NAME_MAX } from './bundle.mjs';

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
dispatch({ type: 'SET_NAME', name: '测试玩家' });
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
  assert(sum === zh.turns[s.turn - 1].resources + s.adjust, `第 ${s.turn} 回合分配总额合法 (${sum})`);
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

// 回合 3 结束 inv=5.5 stk=11，均值 8.25 → 第 4 回合资源修正 +2（10→12）
assert(zh.turns[3].resources + s.adjust === 12, `第 4 回合资源 12 (实际 ${zh.turns[3].resources + s.adjust})`);
// 回合 4 (12资源): 4/2/3/3 → 四项满级 → score，inv 7, stk 14
runTurn({ growth: 4, environment: 2, social: 3, longterm: 3 }, 0);
assert(s.screen === 'score', '第 4 回合后进入结算');
assert(s.investor === 7 && s.stakeholder === 14, `最终分数 inv=7 stk=14 (实际 ${s.investor}/${s.stakeholder})`);
assert(s.picks.length === 3 && s.history.length === 4, '3 次两难选择 + 4 回合历史完整');

dispatch({ type: 'TO_RECAP' });
assert(s.screen === 'recap', '进入分配回顾');
dispatch({ type: 'RESTART' });
assert(s.screen === 'tutorial' && s.investor === 5 && s.stakeholder === 5, '重开后状态复位');

// ---------- SET_LEVEL 资源约束（对齐原游戏：单项只受剩余资源约束，无每回合单项上限） ----------
dispatch({ type: 'START' });
dispatch({ type: 'SET_NAME', name: '测试玩家' });
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

// ---------- 支持度 → 下回合资源修正 ----------
// 全押 growth 无视利益相关者：回合 1 结束 stk 应大幅受挫，回合 2 adjust 为负
dispatch({ type: 'START' });
dispatch({ type: 'SET_NAME', name: '测试玩家' });
for (let i = 0; i < 4; i++) dispatch({ type: 'TUTORIAL_NEXT' });
dispatch({ type: 'NEXT_STORY' });
dispatch({ type: 'SET_LEVEL', area: 'growth', level: 10 });
dispatch({ type: 'CONFIRM_ALLOC' });
dispatch({ type: 'NEXT_FEEDBACK' });
for (let i = 0; i < 4; i++) dispatch({ type: 'NEXT_FEEDBACK' });
while (s.screen === 'event') dispatch({ type: 'NEXT_EVENT' });
if (s.screen === 'dilemma') { dispatch({ type: 'PICK', option: 1 }); dispatch({ type: 'NEXT_RESPONSE' }); }
assert(s.adjust < 0, `差局下回合资源修正为负 (实际 ${s.adjust})`);
assert(zh.turns[1].resources + s.adjust < zh.turns[1].resources, '第 2 回合资源少于基础值');

// ---------- 名号与排行榜 ----------

// 名号清洗：去首尾空白 / 压连续空白 / 截断 / 空名回退
assert(normalizeName('  小林  ') === '小林', '名号去首尾空白');
assert(normalizeName('林   小   宝') === '林 小 宝', '名号压缩连续空白');
assert(normalizeName('一二三四五六七八九十十一十二十三') === '一二三四五六七八九十十一', `名号截断到 ${NAME_MAX}`);
assert(normalizeName('   ') === '匿名玩家', '空名回退为匿名玩家');

// 积分 = 双方支持度之和，负值按 0 计
assert(scoreOf({ investor: 7, stakeholder: 14 }) === 21, '积分 = 双方支持度之和');
assert(scoreOf({ investor: -1.5, stakeholder: 3 }) === 3, '积分把负支持度按 0 计');

// 出局玩家积分不为负、且带 failed 标记
const failEntry = entryFromState({ ...initialGameState, investor: -2, stakeholder: 4, failed: 'investor' }, 'p_fail', '出局者', 1000);
assert(failEntry.score === 4 && failEntry.failed === true, '出局记录 score=4 且 failed=true');

// 排序：积分降序 → 未出局优先 → 时间早者在前
const board = [
  { playerId: 'a', name: 'A', score: 10, investor: 5, stakeholder: 5, failed: false, at: 300 },
  { playerId: 'b', name: 'B', score: 18, investor: 9, stakeholder: 9, failed: false, at: 200 },
  { playerId: 'c', name: 'C', score: 10, investor: 6, stakeholder: 4, failed: true, at: 100 },
  { playerId: 'd', name: 'D', score: 10, investor: 5, stakeholder: 5, failed: false, at: 100 },
];
const sorted = sortEntries(board);
assert(sorted.map((e) => e.playerId).join() === 'b,d,a,c', `排序 积分降序→未出局优先→早者在前 (实际 ${sorted.map((e) => e.playerId).join()})`);

// 名次：第 1 名为 b；出局者 c 排最后
assert(rankOf(board, 'b') === 1, 'rankOf 第 1 名');
assert(rankOf(board, 'c') === 4, 'rankOf 出局者排最后');
assert(rankOf(board, 'nobody') === 0, 'rankOf 未上榜返回 0');

// 合并：同一 playerId 保留积分更高的那条（重复提交是覆盖，不是追加）
const mergedBoard = mergeEntries(
  [{ playerId: 'a', name: 'A', score: 10, investor: 5, stakeholder: 5, failed: false, at: 300 }],
  [
    { playerId: 'a', name: 'A', score: 16, investor: 8, stakeholder: 8, failed: false, at: 400 },
    { playerId: 'x', name: 'X', score: 12, investor: 6, stakeholder: 6, failed: false, at: 500 },
  ],
);
assert(mergedBoard.length === 2, `合并后去重为 2 条 (实际 ${mergedBoard.length})`);
assert(mergedBoard[0].playerId === 'a' && mergedBoard[0].score === 16, '同一玩家保留积分更高的记录');

// ---------- 名号/排行榜的状态机流转 ----------
const lbReducer = makeReducer(zh);
let ns = initialGameState;
const nd = (a) => {
  ns = lbReducer(ns, a);
};

nd({ type: 'START' });
assert(ns.screen === 'nameEntry', 'START 后先进入名号输入屏');
nd({ type: 'SET_NAME', name: '小林' });
assert(ns.screen === 'tutorial' && ns.playerName === '小林', 'SET_NAME 后带名号进入教程');

// 开局前可看排行榜并返回（此时已填过名号，回到教程屏）
nd({ type: 'OPEN_LEADERBOARD' });
assert(ns.screen === 'leaderboard', '可打开排行榜');
nd({ type: 'CLOSE_LEADERBOARD' });
assert(ns.screen === 'tutorial', '关闭排行榜回到进入前的教程屏');

// 完全未开局（无名号）时从首页打开榜单，关闭后回着陆页
nd({ type: 'RESTART' });
ns = { ...initialGameState };
const freshOpen = lbReducer(ns, { type: 'OPEN_LEADERBOARD' });
assert(freshOpen.returnScreen === 'landing', '首页打开榜单记住来源屏 landing');
assert(lbReducer(freshOpen, { type: 'CLOSE_LEADERBOARD' }).screen === 'landing', '无名号时关闭榜单回着陆页');

// 再来一局保留名号
const midGame = { ...ns, playerName: '小林', screen: 'recap', investor: 11, stakeholder: 9 };
const restarted = lbReducer(midGame, { type: 'RESTART' });
assert(restarted.screen === 'tutorial' && restarted.playerName === '小林', 'RESTART 保留名号');
assert(restarted.investor === 5 && restarted.stakeholder === 5, 'RESTART 重置支持度');

// 对局中关闭排行榜：必须原样退回进入榜单前的屏幕（不能把玩家从两难屏踢回分配屏）
const inGame = {
  ...ns,
  playerName: '小林',
  screen: 'dilemma',
  turn: 2,
  history: [{ growth: 1, environment: 1, social: 1, longterm: 1 }],
};
const opened = lbReducer(inGame, { type: 'OPEN_LEADERBOARD' });
assert(opened.screen === 'leaderboard' && opened.returnScreen === 'dilemma', '打开榜单记住来源屏 dilemma');
assert(lbReducer(opened, { type: 'CLOSE_LEADERBOARD' }).screen === 'dilemma', '从榜单原样退回两难屏');

// 结算屏打开榜单也要原样退回
const atScore = lbReducer({ ...inGame, screen: 'score' }, { type: 'OPEN_LEADERBOARD' });
assert(lbReducer(atScore, { type: 'CLOSE_LEADERBOARD' }).screen === 'score', '从榜单原样退回结算屏');

// 语言包具备排行榜全部文案
for (const [lang, c] of [['zh', zh], ['en', en]]) {
  const keys = ['nameTitle', 'nameHint', 'nameLabel', 'namePlaceholder', 'nameConfirm', 'leaderboard', 'leaderboardTitle', 'leaderboardScopeLocal', 'leaderboardScopeCloud', 'lbRank', 'lbName', 'lbScore', 'lbEmpty', 'lbYou', 'lbFailed', 'lbNotRanked', 'lbClose'];
  const missing = keys.filter((k) => typeof c.ui[k] !== 'string' || c.ui[k].length === 0);
  assert(missing.length === 0, `${lang} 排行榜文案齐全 (缺: ${missing.join() || '无'})`);
  assert(c.ui.playingAs('X').includes('X'), `${lang}.ui.playingAs 带名号`);
  assert(c.ui.scoreSubmitted(3).includes('3'), `${lang}.ui.scoreSubmitted 带名次`);
  assert(c.ui.lbMyRank(2, 9).includes('2') && c.ui.lbMyRank(2, 9).includes('9'), `${lang}.ui.lbMyRank 带名次与总数`);
}

console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
