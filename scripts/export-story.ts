import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { baseParse, NodeTypes } from '@vue/compiler-dom';
import { content } from '../src/content/index.ts';
import { scenesOf } from '../src/core/scenes.ts';
import type { Action, Condition, Dialogue, Exhibit, Hotspot, MinigameDefinition, SceneDefinition } from '../src/core/contracts.ts';

const output = new URL('../docs/百味录全站剧情文本.md', import.meta.url);
const lines: string[] = [];
const sourceTexts = new Set<string>();
const exportedDialogues = new Set<string>();
const exportedNodes = new Set<string>();
const exportedObjects = new Set<string>();
const exportedGames = new Set<string>();
let versionCount = 0;

function line(value = '') { lines.push(value); }
function text(value?: string) {
  if (!value) return;
  sourceTexts.add(value); line(value); line();
}
function heading(level: number, value: string, id?: string) {
  if (id) { line(`<a id="${id}"></a>`); line(); }
  line(`${'#'.repeat(level)} ${value}`); line();
}
const anchor = (dialogueId: string, nodeId: string) => `dialogue-${dialogueId}-${nodeId}`;
const nodeLink = (dialogueId: string, nodeId: string) => `[${nodeId}](#${anchor(dialogueId, nodeId)})`;
const name = (kind: 'clues' | 'items' | 'metrics' | 'quests', id: string) => content[kind].find(entry => entry.id === id)?.title ?? id;
function condition(value?: Condition): string {
  if (!value) return '始终可用';
  switch (value.kind) {
    case 'flag': return `标记 \`${value.id}\` 已发生`;
    case 'clue': return `已获得「${name('clues', value.id)}」\`${value.id}\``;
    case 'reward': return `已完成动作 \`${value.id}\``;
    case 'item': return `持有「${name('items', value.id)}」至少 ${value.count ?? 1} 件`;
    case 'metric': return `「${name('metrics', value.id)}」≥ ${value.min}`;
    case 'quest': return `「${name('quests', value.id)}」${{ active: '进行中', completed: '已完成', failed: '未达成' }[value.status]}`;
    case 'not': return `不满足（${condition(value.condition)}）`;
    case 'all': return value.conditions.map(c => `（${condition(c)}）`).join(' 且 ');
    case 'any': return value.conditions.map(c => `（${condition(c)}）`).join(' 或 ');
  }
}
function meta(label: string, value?: string) { if (value) { line(`${label}：${value}`); line(); } }
function namedText(label: string, value?: string) {
  if (!value) return;
  line(`**${label}**`); line(); text(value);
}
function action(value: Action, label: string) {
  namedText(`${label}（${value.id}）`, value.label);
  if (value.condition) meta('开放条件', condition(value.condition));
  namedText('暂不可用时的提示', value.unavailable);
  namedText('操作后的回应', value.feedback);
}
function exhibit(value: Exhibit, label = '实物上的文字') {
  line(`**${label}**`); line();
  text(value.kicker); text(value.title);
  if (value.phone) {
    namedText('手机时间', value.phone.time);
    namedText('手机页头', value.phone.heading);
  }
  for (const entry of value.lines) text(entry);
  namedText('题注', value.caption); namedText('页尾', value.footer);
  if (value.phone) namedText('手机页尾', value.phone.footer);
}
function variants(values: SceneDefinition['variants'], label: string) {
  values?.forEach((variant, index) => {
    if (!variant.description && !variant.time) return;
    line(`**${label} ${index + 1}**`); line();
    meta('出现条件', condition(variant.condition));
    namedText('时间', variant.time); text(variant.description);
  });
}
function object(value: Hotspot, chapterId: string) {
  heading(4, `${value.label}（${value.id}）`);
  if (value.condition) meta('出现条件', condition(value.condition));
  const interaction = value.interaction;
  if (interaction.kind === 'inspect') {
    exportedObjects.add(`${chapterId}/${value.id}`);
    text(interaction.text);
    if (interaction.exhibit) exhibit(interaction.exhibit);
    interaction.versions?.forEach((version, index) => {
      versionCount++;
      line(`**阶段版本 ${index + 1}**`); line();
      meta('出现条件', condition(version.condition)); text(version.text);
      if (version.exhibit) exhibit(version.exhibit, '这一阶段的实物文字');
    });
    if (interaction.action) action(interaction.action, '翻看／阅读动作');
    interaction.options?.forEach(option => action(option, '可选操作'));
    if (interaction.activityId) meta('可接续的物件玩法', `\`${interaction.activityId}\``);
  } else if (interaction.kind === 'dialogue') {
    meta('关联对白', `[${interaction.dialogueId}](#dialogue-${interaction.dialogueId})`);
    if (interaction.entry) meta('指定入口', nodeLink(interaction.dialogueId, interaction.entry));
  } else {
    meta('关联玩法', `\`${interaction.gameId}\``);
  }
  // Legacy drag.hint is retained in content for compatibility but is no longer
  // rendered. Do not reintroduce those removed instructions into the reading copy.
}
function orderedNodes(dialogue: Dialogue) {
  const visited = new Set<string>();
  const result: Dialogue['nodes'] = [];
  function visit(id: string) {
    if (visited.has(id)) return;
    const node = dialogue.nodes.find(node => node.id === id);
    assert.ok(node, `Missing dialogue node: ${dialogue.id}/${id}`);
    visited.add(id); result.push(node);
    for (const choice of node.choices) if (choice.next) visit(choice.next);
  }
  visit(dialogue.entry);
  // Progress/revisit entries may be disconnected from the opening graph.
  for (const node of dialogue.nodes) visit(node.id);
  return result;
}
function dialogue(value: Dialogue, locations: string[]) {
  exportedDialogues.add(value.id);
  heading(3, `对白：${[...new Set(locations)].join('、')}（${value.id}）`, `dialogue-${value.id}`);
  meta('默认入口', nodeLink(value.id, value.entry));
  if (value.entries?.length) {
    line('**进度与回访入口（按游戏判定优先级）**'); line();
    for (const entry of value.entries) line(`- ${condition(entry.condition)} → ${nodeLink(value.id, entry.nodeId)}`);
    line();
  }
  for (const node of orderedNodes(value)) {
    exportedNodes.add(`${value.id}/${node.id}`);
    heading(4, `节点 ${node.id}`, anchor(value.id, node.id));
    namedText('开场动作', node.direction);
    if (node.beats?.length) {
      for (const beat of node.beats) {
        namedText('动作', beat.direction);
        if (beat.kind === 'speech') {
          line(`**${beat.speaker}：**`); line();
        }
        text(beat.text);
      }
    } else {
      line(`**${node.speaker}：**`); line(); text(node.text);
    }
    node.versions?.forEach((version,index)=>{
      line(`**阶段对白 ${index+1}**`);line();meta('出现条件',condition(version.condition));
      for(const beat of version.beats){namedText('动作',beat.direction);if(beat.kind==='speech'){line(`**${beat.speaker}：**`);line();}text(beat.text);}
    });
    line('**可选回应／行动**'); line();
    for (const choice of node.choices) {
      line(`- **${choice.label}**（\`${choice.id}\`）`);
      sourceTexts.add(choice.label);
      line(`  ${choice.next ? `前往 ${nodeLink(value.id, choice.next)}` : choice.activityId ? `接续物件玩法 \`${choice.activityId}\`` : '结束本次交谈'}`);
      if (choice.condition) line(`  开放条件：${condition(choice.condition)}`);
      if (choice.decision) line(`  决定记录：\`${choice.decision}\``);
      line();
      namedText('不可选时的提示', choice.unavailable);
      namedText('选择后的回应', choice.feedback);
    }
  }
}
function game(value: MinigameDefinition) {
  exportedGames.add(value.id);
  heading(4, `${value.title}（${value.id}）`);
  text(value.description);
  if (value.condition) meta('开放条件', condition(value.condition));
  namedText('暂不可用时的提示', value.unavailable);
  for (const slip of value.itinerary?.slips ?? []) {
    namedText(`书签：${slip.title}（${slip.id}）`, slip.detail);
  }
  for (const slot of value.itinerary?.slots ?? []) {
    namedText(`时段：${slot.label}（${slot.id}）`, slot.time);
  }
  for (const filling of value.breakfast?.fillings ?? []) namedText('可选馅料', filling);
  for (const order of value.breakfast?.orders ?? []) {
    namedText(`早饭要求：${order.person}（${order.id}）`, order.hint);
    namedText('馅料', order.filling); meta('数量', String(order.count));
  }
  for (const task of value.breakfast?.packaging ?? []) {
    heading(5,`分装：${task.title}`);
    for(const choice of task.choices)text(choice.label);
    namedText('分装不符时的回应',task.wrong);
  }
  if(value.breakfast?.copy){
    heading(5,'带做时的对白与回应');
    const labels:Record<string,string>={intro:'开始下一笼',checkOrders:'份量不齐时',beforeSteam:'上汽前',early:'提前揭盖',late:'火急了',steamed:'准备出笼',helped:'请陈伯带做',packed:'分装完成'};
    for(const[key,entry]of Object.entries(value.breakfast.copy)){
      if(typeof entry==='string')namedText(labels[key]??key,entry);
      else for(const[label,words]of Object.entries(entry))namedText(value.breakfast.orders.find(order=>order.id===label)?.person??label,words);
    }
  }
  for (const ticket of value.service?.tickets ?? []) {
    heading(5, `面单：${ticket.person}（${ticket.id}）`);
    text(ticket.note);
    meta('制作／交付时限', `占锅 ${ticket.cook} 分钟；期限 ${ticket.deadline} 分钟`);
    if (ticket.half) meta('份量', '半份');
    if (ticket.noScallion) meta('忌口', '不放葱');
  }
  if(value.service?.copy){
    heading(5,'排单时的对白与回应');
    const labels:Record<string,string>={intro:'开始排单',missing:'还有单没排',wrongHalf:'份量不对',wrongScallion:'忘了忌口',orderError:'顺序超时',help:'请琴姐指点',ready:'核对完成'};
    for(const[key,entry]of Object.entries(value.service.copy)){
      if(typeof entry==='string')namedText(labels[key]??key,entry);
      else for(const[id,words]of Object.entries(entry))namedText(value.service.tickets.find(ticket=>ticket.id===id)?.person??id,words);
    }
  }
  for (const order of value.packing?.orders ?? []) {
    namedText(`分装要求：${order.person}（${order.id}）`, order.hint);
    meta('容器', order.vessel === 'bowl' ? '浅碗' : '饭盒');
    meta('辣酱', order.sauce === 'rim' ? '碗沿' : '另杯');
    meta('筷子', order.utensils === 'beside' ? '碗旁' : '盒外');
  }
  action(value.reward, '完成后的行动与回应');
}

function supplementalText() {
  const registryPath = new URL('../src/features/minigames/registry.ts', import.meta.url);
  const registry = ts.createSourceFile('registry.ts', readFileSync(registryPath, 'utf8'), ts.ScriptTarget.Latest, true);
  const components = new Map<string, string>();
  function findModules(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && ts.isArrowFunction(node.initializer)) {
      function findImport(child: ts.Node) {
        if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(child.arguments[0]!)) {
          components.set(node.name.getText(registry).replace(/^['"]|['"]$/g, ''), child.arguments[0]!.text);
        }
        ts.forEachChild(child, findImport);
      }
      findImport(node.initializer);
    }
    ts.forEachChild(node, findModules);
  }
  findModules(registry);
  const files = new Map<string, string>([
    ['src/features/title/IntroJourney.vue', '小满归途引子的叙述与实物文字'],
    ['src/features/exploration/PhysicalObject.vue', '翻阅实物时的提示'],
    ['src/features/journal/JournalView.vue', '书内空页与阅读提示'],
    ['src/features/collection/CollectionView.vue', '收藏物件的操作提示'],
  ]);
  for (const definition of content.minigames) {
    const file = components.get(definition.module);
    assert.ok(file, `Unknown minigame component: ${definition.module}`);
    files.set(`src/features/minigames/${file.replace(/^\.\//, '')}`, `${definition.title}中的补充文字`);
  }
  heading(2, '物件与小游戏界面的补充文字', 'supplemental');
  for (const [path, title] of files) {
    const descriptor = parseSfc(readFileSync(new URL('../' + path, import.meta.url), 'utf8')).descriptor;
    const values = new Set<string>();
    const add = (value: string) => { if (/[\u4e00-\u9fff]/u.test(value) && value.trim().length > 1) values.add(value.trim()); };
    function extract(sourceText: string) {
      const source = ts.createSourceFile(path + '.ts', sourceText, ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !(ts.isBinaryExpression(node.parent) && node.parent.operatorToken.kind === ts.SyntaxKind.PlusToken)) add(node.text);
        if (ts.isTemplateExpression(node) && node.templateSpans.length === 1 && node.templateSpans[0]!.expression.getText(source) === 'o.person') {
          // Render both real order names in Xu's spoken help message.
          for (const definition of content.minigames) for (const order of definition.packing?.orders ?? []) add(node.head.text + order.person + node.templateSpans[0]!.literal.text);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    if (descriptor.script) extract(descriptor.script.content);
    if (descriptor.scriptSetup) extract(descriptor.scriptSetup.content);
    if (descriptor.template) {
      const template = baseParse(descriptor.template.content);
      function visit(node: any, hasInlineVariables = false) {
        if (node.type === NodeTypes.TEXT && !hasInlineVariables) add(node.content);
        if (node.type === NodeTypes.INTERPOLATION) extract(`(${node.content.content})`);
        for (const prop of node.props ?? []) {
          if (prop.type === NodeTypes.ATTRIBUTE && prop.value) add(prop.value.content);
          if (prop.type === NodeTypes.DIRECTIVE && prop.exp) extract(`(${prop.exp.content})`);
        }
        const mixed = node.children?.some((child: any) => child.type === NodeTypes.INTERPOLATION) ?? false;
        for (const child of node.children ?? []) visit(child, mixed);
      }
      visit(template);
    }
    heading(3, title); meta('原文位置', `\`${path}\``);
    for (const value of values) text(value);
  }
}

heading(1, '百味录全站剧情文本');
line(`内容版本：v${content.version}。从当前正式内容自动提取，保留原文、说话顺序、节点 ID、选项、分支条件与阶段版本。`); line();
line('本文件收录五章的场景介绍、全部对白、物件观察、信纸／手机／书页文字、物件操作回应、小游戏文本，以及食谱、书内记录、收藏、道具、拾零和结尾。回访与互斥路线分别标注。'); line();
line('重新导出：\`npm run export:story\`。原文来源为 \`src/content/\` 当前装配的内容包。'); line();
line('## 目录'); line();
for (const chapter of content.chapters) line(`- [第${['一','二','三','四','五'][chapter.number - 1]}章：${chapter.title}](#chapter-${chapter.id})`);
for (const [label, id] of [['全部食谱','recipes'],['人生记录与线索摘记','entries'],['收藏物件的补充介绍','collection'],['随身物、属性与拾零','other'],['场景物件上的独立题字','inscriptions'],['物件与小游戏界面的补充文字','supplemental'],['全部结尾','endings']]) line(`- [${label}](#${id})`);
line();

for (const chapter of content.chapters) {
  heading(2, `第${['一','二','三','四','五'][chapter.number - 1]}章：${chapter.title}`, `chapter-${chapter.id}`);
  text(chapter.subtitle); namedText('时间', chapter.time); text(chapter.description);
  namedText('当前要做的事', chapter.objective);
  namedText('回访介绍', chapter.revisitDescription);
  namedText('离开时的行动', chapter.exitLabel); namedText('尚不能离开时的提示', chapter.exitHint);
  variants(chapter.variants, '本章场景版本');
  if (chapter.beats?.length) {
    line('**本章阶段目标**'); line();
    for (const beat of chapter.beats) { line(`- ${beat.label}（${condition(beat.condition)}）`); sourceTexts.add(beat.label); }
    line();
  }
  const dialogueLocations = new Map<string, string[]>();
  for (const scene of scenesOf(chapter)) {
    heading(3, `场景：${scene.title}（${scene.id}）`);
    if (scene.time) namedText('场景时间', scene.time);
    if (scene.description !== chapter.description) text(scene.description);
    if (scene.variants !== chapter.variants) variants(scene.variants, '场景阶段');
    for (const link of scene.links) {
      namedText(`通路（${link.sceneId}）`, link.label);
      if (link.condition) meta('开放条件', condition(link.condition));
      namedText('暂不可通行时的提示', link.unavailable);
    }
    for (const hotspot of scene.hotspots) {
      object(hotspot, chapter.id);
      if (hotspot.interaction.kind === 'dialogue') {
        const id = hotspot.interaction.dialogueId;
        dialogueLocations.set(id, [...(dialogueLocations.get(id) ?? []), hotspot.label]);
      }
    }
  }
  for (const [id, locations] of dialogueLocations) {
    if (exportedDialogues.has(id)) continue;
    const found = content.dialogues.find(dialogue => dialogue.id === id);
    assert.ok(found, `Missing dialogue: ${id}`); dialogue(found, locations);
  }
  const games = content.minigames.filter(game => game.chapterId === chapter.id);
  if (games.length) { heading(3, '本章物件玩法与完成回应'); games.forEach(game); }
  const guides = content.progression?.guides.filter(guide => guide.chapterId === chapter.id) ?? [];
  if (guides.length) {
    heading(3, '本章教学提示');
    for (const guide of guides) {
      heading(4, `${guide.title}（${guide.id}）`); text(guide.text);
      if (guide.condition) meta('出现条件', condition(guide.condition));
      meta('完成条件', condition(guide.complete));
    }
  }
}
assert.equal(exportedDialogues.size, content.dialogues.length, 'Some dialogue groups were not exported');
assert.equal(exportedNodes.size, content.dialogues.reduce((sum, d) => sum + d.nodes.length, 0), 'Some dialogue nodes were not exported');
assert.equal(exportedGames.size, content.minigames.length, 'Some minigames were not exported');

heading(2, '全部食谱', 'recipes');
for (const recipe of content.recipes ?? []) {
  heading(3, `${recipe.title}（${recipe.id}）`); text(recipe.subtitle);
  meta('出现条件', condition(recipe.condition));
  line('**备料**'); line();
  for (const ingredient of recipe.ingredients) { line(`- ${ingredient}`); sourceTexts.add(ingredient); } line();
  line('**做法**'); line();
  for (const step of recipe.steps) { line(`1. ${step}`); sourceTexts.add(step); } line();
  namedText('页边小字', recipe.note);
}
heading(2, '人生记录与线索摘记', 'entries');
for (const [label, entries] of [
  ['人间百味', content.clues.filter(entry => entry.category === 'life')],
  ['线索与细节', content.clues.filter(entry => entry.category !== 'life')],
] as const) {
  heading(3, label);
  for (const entry of entries) { heading(4, `${entry.title}（${entry.id}）`); text(entry.text);for(const[index,version]of (entry.versions??[]).entries()){line(`**阶段记录 ${index+1}**`);line();meta('出现条件',condition(version.condition));namedText('这一页的标题',version.title);text(version.text);} }
}
heading(2, '收藏物件的补充介绍', 'collection');
for (const entry of content.collection ?? []) {
  heading(3, `${entry.title}（${entry.id}）`); meta('出现条件', condition(entry.condition));
  text(entry.description); namedText('进一步细看', entry.detail);
  if (entry.study) action(entry.study, '细看动作');
}
heading(2, '随身物、属性与拾零', 'other');
for (const [label, entries] of [['随身物', content.items], ['属性说明', content.metrics], ['任务文字', content.quests], ['拾零', content.achievements]] as const) {
  heading(3, label);
  for (const entry of entries) {
    heading(4, `${entry.title}（${entry.id}）`); text(entry.text);
    if ('annotation' in entry) namedText('补记', entry.annotation);
    if ('condition' in entry) meta('出现条件', condition(entry.condition));
  }
}
heading(2, '场景物件上的独立题字', 'inscriptions');
for (const [id, asset] of Object.entries(content.assets)) if (asset.inscription) {
  heading(3, `${asset.label}（${id}）`);
  for (const inscription of asset.inscription.lines) text(inscription);
}
supplementalText();
heading(2, '全部结尾', 'endings');
for (const ending of content.endings) {
  heading(3, `${ending.title}（${ending.id}）`);
  meta('出现条件', condition(ending.condition)); text(ending.text);
}

const markdown = lines.join('\n').trimEnd() + '\n';
// Check verbatim text, including paragraph boundaries, before writing the artifact.
for (const value of sourceTexts) assert.ok(markdown.includes(value), `Missing source passage: ${value.slice(0, 60)}`);
// Independently walk all authored prose fields so an omitted type or variant
// cannot silently pass merely because the writer forgot to register it.
const proseFields = new Set(['title','subtitle','text','description','direction','objective','revisitDescription','label','exitLabel','exitHint','unavailable','feedback','kicker','caption','heading','footer','note','detail','time','person','hint','filling']);
const proseArrays = new Set(['lines','ingredients','steps','fillings']);
function verifyProse(value: unknown, path = 'content', parentKey = '') {
  if (Array.isArray(value)) { value.forEach((entry, index) => verifyProse(entry, `${path}[${index}]`, parentKey)); return; }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const [key, entry] of Object.entries(record)) {
      if (['assets','camera','character','sprite','decorations','drag'].includes(key)) continue;
      if (key === 'text' && Array.isArray(record.beats) && record.beats.length) continue;
      if (typeof entry === 'string' && proseFields.has(key)) assert.ok(markdown.includes(entry), `Omitted prose at ${path}.${key}: ${entry.slice(0,60)}`);
      verifyProse(entry, `${path}.${key}`, key);
    }
  } else if (typeof value === 'string' && proseArrays.has(parentKey)) assert.ok(markdown.includes(value), `Omitted prose at ${path}: ${value}`);
}
verifyProse(content);
for (const [, id] of markdown.matchAll(/\]\(#([^)]*)\)/g)) assert.ok(markdown.includes(`id="${id}"`), `Missing Markdown anchor: ${id}`);
const expectedObjects = content.chapters.flatMap(chapter => scenesOf(chapter).flatMap(scene => scene.hotspots.filter(hotspot => hotspot.interaction.kind === 'inspect'))).length;
assert.equal(exportedObjects.size, expectedObjects, 'Some inspection objects were not exported');
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(output, markdown, 'utf8');
assert.equal(readFileSync(output, 'utf8'), markdown);
// Focused reading copies come from the same export, so branch versions and
// source wording cannot drift away from the game when the full text is updated.
function section(start:string,end?:string){
  const from=markdown.indexOf(start),to=end?markdown.indexOf(end,from+start.length):markdown.length;
  assert.ok(from>=0&&to>from,`Missing reading section: ${start}`);
  return markdown.slice(from,to).trim();
}
const lifeOrder=['job-gap','grandma-first-page','my-first-pay','morning-record','morning-unfinished','noon-record','noon-unfinished','night-riceball','night-record-pickup','night-record-cancelled','night-record-missed'];
const lifeBlocks=section('### 人间百味\n','### 线索与细节\n').split(/(?=^#### )/m).filter(block=>block.startsWith('#### '));
assert.equal(lifeBlocks.length,lifeOrder.length);
lifeBlocks.sort((a,b)=>lifeOrder.findIndex(id=>a.startsWith('#### '+content.clues.find(c=>c.id===id)!.title+'（'+id+'）'))-lifeOrder.findIndex(id=>b.startsWith('#### '+content.clues.find(c=>c.id===id)!.title+'（'+id+'）')));
for(const[filename,title,body]of [
  ['百味录_第四章_夜里有饭_精修阅读稿.md','第四章 · 夜里有饭',section('<a id="chapter-night"></a>','<a id="chapter-epilogue"></a>')],
  ['百味录_第五章_灯下_精修阅读稿.md','第五章 · 灯下',section('<a id="chapter-epilogue"></a>','<a id="recipes"></a>')+'\n\n'+section('<a id="endings"></a>')],
  ['百味录_人间百味_片段精修阅读稿.md','人间百味 · 片段',lifeBlocks.join('\n').trim()],
]){
  const copy=`# 百味录 · ${title}\n\n2026-11-10 精修。从当前内容自动提取；原有用户母稿保留。互斥分支和阶段版本分别列出，实际游玩只显示符合经历的一版。阅读稿随 \`npm run export:story\` 更新。\n\n${body}\n`;
  const target=new URL('../docs/'+filename,import.meta.url);writeFileSync(target,copy,'utf8');assert.equal(readFileSync(target,'utf8'),copy);
}
console.log(`已导出：${fileURLToPath(output)}`);
console.log(`5 章，${exportedDialogues.size} 组对白，${exportedNodes.size} 个节点，${exportedObjects.size} 处物件观察，${versionCount} 个阶段版本，${Array.from(markdown).length.toLocaleString()} 字符。`);
