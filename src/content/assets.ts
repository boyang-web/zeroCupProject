import type { Asset } from '../core/contracts.ts';
import { spriteRegions } from './sprite-regions.ts';
import { uiRegions } from './ui-regions.ts';
import { arrivalHomeRegions } from './arrival-home-regions.ts';
import { morningRegions } from './morning-regions.ts';
const base = import.meta.env?.BASE_URL ?? '/';
const placeholder = (file: string, label: string, source: string): Asset => ({
  url: `${base}assets/placeholders/${file}`, label, source, placeholder: true,
});
const homeSprite = (id: keyof typeof arrivalHomeRegions, label: string): Asset => ({
  url: `${base}assets/${arrivalHomeRegions[id].file}`, label, region: arrivalHomeRegions[id].region,
  source: '内置 imagegen；老宅生活布局独立素材，见 docs/art/第一章老宅环境-v4.md', placeholder: false,
});
export const assets: Record<string, Asset> = {
  ...Object.fromEntries(Object.entries(spriteRegions).filter(([id]) => !id.startsWith('ui-')).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: id, source: '内置 imagegen；独立精灵区域，见 docs/art/第二章素材.md', placeholder: false, region: sprite.region, alphaCutoff: .13 }])),
  ...Object.fromEntries(Object.entries(morningRegions).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: sprite.label, source: '内置 imagegen；第二章经营与生活分区，见 docs/art/第二章环境与人物-v2.md', placeholder: false, region: sprite.region }])),
  ...Object.fromEntries(Object.entries(uiRegions).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: id, source: '内置 imagegen；桂影旧木 UI v2，见 docs/art/入口与第一章UI-v2.md', placeholder: false, region: sprite.region, alphaCutoff: .15 }])),
  'title-homecoming': { url: `${base}assets/title/homecoming-v1.png`, label: '百味录 · 木门里的长明巷', source: '内置 imagegen，桂影旧木风格，见 docs/art/入口与第一章UI-v2.md', placeholder: false },
  'recipe-rice': { url: `${base}assets/arrival/osmanthus-rice-v1.png`, label: '桂花米酒手绘食谱插图', source: '内置 imagegen，见 docs/art/入口与第一章UI-v2.md', placeholder: false, alphaCutoff: .13 },
  'courtyard-evening': { url: `${base}assets/arrival/courtyard-evening-v1.png`, label: '回访 · 灯亮起来的小院', source: '内置 imagegen，原小院仅改变光照，见 docs/art/入口与第一章UI-v2.md', placeholder: false },
  'morning-front': { url: `${base}assets/morning/front-v2.png`, label: '陈家 · 店门口', source: '内置 imagegen；售卖、取餐和等候区，见 docs/art/第二章环境与人物-v2.md', placeholder: false },
  'morning-kitchen': { url: `${base}assets/morning/kitchen-v2.png`, label: '陈家 · 灶间', source: '内置 imagegen；揉面、蒸制和干柜分开，见 docs/art/第二章环境与人物-v2.md', placeholder: false },
  'morning-yard': { url: `${base}assets/morning/yard-v2.png`, label: '陈家 · 后院', source: '内置 imagegen；洗手、个人收纳与吃早饭分开，见 docs/art/第二章环境与人物-v2.md', placeholder: false },
  courtyard: { url: `${base}assets/arrival/courtyard-clean-v2.png`, label: '归巷 · 桂花小院空场景', source: '内置 imagegen，新生成无交互物底图；见 docs/art/第二章素材.md', placeholder: false },
  'noon-front': { url: `${base}assets/noon/front-v1.png`, label: '琴记 · 店堂', source: '内置 imagegen', placeholder: false },
  'plain-noodle': { url: `${base}assets/noon/plain-bowl-v1.png`, label: '半份，不放葱', source: '内置 imagegen', placeholder: false },
  'noon-kitchen': { url: `${base}assets/noon/kitchen-v1.png`, label: '琴记 · 面案', source: '内置 imagegen', placeholder: false },
  'noon-corner': { url: `${base}assets/noon/corner-v1.png`, label: '琴记 · 柜边', source: '内置 imagegen', placeholder: false },
  grandmother: { url: `${base}assets/arrival/grandmother-v2.png`, label: '祖母 · 清晨', source: '内置 imagegen；修正坐姿和透明边缘，见 docs/art/第一章景深与素材修正.md', placeholder: false },
  'grandmother-seated': { url: `${base}assets/arrival/grandmother-seated-left-v3.png`, label: '奶奶 · 朝左就坐', source: '内置 imagegen；与藤椅同向的独立场景人物，见 docs/art/第一章景深与素材修正.md', placeholder: false },
  'arrival-home': { url: `${base}assets/arrival/old-house-main-v4.png`, label: '归巷 · 老宅堂屋', source: '内置 imagegen；由生活布局样稿制作的底图，见 docs/art/第一章老宅环境-v4.md', placeholder: false },
  'arrival-home-evening': { url: `${base}assets/arrival/old-house-evening-v4.png`, label: '回访 · 亮灯的老宅', source: '内置 imagegen；同构图夜间灯光版本，见 docs/art/第一章老宅环境-v4.md', placeholder: false },
  'grandmother-home': homeSprite('grandmother-home', '奶奶窗边的坐处'),
  'arrival-phone': homeSprite('arrival-phone', '放在进门柜上的手机'),
  'arrival-cup': homeSprite('arrival-cup', '座旁茶几上的温茶'),
  'arrival-book': homeSprite('arrival-book', '平放在写字台上的百味录'),
  'arrival-letter': homeSprite('arrival-letter', '进门柜上的家信和票根'),
  street: placeholder('neighborhood-triptych.png', '旧街环境占位', 'archive/prototype/assets/neighborhood-triptych.png'),
  shops: placeholder('team-scenes.png', '三家店构图占位', 'references/team/队友素材/Embers-and-Echoes.zip → assets/scenes.png'),
  night: placeholder('rain-shop.png', '夜间小馆占位', 'archive/game-lab/public/assets/rain-shop.png'),
  model: placeholder('celadon-set.glb', '物件模型接入样本', 'archive/game-lab/public/assets/celadon-set.glb'),
  ambience: placeholder('rain-room.wav', '环境声样本', 'archive/game-lab/public/assets/rain-room.wav'),
};
