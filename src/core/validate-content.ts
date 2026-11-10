import type { Action, Condition, ContentPack } from './contracts.ts';
import { firstSceneOf, hotspotsOf, scenesOf } from './scenes.ts';

export function validateContent(pack: ContentPack): string[] {
  const errors: string[] = [];
  const unique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) { if (!id || seen.has(id)) errors.push(`${label}: 重复或空 ID ${id}`); seen.add(id); }
    return seen;
  };
  const chapters = unique('章节', pack.chapters.map(x => x.id));
  const quests = unique('任务', pack.quests.map(x => x.id));
  const dialogues = unique('对话', pack.dialogues.map(x => x.id));
  const games = unique('小游戏', pack.minigames.map(x => x.id));
  unique('场景全局',pack.chapters.flatMap(c=>scenesOf(c).map(s=>s.id)));
  const clues = unique('线索', pack.clues.map(x => x.id));
  const items = unique('道具', pack.items.map(x => x.id));
  const metrics = unique('属性', pack.metrics.map(x => x.id));
  const allActions=[...pack.dialogues.flatMap(d=>d.nodes.flatMap(n=>n.choices)),...pack.minigames.map(g=>g.reward),...(pack.collection??[]).flatMap(e=>e.study?[e.study]:[]),...pack.chapters.flatMap(c=>hotspotsOf(c).flatMap(h=>h.interaction.kind==='inspect'?[h.interaction.action,...(h.interaction.options??[])].filter(a=>a!==undefined):[]))];
  const flagIds=new Set(allActions.flatMap(a=>a.effects.filter(e=>e.kind==='flag').map(e=>e.id)));
  const rewardIds=new Set(allActions.map(a=>a.onceKey??a.id));
  unique('成就', pack.achievements.map(x => x.id)); unique('结局', pack.endings.map(x => x.id));
  const ref = (set: Set<string>, id: string, location: string) => { if (!set.has(id)) errors.push(`${location}: 未定义 ${id}`); };
  const condition = (value: Condition | undefined, location: string) => {
    if (!value) return;
    switch (value.kind) {
      case 'flag': ref(flagIds,value.id,location);break;
      case 'clue': ref(clues, value.id, location); break;
      case 'reward': ref(rewardIds, value.id, location); break;
      case 'item': ref(items, value.id, location); break;
      case 'metric': ref(metrics, value.id, location); break;
      case 'quest': ref(quests, value.id, location); break;
      case 'all': case 'any': value.conditions.forEach(c => condition(c, location)); break;
      case 'not': condition(value.condition, location); break;
    }
  };
  const actionIds: string[] = [];
  const action = (value: Action) => {
    actionIds.push(value.id); condition(value.condition, value.id);
    for (const effect of value.effects) {
      if (effect.kind === 'clue') ref(clues, effect.id, value.id);
      if (effect.kind === 'item') ref(items, effect.id, value.id);
      if (effect.kind === 'metric') ref(metrics, effect.id, value.id);
      if (effect.kind === 'quest') ref(quests, effect.id, value.id);
    }
  };
  ref(chapters, pack.firstChapter, '起始章节');
  for (const quest of pack.quests) ref(chapters, quest.chapterId, quest.id);
  for (const chapter of pack.chapters) {
    ref(quests, chapter.questId, chapter.id);
    if (pack.quests.find(q => q.id === chapter.questId)?.chapterId !== chapter.id) errors.push(`${chapter.id}: 主任务章节不匹配`);
    if (!pack.assets[chapter.asset]) errors.push(`${chapter.id}: 缺少场景资产 ${chapter.asset}`);
    if (chapter.character && !pack.assets[chapter.character.asset]) errors.push(`${chapter.id}: 缺少人物资产`);
    chapter.beats?.forEach(b => condition(b.condition, chapter.id));
    if (chapter.next) ref(chapters, chapter.next, chapter.id);
    chapter.metricIds.forEach(id => ref(metrics, id, chapter.id)); condition(chapter.exit, chapter.id);
    const scenes = scenesOf(chapter); const sceneIds = unique(`${chapter.id} 场景`, scenes.map(s => s.id));
    ref(sceneIds, firstSceneOf(chapter), chapter.id);
    for (const scene of scenes) {
      if (!pack.assets[scene.asset]) errors.push(`${scene.id}: 场景资产不存在`);
      const views = unique(`${scene.id} 镜头视角`, (scene.camera?.views ?? []).map(v => v.id));
      for (const view of scene.camera?.views ?? []) {
        if (![view.x, view.y, view.zoom].every(Number.isFinite) || view.x < 0 || view.x > 100 || view.y < 0 || view.y > 100 || view.zoom < 1 || view.zoom > 2) errors.push(`${scene.id}/${view.id}: 镜头参数超出范围`);
      }
      for (const h of scene.hotspots) {
        if (h.cameraView) ref(views, h.cameraView, h.id);
        for (const variant of h.variants ?? []) {
          if (variant.cameraView) ref(views, variant.cameraView, h.id);
          if (variant.width !== undefined && (!Number.isFinite(variant.width) || variant.width <= 0 || variant.width > 100) || variant.height !== undefined && (!Number.isFinite(variant.height) || variant.height <= 0 || variant.height > 100)) errors.push(`${h.id}: 变化尺寸超出范围`);
        }
      }
      unique(`${scene.id} 陈设`, (scene.decorations ?? []).map(d => d.id));
      for (const decoration of scene.decorations ?? []) {
        if (!pack.assets[decoration.asset]) errors.push(`${decoration.id}: 陈设资产不存在`);
        condition(decoration.condition, decoration.id);
        if (![decoration.x, decoration.y, decoration.width, decoration.height].every(Number.isFinite) || decoration.x < 0 || decoration.x > 100 || decoration.y < 0 || decoration.y > 100 || decoration.width <= 0 || decoration.height <= 0) errors.push(`${decoration.id}: 陈设位置或尺寸无效`);
      }
      for (const variant of scene.variants ?? []) { condition(variant.condition, scene.id); if (variant.asset && !pack.assets[variant.asset]) errors.push(`${scene.id}: 变化场景资产不存在`); }
      for (const link of scene.links) { ref(sceneIds, link.sceneId, scene.id); condition(link.condition, scene.id); }
    }
    const reached=new Set<string>();const pending=[firstSceneOf(chapter)];
    while(pending.length){const id=pending.pop()!;if(reached.has(id))continue;reached.add(id);scenes.find(s=>s.id===id)?.links.forEach(l=>pending.push(l.sceneId));}
    for(const scene of scenes)if(!reached.has(scene.id))errors.push(`${chapter.id}: 场景无法到达 ${scene.id}`);
    unique(`${chapter.id} 热点`, hotspotsOf(chapter).map(h => h.id));
    for (const h of hotspotsOf(chapter)) {
      if (h.sprite && !pack.assets[h.sprite.asset]) errors.push(`${h.id}: 独立资产不存在`);
      for (const variant of h.variants ?? []) { condition(variant.condition, h.id); if (variant.asset && !pack.assets[variant.asset]) errors.push(`${h.id}: 变化资产不存在`); }
      if (h.x < 0 || h.x > 100 || h.y < 0 || h.y > 100) errors.push(`${h.id}: 热点超出画面`);
      condition(h.condition, h.id); condition(h.completed, h.id);
      if (h.interaction.kind === 'dialogue') {
        const interaction=h.interaction;
        ref(dialogues, interaction.dialogueId, h.id);
        if (interaction.entry && !pack.dialogues.find(d=>d.id===interaction.dialogueId)?.nodes.some(n=>n.id===interaction.entry)) errors.push(`${h.id}: 物件指定的对白入口不存在`);
      }
      if (h.interaction.kind === 'minigame') {
        const gameId = h.interaction.gameId;
        ref(games, gameId, h.id);
        if (pack.minigames.find(g => g.id === gameId)?.chapterId !== chapter.id) errors.push(`${h.id}: 小游戏章节不匹配`);
      }
      if (h.interaction.kind === 'inspect') {
        if (h.drag && !h.interaction.options?.some(a => a.id === h.drag!.actionId)) errors.push(`${h.id}: 拖动物件动作不存在`);
        h.interaction.versions?.forEach(v=>condition(v.condition,h.id));
        if (h.interaction.activityId) {
          const gameId = h.interaction.activityId;
          ref(games, gameId, h.id);
          if (pack.minigames.find(g => g.id === gameId)?.chapterId !== chapter.id) errors.push(`${h.id}: 物件活动归属错误`);
        }
        if (h.interaction.action) action(h.interaction.action);
        h.interaction.options?.forEach(action);
      }
    }
  }
  for (const dialogue of pack.dialogues) {
    const nodes = unique(`${dialogue.id} 节点`, dialogue.nodes.map(n => n.id)); ref(nodes, dialogue.entry, dialogue.id);
    for (const entry of dialogue.entries ?? []) { condition(entry.condition, dialogue.id); ref(nodes, entry.nodeId, dialogue.id); }
    for (const node of dialogue.nodes) {
      if (node.portrait && !pack.assets[node.portrait]) errors.push(`${node.id}: 人物立绘不存在`);
      if (typeof node.text !== 'string' || !node.text.trim()) errors.push(`${dialogue.id}/${node.id}: 对白正文为空`);
      if (node.beats) {
        if (!Array.isArray(node.beats) || !node.beats.length) errors.push(`${dialogue.id}/${node.id}: 对话回合为空`);
        else for (const beat of node.beats) {
          if (!['speech','narration'].includes(beat.kind) || typeof beat.text!=='string' || !beat.text.trim() || beat.kind==='speech' && !beat.speaker?.trim()) errors.push(`${dialogue.id}/${node.id}: 对话回合缺少正文或说话人`);
          if (beat.portrait && !pack.assets[beat.portrait]) errors.push(`${dialogue.id}/${node.id}: 回合立绘不存在 ${beat.portrait}`);
        }
      }
      for (const version of node.versions ?? []) {
        condition(version.condition, `${dialogue.id}/${node.id}`);
        if (!version.beats.length) errors.push(`${dialogue.id}/${node.id}: 阶段对白为空`);
        for (const beat of version.beats) {
          if (!['speech','narration'].includes(beat.kind) || !beat.text?.trim() || beat.kind==='speech' && !beat.speaker?.trim()) errors.push(`${dialogue.id}/${node.id}: 阶段对白缺少正文或说话人`);
          if (beat.portrait && !pack.assets[beat.portrait]) errors.push(`${dialogue.id}/${node.id}: 阶段对白立绘不存在 ${beat.portrait}`);
        }
      }
    }
    for (const node of dialogue.nodes) for (const choice of node.choices) {
      action(choice); if (choice.next) ref(nodes, choice.next, choice.id);
      if (choice.activityId) {
        ref(games, choice.activityId, choice.id);
        if (choice.next) errors.push(`${choice.id}: 不能同时接续对白与物件玩法`);
        const owner=pack.minigames.find(g=>g.id===choice.activityId)?.chapterId;
        if (!pack.chapters.some(c=>c.id===owner && hotspotsOf(c).some(h=>h.interaction.kind==='dialogue' && h.interaction.dialogueId===dialogue.id))) errors.push(`${choice.id}: 白话接续玩法的章节不匹配`);
      }
    }
    const complete = new Set<string>(), active = new Set<string>();
    function once(condition: Condition | undefined, key: string): boolean {
      return !!condition && (condition.kind === 'all' ? condition.conditions.some(c => once(c,key))
        : condition.kind === 'not' && condition.condition.kind === 'reward' && condition.condition.id === key);
    }
    function visit(id: string) {
      if (complete.has(id)) return;
      if (active.has(id)) { errors.push(`${dialogue.id}/${id}: 对话接续出现循环`); return; }
      active.add(id);
      for (const choice of dialogue.nodes.find(n => n.id === id)?.choices ?? []) if (choice.next) {
        // A topic can return to a menu only when selecting it consumes its own
        // prerequisite. It can never traverse that edge again in ordinary play.
        if (choice.next === id) errors.push(`${dialogue.id}/${id}: 对话接续出现循环`);
        else if (!once(choice.condition,choice.onceKey??choice.id)) visit(choice.next);
      }
      active.delete(id); complete.add(id);
    }
    for (const node of dialogue.nodes) visit(node.id);
  }
  for (const game of pack.minigames) {
    condition(game.condition, game.id);
    if (game.packing) {
      unique(`${game.id} 分装单`, game.packing.orders.map(o => o.id));
      if (game.packing.orders.length < 2) errors.push(`${game.id}: 至少需要两张分装单`);
      for (const o of game.packing.orders) if (!['bowl', 'box'].includes(o.vessel) || !['rim', 'cup'].includes(o.sauce) || !['beside', 'outside'].includes(o.utensils)) errors.push(`${game.id}: 分装要求无效`);
    }
    if (game.itinerary) {
      const slotIds = unique(`${game.id} 时段`, game.itinerary.slots.map(s => s.id));
      unique(`${game.id} 书签`, game.itinerary.slips.map(s => s.id));
      unique(`${game.id} 目标`, game.itinerary.slips.map(s => s.slot));
      if (game.itinerary.slips.length !== game.itinerary.slots.length) errors.push(`${game.id}: 书签与时段数量不一致`);
      game.itinerary.slips.forEach(s => ref(slotIds, s.slot, game.id));
    }
    if (game.breakfast) {
      const orderIds=unique(`${game.id} 订单`, game.breakfast.orders.map(o => o.id));
      game.breakfast.orders.forEach(o => { if (!game.breakfast!.fillings.includes(o.filling) || o.count < 1) errors.push(`${game.id}: 配餐内容无效`); });
      for (const task of game.breakfast.packaging ?? []) {
        ref(orderIds, task.orderId, game.id);
        const choices=unique(`${game.id}/${task.orderId} 分装选项`,task.choices.map(choice=>choice.id));
        ref(choices,task.expected,game.id);
      }
      for (const filling of Object.keys(game.breakfast.copy?.fillings ?? {})) if (!game.breakfast.fillings.includes(filling)) errors.push(`${game.id}: 馅料说明没有对应馅料 ${filling}`);
      for (const order of Object.keys(game.breakfast.copy?.wrongFillings ?? {})) ref(orderIds,order,game.id);
    }
    if (game.service) {
      const ticketIds=unique(`${game.id} 小票`, game.service.tickets.map(t=>t.id));
      for (const ticket of Object.keys(game.service.copy?.tickets ?? {})) ref(ticketIds,ticket,game.id);
      if(!Number.isSafeInteger(game.service.pots)||game.service.pots<1)errors.push(`${game.id}: 锅数无效`);
      game.service.tickets.forEach(t=>{if(t.cook<1||t.deadline<t.cook)errors.push(`${game.id}: 小票时间不可达`);});
    }
    ref(chapters, game.chapterId, game.id); if (game.assistedItem) ref(items, game.assistedItem, game.id); action(game.reward);
  }
  for (const entry of [...pack.clues,...pack.items,...pack.metrics,...pack.quests,...pack.achievements,...pack.endings]) for (const version of entry.versions ?? []) {
    condition(version.condition,entry.id);
    if (!version.text.trim()) errors.push(`${entry.id}: 阶段记录为空`);
    if(version.title!==undefined&&!version.title.trim())errors.push(`${entry.id}: 阶段标题为空`);
    if(version.asset&&!pack.assets[version.asset])errors.push(`${entry.id}: 阶段插图不存在 ${version.asset}`);
  }
  unique('食谱', (pack.recipes ?? []).map(r => r.id));
  for (const [id, asset] of Object.entries(pack.assets)) {
    if (asset.inscription && (!asset.region || !Array.isArray(asset.inscription.lines) || asset.inscription.lines.length < 1 || asset.inscription.lines.length > 3 || asset.inscription.lines.some(line => typeof line !== 'string' || !line.trim()))) errors.push(`${id}: 图像上的文字需要独立区域和一至三行内容`);
  }
  for (const recipe of pack.recipes ?? []) { condition(recipe.condition, recipe.id); if (!pack.assets[recipe.asset]) errors.push(`${recipe.id}: 食谱插图不存在`); }
  unique('收集物件', (pack.collection ?? []).map(e => e.id));
  for (const entry of pack.collection ?? []) { condition(entry.condition, entry.id); if (!pack.assets[entry.asset]) errors.push(`${entry.id}: 收藏插图不存在`); if (entry.study) action(entry.study); }
  unique('动作', actionIds);
  for (const [feature, unlock] of Object.entries(pack.progression?.unlocks ?? {})) condition(unlock, `功能 ${feature}`);
  unique('引导', (pack.progression?.guides ?? []).map(g => g.id));
  for (const guide of pack.progression?.guides ?? []) {
    ref(chapters, guide.chapterId, guide.id); condition(guide.condition, guide.id); condition(guide.complete, guide.id);
    const owner = pack.chapters.find(c => c.id === guide.chapterId);
    if (guide.target && (!owner || !hotspotsOf(owner).some(h => h.id === guide.target))) errors.push(`${guide.id}: 引导物件不存在`);
    if (guide.control && (!['journal', 'menu', 'departure', 'home'].includes(guide.control) || guide.target)) errors.push(`${guide.id}: 教学指向无效`);
    if (guide.focus && !guide.target) errors.push(`${guide.id}: 聚焦教学需要场景物件`);
    if (guide.chrome && !['minimal', 'book'].includes(guide.chrome)) errors.push(`${guide.id}: 教学界面阶段无效`);
  }
  pack.achievements.forEach(a => condition(a.condition, a.id)); pack.endings.forEach(e => condition(e.condition, e.id));
  if (!pack.endings.length || pack.endings.at(-1)?.condition) errors.push('最后需要一个无条件兜底结局');
  const visited = new Set<string>(); let id: string | undefined = pack.firstChapter;
  while (id && chapters.has(id) && !visited.has(id)) { visited.add(id); id = pack.chapters.find(c => c.id === id)?.next; }
  if (id && visited.has(id)) errors.push('主流程出现循环');
  for (const c of pack.chapters) if (!visited.has(c.id)) errors.push(`主流程无法到达 ${c.id}`);
  return errors;
}
