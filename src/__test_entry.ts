// 测试入口：仅用于 esbuild 打包后在 Node 中验证游戏逻辑（不参与应用构建）
export * from './game/types';
export * from './game/state';
export { default as zh } from './content/zh';
export { default as en } from './content/en';
