import type { Asset } from '../core/contracts.ts';
import { spriteRegions } from './sprite-regions.ts';
const base = import.meta.env?.BASE_URL ?? '/';
const placeholder = (file: string, label: string, source: string): Asset => ({
  url: `${base}assets/placeholders/${file}`, label, source, placeholder: true,
});
export const assets: Record<string, Asset> = {
  ...Object.fromEntries(Object.entries(spriteRegions).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: id, source: '内置 imagegen；独立精灵区域，见 docs/art/第二章素材.md', placeholder: false, region: sprite.region, alphaCutoff: .13 }])),
  'morning-front': { url: `${base}assets/morning/front-v1.png`, label: '陈家 · 店门口', source: '内置 imagegen，新生成', placeholder: false },
  'morning-kitchen': { url: `${base}assets/morning/kitchen-v1.png`, label: '陈家 · 灶间', source: '内置 imagegen，新生成', placeholder: false },
  'morning-yard': { url: `${base}assets/morning/yard-v1.png`, label: '陈家 · 后院', source: '内置 imagegen，新生成', placeholder: false },
  courtyard: { url: `${base}assets/arrival/courtyard-clean-v2.png`, label: '归巷 · 桂花小院空场景', source: '内置 imagegen，新生成无交互物底图；见 docs/art/第二章素材.md', placeholder: false },
  'noon-front': { url: `${base}assets/noon/front-v1.png`, label: '琴记 · 店堂', source: '内置 imagegen', placeholder: false },
  'plain-noodle': { url: `${base}assets/noon/plain-bowl-v1.png`, label: '半份，不放葱', source: '内置 imagegen', placeholder: false },
  'noon-kitchen': { url: `${base}assets/noon/kitchen-v1.png`, label: '琴记 · 面案', source: '内置 imagegen', placeholder: false },
  'noon-corner': { url: `${base}assets/noon/corner-v1.png`, label: '琴记 · 柜边', source: '内置 imagegen', placeholder: false },
  grandmother: { url: `${base}assets/arrival/grandmother-v1.png`, label: '祖母 · 清晨', source: '内置 imagegen，新生成透明人物；提示词见 docs/art/第一章素材提示词.md', placeholder: false },
  street: placeholder('neighborhood-triptych.png', '旧街环境占位', 'archive/prototype/assets/neighborhood-triptych.png'),
  shops: placeholder('team-scenes.png', '三家店构图占位', 'references/team/队友素材/Embers-and-Echoes.zip → assets/scenes.png'),
  night: placeholder('rain-shop.png', '夜间小馆占位', 'archive/game-lab/public/assets/rain-shop.png'),
  model: placeholder('celadon-set.glb', '物件模型接入样本', 'archive/game-lab/public/assets/celadon-set.glb'),
  ambience: placeholder('rain-room.wav', '环境声样本', 'archive/game-lab/public/assets/rain-room.wav'),
};
