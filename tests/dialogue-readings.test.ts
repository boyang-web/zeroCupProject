import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { DialogueBeat, DialogueNode } from '../src/core/contracts.ts';
import { content } from '../src/content/index.ts';
import { narrate, say, scriptNode } from '../src/content/narrative.ts';
import { dialogueReadings } from '../src/presentation/dialogue-readings.ts';
import { validateContent } from '../src/core/validate-content.ts';

test('a scene keeps speech, narration and changed speakers in authored order', () => {
  const node = scriptNode({ id:'scene', speaker:'陈伯', choices:[] }, [
    say('陈伯','先吃。'), narrate('她把碗端近。'), say('阿宁','你也吃。'), say('小满','我坐哪里？'),
  ]);
  const readings = dialogueReadings(node);
  assert.deepEqual(readings.map(b => [b.kind,b.speaker,b.portrait]), [
    ['speech','陈伯','chen'], ['narration',undefined,undefined], ['speech','阿宁','ning'], ['speech','小满',undefined],
  ]);
  assert.equal(node.text,'陈伯：先吃。\n\n她把碗端近。\n\n阿宁：你也吃。\n\n小满：我坐哪里？');
});

test('a long turn paginates without borrowing the next speaker or repeating the direction', () => {
  const text = '她把改过的站名又念了一遍。'.repeat(28);
  const node=scriptNode({ id:'long', speaker:'阿宁', choices:[] }, [say('阿宁',text,'她翻开账本。'),say('陈伯','我问过了。')]);
  const readings=dialogueReadings(node), ning=readings.slice(0,-1);
  assert.ok(ning.length>1);
  assert.equal(ning.map(b=>b.text).join(''),text);
  assert.ok(ning.every(b=>b.speaker==='阿宁' && b.portrait==='ning'));
  assert.equal(ning[0]!.direction,'她翻开账本。');
  assert.ok(ning.slice(1).every(b=>b.direction===undefined));
  assert.equal(readings.at(-1)!.speaker,'陈伯');
});

test('legacy dialogue still displays its speaker, portrait and opening direction', () => {
  const legacy: DialogueNode={ id:'old',speaker:'奶奶',portrait:'grandmother',direction:'窗下。',text:'回来了。',choices:[] };
  assert.deepEqual(dialogueReadings(legacy),[{ kind:'speech',speaker:'奶奶',portrait:'grandmother',direction:'窗下。',text:'回来了。' }]);
});

test('all shipped scene scripts supply a reading for every existing dialogue node', () => {
  for(const dialogue of content.dialogues) for(const node of dialogue.nodes) {
    assert.ok(node.beats?.length,`${dialogue.id}/${node.id}`);
    assert.equal(node.text,node.beats.map(b=>b.kind==='speech'?`${b.speaker}：${b.text}`:b.text).join('\n\n'));
    assert.ok(dialogueReadings(node).every(b=>b.text.trim()));
  }
});

test('validation rejects a missing script, an unidentified speaker and a missing turn portrait', () => {
  const pack=structuredClone(content), node=pack.dialogues[0]!.nodes[0]!;
  Object.assign(node,scriptNode({ id:node.id,speaker:node.speaker,choices:node.choices },undefined));
  assert.ok(validateContent(pack).some(e=>e.includes('对话回合为空')));
  assert.ok(validateContent(pack).some(e=>e.includes('对白正文为空')));
  node.text='有效正文';node.beats=[{ kind:'speech',text:'没有署名。' }];
  assert.ok(validateContent(pack).some(e=>e.includes('缺少正文或说话人')));
  node.beats=[{ kind:'speech',speaker:'奶奶',text:'回来了。',portrait:'missing-portrait' }];
  assert.ok(validateContent(pack).some(e=>e.includes('回合立绘不存在')));
  node.beats=[{ kind:'unknown',text:'无效类型。' } as unknown as DialogueBeat];
  assert.ok(validateContent(pack).some(e=>e.includes('缺少正文或说话人')));
});
