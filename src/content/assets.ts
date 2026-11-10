import type { Asset } from '../core/contracts.ts';
import { epilogueRegions } from './epilogue-regions.ts';
import { spriteRegions } from './sprite-regions.ts';
import { uiRegions } from './ui-regions.ts';
import { arrivalHomeRegions } from './arrival-home-regions.ts';
import { morningRegions } from './morning-regions.ts';
import { noonRegions } from './noon-regions.ts';
import { nightRegions } from './night-regions.ts';
const base = import.meta.env?.BASE_URL ?? '/';
const placeholder = (file: string, label: string, source: string): Asset => ({
  url: `${base}assets/placeholders/${file}`, label, source, placeholder: true,
});
const homeSprite = (id: keyof typeof arrivalHomeRegions, label: string): Asset => ({
  url: `${base}assets/${arrivalHomeRegions[id].file}`, label, region: arrivalHomeRegions[id].region,
  source: '内置 imagegen；老宅生活布局独立素材，见 docs/art/第一章老宅环境-v4.md', placeholder: false,
});
export const assets: Record<string, Asset> = {
  'intro-travel-bag': { url: `${base}assets/intro/travel-bag-v1.png`, label: '小满回家时的帆布旅行包', source: '内置 imagegen；独立透明素材，生成记录见 docs/art/沉浸开场-v3.md', placeholder: false },
  'intro-door': { url: `${base}assets/intro/home-door-v2.png`, label: '归乡引子 · 暖木家门', source: '用户提供归档.zip；包内标注为内置 imagegen，原登记见 docs/art/开场材质与交互-v2.md', placeholder: false },
  ...Object.fromEntries([
    ['music-home','灯下 · 家里的轻配乐'],['music-day','巷里 · 白天小馆轻配乐'],['music-night','门灯 · 夜饭小馆轻配乐'],
    ['sfx-wood','木面轻触'],['sfx-paper','纸页翻动'],['sfx-cup','杯碟轻碰'],['sfx-door','场景通路轻木声'],
  ].map(([id,label])=>[id!,{url:`${base}assets/audio/${id}.wav`,label:label!,source:'本工程原创合成旋律与音色；scripts/generate-soundscape.py，见 public/assets/audio/README.md',placeholder:false}])),
  'morning-breakfast-bowl': { url: `${base}assets/morning/breakfast-single-bun-bowl-v4.png`, label: '一只青花碗里的一只包子', source: '内置 imagegen；单包子碗独立透明资产，见 docs/art/第二章早餐碗与桌面-v4.md', placeholder: false, alphaCutoff: .5, region: { x: 230, y: 110, width: 1045, height: 835, canvasWidth: 1536, canvasHeight: 1024 } },
  'epilogue-grandma-table': { url: `${base}assets/epilogue/grandmother-table-v3.png`, label: '奶奶 · 长桌旁侧身坐姿', source: '内置 imagegen；参考原奶奶与长桌底图调整俯视角和朝向，见 docs/art/epilogue/table-layout-v3.md', placeholder: false, alphaCutoff: .08, region: { x: 0, y: 0, width: 1024, height: 1536, canvasWidth: 1024, canvasHeight: 1536 } },
  ...Object.fromEntries([['epilogue-table-night', 'table-night-v4'], ['epilogue-gate-dawn', 'gate-dawn-v2']].map(([id, file]) => [id!, { url: `${base}assets/epilogue/${file}.png`, label: id!, source: '内置 imagegen；第五章独立桌边与次晨院门取景；桌边v4见 docs/art/epilogue/table-layout-v4.md，院门见 scene-revision-v2.md', placeholder: false }])),
  'epilogue-grandma': { url: `${base}assets/epilogue/grandmother-seated-v2.png`, label: '奶奶 · 灯下高清坐姿', source: '内置 imagegen；独立高清透明人物，见 docs/art/epilogue/grandmother-v2.md', placeholder: false, alphaCutoff: .08, region: { x: 16, y: 12, width: 982, height: 1524, canvasWidth: 1024, canvasHeight: 1536 } },
  ...Object.fromEntries(['night', 'dawn'].map(id => [`epilogue-${id}`, { url: `${base}assets/epilogue/${id}-v1.png`, label: `灯下 · ${id}`, source: '内置 imagegen；第五章效果图后资产化，见 docs/art/epilogue/prompts.md', placeholder: false }])),
  ...Object.fromEntries(Object.entries(epilogueRegions).map(([id, [x, y, width, height]]) => [id, { url: `${base}assets/epilogue/sprites-v1.png`, label: id, source: '内置 imagegen；第五章透明独立精灵，见 docs/art/epilogue/prompts.md', placeholder: false, alphaCutoff: .22, region: { x, y, width, height, canvasWidth: 2172, canvasHeight: 724 } }])),
  'journal-paper': { url: `${base}assets/journal/paper-fibers-v1.png`, label: '百味录 · 细纤维书写纸', source: '内置 imagegen；独立纸面材质，见 docs/art/百味录纸张材质-v1.md', placeholder: false },
  ...Object.fromEntries(Object.entries(nightRegions).map(([id, s]) => [id, { url: `${base}assets/${s.file}`, label: id, region: s.region, source: '内置 imagegen；第四章暖木夜饭素材，见 docs/art/night/prompts.md', placeholder: false, alphaCutoff: .15 }])),
  ...Object.fromEntries(['front', 'kitchen', 'counter'].map(id => [`night-${id}`, { url: `${base}assets/night/${id}-v1.png`, label: `夜饭小馆 · ${id}`, source: '内置 imagegen；由第四章三场景效果图资产化，见 docs/art/night/prompts.md', placeholder: false }])),
  ...Object.fromEntries(Object.entries(spriteRegions).filter(([id]) => !id.startsWith('ui-')).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: id, source: '内置 imagegen；独立精灵区域，见 docs/art/第二章素材.md', placeholder: false, region: sprite.region, alphaCutoff: .13 }])),
  ...Object.fromEntries(Object.entries(morningRegions).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: sprite.label, source: '内置 imagegen；第二章经营与生活分区，见 docs/art/第二章环境与人物-v2.md', placeholder: false, region: sprite.region }])),
  ...Object.fromEntries(Object.entries(noonRegions).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: sprite.label, source: '内置 imagegen；第三章营业与出餐布局，见 docs/art/第三章琴记场景与人物-v2.md', placeholder: false, region: sprite.region, alphaCutoff: .08, ...(id === 'noon-menu' ? { inscription: { lines: ['琴记清汤面', '半份也做', '忌口请写在单上'] } } : {}) }])),
  ...Object.fromEntries(Object.entries(uiRegions).map(([id, sprite]) => [id, { url: `${base}assets/${sprite.file}`, label: id, source: '内置 imagegen；桂影旧木 UI v2，见 docs/art/入口与第一章UI-v2.md', placeholder: false, region: sprite.region, alphaCutoff: .15 }])),
  'title-homecoming': { url: `${base}assets/title/homecoming-v1.png`, label: '百味录 · 木门里的长明巷', source: '内置 imagegen，桂影旧木风格，见 docs/art/入口与第一章UI-v2.md', placeholder: false },
  'recipe-rice': { url: `${base}assets/arrival/osmanthus-rice-v1.png`, label: '桂花米酒手绘食谱插图', source: '内置 imagegen，见 docs/art/入口与第一章UI-v2.md', placeholder: false, alphaCutoff: .13 },
  'courtyard-evening': { url: `${base}assets/arrival/courtyard-evening-v1.png`, label: '回访 · 灯亮起来的小院', source: '内置 imagegen，原小院仅改变光照，见 docs/art/入口与第一章UI-v2.md', placeholder: false },
  'morning-front': { url: `${base}assets/morning/front-v2.png`, label: '陈家 · 店门口', source: '内置 imagegen；售卖、取餐和等候区，见 docs/art/第二章环境与人物-v2.md', placeholder: false },
  'morning-kitchen': { url: `${base}assets/morning/kitchen-v2.png`, label: '陈家 · 灶间', source: '内置 imagegen；揉面、蒸制和干柜分开，见 docs/art/第二章环境与人物-v2.md', placeholder: false },
  'morning-yard': { url: `${base}assets/morning/yard-v2.png`, label: '陈家 · 后院', source: '内置 imagegen；洗手、个人收纳与吃早饭分开，见 docs/art/第二章环境与人物-v2.md', placeholder: false },
  courtyard: { url: `${base}assets/arrival/courtyard-clean-v2.png`, label: '归巷 · 桂花小院空场景', source: '内置 imagegen，新生成无交互物底图；见 docs/art/第二章素材.md', placeholder: false },
  'noon-front': { url: `${base}assets/noon/front-v2.png`, label: '琴记 · 店堂', source: '内置 imagegen；人物坐处与取餐通道分开，见 docs/art/第三章琴记场景与人物-v2.md', placeholder: false },
  'noon-kitchen': { url: `${base}assets/noon/kitchen-v2.png`, label: '琴记 · 面案', source: '内置 imagegen；揉面、两口锅与洁净出餐位，见 docs/art/第三章琴记场景与人物-v2.md', placeholder: false },
  'noon-corner': { url: `${base}assets/noon/corner-v2.png`, label: '琴记 · 接单柜', source: '内置 imagegen；干燥接单台与裁缝铺对景，见 docs/art/第三章琴记场景与人物-v2.md', placeholder: false },
  grandmother: { url: `${base}assets/arrival/grandmother-v2.png`, label: '祖母 · 清晨', source: '内置 imagegen；修正坐姿和透明边缘，见 docs/art/第一章景深与素材修正.md', placeholder: false },
  'grandmother-seated': { url: `${base}assets/arrival/grandmother-seated-left-v3.png`, label: '奶奶 · 朝左就坐', source: '内置 imagegen；与藤椅同向的独立场景人物，见 docs/art/第一章景深与素材修正.md', placeholder: false },
  'arrival-home': { url: `${base}assets/arrival/old-house-main-v4.png`, label: '归巷 · 老宅堂屋', source: '内置 imagegen；由生活布局样稿制作的底图，见 docs/art/第一章老宅环境-v4.md', placeholder: false },
  'arrival-home-evening': { url: `${base}assets/arrival/old-house-evening-v4.png`, label: '回访 · 亮灯的老宅', source: '内置 imagegen；同构图夜间灯光版本，见 docs/art/第一章老宅环境-v4.md', placeholder: false },
  'grandmother-home': homeSprite('grandmother-home', '奶奶窗边的坐处'),
  'arrival-phone': homeSprite('arrival-phone', '放在进门柜上的手机'),
  'arrival-cup': homeSprite('arrival-cup', '座旁茶几上的温茶'),
  'arrival-book': homeSprite('arrival-book', '平放在写字台上的百味录'),
  'arrival-letter': homeSprite('arrival-letter', '进门柜上的家信和票根'),
  'arrival-thread-spool': { url: `${base}assets/arrival/thread-spool-v5.svg`, label: '奶奶的白线轴', source: '原创 SVG 木线轴与棉线，见 docs/art/第一三章生活道具-v5.md', placeholder: false },
  'arrival-grocery-slip': { url: `${base}assets/morning/sample-sheet-v3.svg`, label: '旧书里取出的购物便条', source: '复用本工程原创折纸图形；文字独立，见 docs/art/第一三章生活道具-v5.md', placeholder: false },
  'noon-work-slip': { url: `${base}assets/morning/sample-sheet-v3.svg`, label: '田姨的改衣单', source: '复用本工程原创折纸图形；文字独立，见 docs/art/第一三章生活道具-v5.md', placeholder: false },
  'morning-school-drawing': { url: `${base}assets/morning/school-drawing-v3.svg`, label: '小朱画的教室', source: '原创 SVG 纸本道具；文字独立显示，见 docs/art/第二章生活道具-v3.md', placeholder: false },
  'morning-chalk-boxes': { url: `${base}assets/morning/chalk-boxes-v3.svg`, label: '阿宁新买的三盒粉笔', source: '原创 SVG 纸袋与粉笔盒，见 docs/art/第二章生活道具-v3.md', placeholder: false },
  'morning-sample-sheet': { url: `${base}assets/morning/sample-sheet-v3.svg`, label: '平放的样面安排', source: '原创 SVG 折纸道具；与墙上夹板分开，见 docs/art/第二章生活道具-v3.md', placeholder: false },
  street: placeholder('neighborhood-triptych.png', '旧街环境占位', 'archive/prototype/assets/neighborhood-triptych.png'),
  shops: placeholder('team-scenes.png', '三家店构图占位', 'references/team/队友素材/Embers-and-Echoes.zip → assets/scenes.png'),
  night: placeholder('rain-shop.png', '夜间小馆占位', 'archive/game-lab/public/assets/rain-shop.png'),
  model: placeholder('celadon-set.glb', '物件模型接入样本', 'archive/game-lab/public/assets/celadon-set.glb'),
  ambience: placeholder('rain-room.wav', '环境声样本', 'archive/game-lab/public/assets/rain-room.wav'),
};
