import { content } from '../src/content/index.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { registeredMinigames } from '../src/features/minigames/registry.ts';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
const issues = validateContent(content);
for (const game of content.minigames) if (!registeredMinigames().includes(game.module)) issues.push(`未注册小游戏 ${game.module}`);
for (const [id, asset] of Object.entries(content.assets)) if (!existsSync(join('public', asset.url))) issues.push(`缺少资源 ${id}: ${asset.url}`);
if (content.chapters.length !== 5) issues.push('当前产品约定为五章：背景、三家小馆、结局');
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log(`内容检查通过：${content.chapters.length} 章，${content.dialogues.length} 组对话，${content.minigames.length} 个小游戏，${Object.keys(content.assets).length} 项资源。`);
