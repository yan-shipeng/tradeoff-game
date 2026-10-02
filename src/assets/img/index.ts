// 游戏插画资源：人物表情（投资者/利益相关者 × 开心/一般/难过）、领域图标、主视觉
// 全部为 AI 生成的本土化插画，FT editorial spot illustration 风格，暖色系与游戏 UI 一致。
import investorHappy from './investor-happy.png';
import investorNeutral from './investor-neutral.png';
import investorSad from './investor-sad.png';
import stakeholderHappy from './stakeholder-happy.png';
import stakeholderNeutral from './stakeholder-neutral.png';
import stakeholderSad from './stakeholder-sad.png';
import iconGrowth from './icon-growth.png';
import iconEnvironment from './icon-environment.png';
import iconSocial from './icon-social.png';
import iconLongterm from './icon-longterm.png';
import heroFactory from './hero-factory.jpg';

import type { AreaId, Happiness } from '@/game/types';

export const FACES: Record<'investor' | 'stakeholder', Record<Happiness, string>> = {
  investor: { happy: investorHappy, neutral: investorNeutral, sad: investorSad },
  stakeholder: { happy: stakeholderHappy, neutral: stakeholderNeutral, sad: stakeholderSad },
};

export const AREA_ICONS: Record<AreaId, string> = {
  growth: iconGrowth,
  environment: iconEnvironment,
  social: iconSocial,
  longterm: iconLongterm,
};

export const HERO_IMAGE = heroFactory;
