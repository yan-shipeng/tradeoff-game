// SSR 冒烟测试：在 Node 中渲染整个组件树，验证两种语言下 UI 正常出文
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { default as App } from './app-bundle.mjs';

let failures = 0;
function assert(cond, msg) {
  console.log((cond ? 'ok: ' : 'FAIL: ') + msg);
  if (!cond) failures++;
}

function shimEnv(lang) {
  const store = { 'tradeoff-lang': lang };
  Object.defineProperty(globalThis, 'localStorage', {
    value: { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = v) },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: { language: lang === 'zh' ? 'zh-CN' : 'en-US' },
    configurable: true,
  });
}

shimEnv('zh');
const zhHtml = renderToString(createElement(App));
assert(zhHtml.includes('权衡'), 'zh 标题渲染');
assert(zhHtml.includes('你能平衡利润与使命吗？'), 'zh 副标题渲染');
assert(zhHtml.includes('开始游戏'), 'zh 开始按钮渲染');
assert(zhHtml.includes('排行榜'), 'zh 首页有排行榜入口');
assert(!zhHtml.includes('Start game'), 'zh 页面不混入英文');

shimEnv('en');
const enHtml = renderToString(createElement(App));
assert(enHtml.includes('The Trade-off'), 'en 标题渲染');
assert(enHtml.includes('Can you balance profit and purpose?'), 'en 副标题渲染');
assert(enHtml.includes('Start game'), 'en 开始按钮渲染');
assert(enHtml.includes('Leaderboard'), 'en 首页有排行榜入口');

console.log(failures === 0 ? '\nSSR SMOKE PASSED' : `\n${failures} SSR CHECK(S) FAILED`);
process.exit(failures ? 1 : 0);
