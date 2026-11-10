import type { Chapter, Condition, Dialogue, Hotspot, MinigameDefinition, Ending } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { epilogueScripts, epilogueStoryVersions } from '../scripts/epilogue.ts';
import { shopRecords } from '../epilogue-records.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const chosen: Condition = { kind: 'any', conditions: ['breakfast', 'call', 'book'].map(id => flag(`epilogue-${id}`)) };
const beforeMorning: Condition = { kind: 'not', condition: flag('epilogue-night-finished') };
const pages = all(...shopRecords.map(r => flag(`epilogue-read-${r.id}`)));
const ready = all(pages, flag('epilogue-filed'), flag('epilogue-ticket-read'), flag('epilogue-reviewed'));
const person = (id: string, dialogueId: string): Hotspot => ({ id, label: '奶奶', x: 65, y: 96, icon: 'talk', sprite: { asset: 'epilogue-grandma', width: 25, height: 71, z: 5 }, interaction: { kind: 'dialogue', dialogueId } });
const pageIntros:Record<string,string>={
  "morning": "你把陈家这页转正，奶奶先找开门的时间，又听你念后头怎么约样面。你见她真要照着这几行安排明早，才将每个还没定的地方放慢一点，不把刚答应看看的，也念成已经改好了。",
  "noon": "奶奶指到半份那一行，先问自己下回去是不是也能这样点。你答过，又把琴姐和阿川最后说定的几句念给她听。她没有催你只讲个结果，遇见还没定的地方，也跟着等，没有替你把那句先试一试抹掉。",
  "night": "你翻到夜饭这页，先念关门时间，奶奶听见十一点，点头说自己还记着他从前开得晚。你把接下来的几句按今晚见到的讲，没有将折在别处的那张也展开。"
};
function pageNarration(id:string,text:string,result?:string){
  const intro=!result
    ?'你翻到这页，后面仍有没接上的地方。奶奶拿近看过，没有催你补字，只叫先夹好，下回有机会，再从这里问。'
    :result==='night-legacy'
      ?'你将原来留下的纸转给奶奶看，她等你慢慢认。讲到没记下的地方，你停住，没有把今晚别的事接过去；她点头，让旧纸仍照原样收好。'
      :pageIntros[id];
  return intro+'\n\n'+text;
}
const storePages: Hotspot[] = shopRecords.map((r, i) => ({
  id: `epilogue-page-${r.id}`, label: `${r.title} · 店签`, x: 18 + i * 4, y: 64.5, icon: 'book', condition: flag('epilogue-greeted'),
  cameraView: 'pages', sprite: { asset: `epilogue-tab-${r.id}`, width: 2.8, height: 5.5, z: 7 + i }, completed: flag(`epilogue-read-${r.id}`),
  interaction: { kind: 'inspect', manipulation: 'book', text: pageNarration(r.id,r.fallback),
    exhibit: { kind: 'book', kicker: '今天的店签', title: r.title, lines: [r.fallback] },
    versions: r.rows.map(([id, text]) => ({ condition: flag(id!), text: pageNarration(r.id,text!,id!), exhibit: { kind: 'book' as const, kicker: '奶奶用尺子压着书页', title: r.title, lines: [text!] } })),
    action: { id: `epilogue-read-${r.id}`, label: '读这一页给奶奶听', effects: [{ kind: 'flag', id: `epilogue-read-${r.id}` }] },
  },
}));
export const epilogue: Chapter = {
  id: 'epilogue', number: 5, title: '灯下', subtitle: "奶奶还在灯下。", time: '夜深',
  description: "院门一响，奶奶就将针别稳，先问你抱一天书，胳膊酸不酸。桌上的水换过了，她自己那杯早没什么茶色，见你进来，又往身旁让出一点地方，等你坐下慢慢说。",
  asset: 'epilogue-night', position: 'center', tint: 'night', objective: '读清三家店的近况，理好短札，再和奶奶商量明早。',
  questId: 'epilogue', metricIds: [], hotspots: [],
  firstScene: 'epilogue-yard', exit: all(chosen, flag('epilogue-morning-seen')), exitLabel: '收好今天这一页', exitHint: '读齐店签、整理短札，和奶奶说清车次，再去次晨院门。',
  beats: [{ label: '回院打照面', condition: flag('epilogue-greeted') }, { label: '翻齐三张店签', condition: pages }, { label: '把三张札放对地方', condition: flag('epilogue-filed') }, { label: '约好下一步', condition: chosen }],
  scenes: [
    { id: 'epilogue-yard', title: '桂花小院', asset: 'epilogue-night', description: "檐下那盏灯照着小几，杯子靠在壶边，里屋的门还开着。你从门槛进来，将包放稳，奶奶给你指自己身旁的位置，针线篮也先收到了脚边。", links: [{ sceneId: 'epilogue-table', label: '到檐下长桌', condition: all(flag('epilogue-greeted'), beforeMorning), unavailable: '先和奶奶打招呼；天亮后不再回到昨夜。' }, { sceneId: 'epilogue-gate', label: '收好纸笔，歇到天亮', condition: all(chosen, flag('epilogue-night-finished')), unavailable: '把今晚的事说定，再歇下。' }], hotspots: [
      person('epilogue-grandmother', 'epilogue-home'),
      {
  "id": "epilogue-tea",
  "label": "热茶",
  "x": 44,
  "y": 58,
  "icon": "tea",
  "sprite": {
    "asset": "epilogue-tea",
    "width": 10,
    "height": 10,
    "z": 7
  },
  "interaction": {
    "kind": "inspect",
    "text": "奶奶翻开的两只杯子挨得近，热的这只刚添过水，你看她杯里已经没什么茶色，手便先扶到碟边，想给她让过去。她正低头收针，针尖摸了两遍才肯放稳，你等了一下，没有从她胳膊底下伸手。\n\n白天在店里，总想着赶紧问完、赶紧帮上一点，回到这张小几旁，你也还没一下改过来。杯沿冒着热气，奶奶抬头见你等着，先笑，说不是叫你回来还站旁边伺候，坐下她就好跟你说话了。",
    "options": [
      {
        "id": "epilogue-offer-tea",
        "label": "先把茶推给奶奶",
        "effects": [
          {
            "kind": "flag",
            "id": "epilogue-tea-offered"
          }
        ],
        "feedback": "你将热茶往奶奶那边让，她扶住碟沿，又慢慢推回来：“给你的呀，我那杯刚喝过，还温着。你坐下来，陪我喝两口。”她将壶留在两人中间，自己也捧起杯子，等你先尝一口热的。"
      }
    ],
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "epilogue-tea-offered"
        },
        "text": "奶奶捧着自己那杯，见你坐近，便把小几中间再让出一点。你小时候喝热的总等不住，她另拿一只碗替你晾；这回你先试过温度，等她也喝了一口，才问她今天除了等你，还忙了些什么。她听见便笑，说哪有一直等，针线都收了好几样，等会儿慢慢拿给你看。"
      }
    ]
  }
},
      {
  "id": "epilogue-calendar",
  "label": "日历",
  "x": 21,
  "y": 43,
  "icon": "look",
  "sprite": {
    "asset": "epilogue-calendar",
    "width": 6,
    "height": 15,
    "z": 4
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你看见日历上自己的名字又添了一个勾，旁边原来改过的日期还认得出。早上她说昨晚一听敲门就去看汤，后来忘了打，你那时只跟着笑，今天跑完一圈回来，又想起这小小一格。\n\n周日那处还没有写一点，带问号的短札也仍夹着。你手伸到页角，没有先替奶奶添上，想等两个人都说定，再一起拿笔。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "epilogue-call"
        },
        "text": "周日那格添了“一点”，墨比旁边旧字深一些。你在自己的车次单背面也抄了，奶奶看过才把笔放下。两个人都留着一份，她要临时出去会先说，你有事也得告诉她，日历上这一小格就不必只靠一个人记着。"
      }
    ]
  }
},
      {
  "id": "epilogue-bag",
  "label": "陈伯的保温袋",
  "x": 90,
  "y": 86,
  "icon": "look",
  "condition": {
    "kind": "item",
    "id": "insulated-bag"
  },
  "sprite": {
    "asset": "prop-bag",
    "width": 8,
    "height": 19,
    "z": 4
  },
  "interaction": {
    "kind": "inspect",
    "text": "你把借来的保温袋放到门边，提手绕着旧印折在一起。奶奶替你拉开，指了指木钩，让挂在这里，明早她路过巷口，顺路拿去还陈伯。\n\n你本来想收进包里，怕临走落东西。听她这么说，才把手松开。今天出门时是她替你想好怎么带，回来又有人接着问哪些该留、哪些该送回，你站了一会儿，才肯将一直绷着的那点心放下来。",
    "action": {
      "id": "epilogue-hang-bag",
      "label": "把袋子挂好",
      "effects": [
        {
          "kind": "flag",
          "id": "epilogue-bag-hung"
        }
      ]
    }
  }
},
    ] },
    { id: 'epilogue-table', camera: { views: [{ id: 'pages', label: '灯下的书页', x: 43, y: 62, zoom: 1.04 }, { id: 'grandma', label: '桌边的奶奶', x: 72.5, y: 60, zoom: 1.04 }] }, decorations: [{ id: 'epilogue-table-lamp', asset: 'night-lamp-on', x: 19, y: 60, width: 6, height: 17, z: 4 }, { id: 'epilogue-table-tea', asset: 'epilogue-tea', x: 52, y: 59, width: 10, height: 10, z: 4 }], title: '檐下长桌', time: '当晚 · 灯下整理', asset: 'epilogue-table-night', description: "书摊在灯照得清的地方，尺子压住卷起的页角。奶奶坐在桌边，手里拿着眼镜，等你将夹着的纸一张张松开，不急着伸手替你合上。", links: [{ sceneId: 'epilogue-yard', label: '起身回院里', condition: beforeMorning, unavailable: '已经收好纸笔，接下来是次晨。' }, { sceneId: 'epilogue-gate', label: '收好纸笔，歇到天亮', condition: all(chosen, flag('epilogue-night-finished')), unavailable: '先把下一步说定，听完当晚的话。' }], hotspots: [
      { ...person('epilogue-table-grandma', 'epilogue-table-talk'), x: 72.5, y: 85, cameraView: 'grandma', sprite: { asset: 'epilogue-grandma-table', width: 21, height: 58, z: 5 } },
      { id: 'epilogue-open-book', label: '百味录 · 三张店签', x: 38, y: 70, cameraView: 'pages', icon: 'book', condition: flag('epilogue-greeted'), sprite: { asset: 'epilogue-book', width: 26, height: 17, z: 3 }, interaction: { kind: 'inspect', contents: storePages.map(p => p.id), manipulation: 'book', text: '你把书摊在灯下，三张店签从纸边露出来。沿着夹签翻开，今天新添的几页都在这里。', exhibit: { kind: 'book', kicker: '夹在书里的店签', title: '百味录', lines: ['陈家的一笼早饭', '琴记的半份面', '夜饭小馆的两份饭'] } } }, ...storePages,
      {
  "id": "epilogue-phone",
  "label": "尚未发出的简历",
  "x": 49,
  "y": 65.5,
  "icon": "look",
  "condition": {
    "kind": "clue",
    "id": "job-gap"
  },
  "sprite": {
    "asset": "arrival-phone",
    "width": 3.8,
    "height": 5.4,
    "z": 9
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "phone",
    "text": "你习惯性地摸到手机，本来只想看看几点，手指却又停在那份个人简介上。能够适应还只写了半句，下面结束日期那一格仍留着至今，你知道得改，却总先绕去改两个看起来没那么难的词。\n\n奶奶隔着桌子问是不是有人找，你说没有，在看自己的东西。她便将要收的纸往旁边让一点，说那你慢慢弄，水还热着，别只顾屏幕，手里的杯子都忘了。\n\n你看着那两个字，想起刚回家时自己怕一删掉，就再没有一行能接上。今天别的地方记了那么多，回到自己这处，还是要停一会儿。奶奶没有追着问写好了没，你也不用先替这一格编好下一份工作，才肯碰它。",
    "exhibit": {
      "kind": "note",
      "title": "尚未发出的简历",
      "kicker": "手机里的草稿",
      "phone": {
        "time": "23:18",
        "heading": "简历草稿",
        "view": "draft",
        "footer": "未发送"
      },
      "lines": [
        "个人简介\n能够适应……",
        "上一份工作\n结束日期：至今"
      ]
    },
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "epilogue-updated-date"
        },
        "text": "你重新看那一格，结束日期已经留在该留的位置。个人简介还是半句，下面也没有新的发送记录。这一回你没有为了接着往下填，又把刚改好的字删回去。\n\n奶奶问这会儿能不能先喝两口水，你应了一声，将手机往书边放好。后面怎么写还没想顺，杯子倒已经捧到手里了，你想先把刚才答应讲给她的那件小事说完。",
        "exhibit": {
          "kind": "note",
          "title": "已经保存的草稿",
          "kicker": "手机里的草稿",
          "phone": {
            "time": "23:18",
            "heading": "简历草稿",
            "view": "draft",
            "footer": "已保存 · 未发送"
          },
          "lines": [
            "个人简介\n能够适应……",
            "上一份工作\n结束日期：实际离职日期"
          ]
        }
      }
    ],
    "options": [
      {
        "id": "epilogue-update-date",
        "label": "改回实际离职日期，保存草稿。",
        "condition": {
          "kind": "not",
          "condition": {
            "kind": "flag",
            "id": "epilogue-updated-date"
          }
        },
        "effects": [
          {
            "kind": "flag",
            "id": "epilogue-updated-date"
          }
        ],
        "feedback": "你删掉至今，填回真正离职的日期，确认一遍才保存。个人简介还留着半句，没有发出去。奶奶见你暂时放下手机，将杯子往你这边让，问水是不是凉了，你伸手接住，没有再立刻翻回屏幕。"
      }
    ]
  }
},
      { id: 'epilogue-slips', label: '三张短札', x: 56, y: 67, icon: 'letter', sprite: { asset: 'epilogue-slips', width: 9, height: 7, z: 10 }, condition: pages, completed: flag('epilogue-filed'), interaction: { kind: 'minigame', gameId: 'epilogue-filing' } },
      { id: 'epilogue-ticket', condition: flag('epilogue-reviewed'), label: '车次单', x: 23, y: 72, icon: 'letter', sprite: { asset: 'epilogue-ticket', width: 8, height: 5, z: 10 }, interaction: { kind: 'dialogue', dialogueId: 'epilogue-departure' } },
    ] },
    { id: 'epilogue-gate', tint: 'dawn', decorations: [
      { id: 'epilogue-breakfast-grandma', asset: 'epilogue-grandma', x: 45, y: 98, width: 19, height: 61, z: 4, condition: flag('epilogue-breakfast') },
    ], title: '次晨 · 院门', time: '次晨 · 临出门前', asset: 'epilogue-gate-dawn', description: "巷子里已有早起的声音，院门开着，脚步走近又走远。你在门槛边停了一下，重新理好手里的东西，等奶奶把后面想起的那句话说完。",
    variants: [
      { condition: flag('epilogue-breakfast'), time: '次晨九点 · 留下吃早饭', description: '改到十一点十分的车还来得及。先坐回檐下，听锅盖响。' },
      { condition: flag('epilogue-call'), time: '次晨 · 赶八点二十的车', description: '车次单背面抄着“周日一点”。从门槛跨出去，奶奶在院里又问了一声。' },
      { condition: flag('epilogue-book'), time: '次晨 · 书先留在这里', description: '书留在檐下。小满已经走到门槛，奶奶递来落下的外套。' },
    ], links: [], hotspots: [
      {
  "id": "epilogue-morning",
  "label": "次晨这一幕",
  "x": 26,
  "y": 68.5,
  "icon": "look",
  "sprite": {
    "asset": "epilogue-book",
    "width": 11,
    "height": 7,
    "z": 6
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "epilogue-breakfast"
      },
      "asset": "epilogue-bowls",
      "x": 30,
      "y": 73,
      "width": 13,
      "height": 10
    },
    {
      "condition": {
        "kind": "flag",
        "id": "epilogue-call"
      },
      "asset": "epilogue-ticket",
      "x": 67,
      "y": 83,
      "width": 9,
      "height": 6
    },
    {
      "condition": {
        "kind": "flag",
        "id": "epilogue-book"
      },
      "asset": "epilogue-jacket",
      "x": 67,
      "y": 83,
      "width": 12,
      "height": 11
    }
  ],
  "interaction": {
    "kind": "inspect",
    "text": "你把昨晚带回来的书放平，收好纸笔，往已经打开的院门看去。昨夜讲过的几句话还记得，临出门，手里要拿的东西却得再理一遍。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "epilogue-breakfast"
        },
        "text": "九点，锅盖在厨房里轻轻响了两声。你已经穿好衣服，听见奶奶找碗，便过去扶住碗橱的门。她抬头看你，说上头那两只，早洗干净了，刚才伸手一摸，倒忘了自己收在更里面。\n\n你将碗拿出来，她跟在后头看你端稳，叫别一手还夹着书。书放回干处，包也先留在门边，十一点十分那班已经改好，这会儿两只手都能空出来，慢慢给桌上添一份早饭。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "epilogue-call"
        },
        "text": "你在门槛外换了换提包的手，奶奶跟到门内，忽然又问车次单是不是带着。你摸到胸口那一角，将纸抽出来给她看：正面八点二十，背面周日一点，都照昨晚写过的在。\n\n她凑近认了一眼，才点头。你沿原来的折痕收好，没跟包里那叠票据混放。院里的壶还在冒一点热气，她已经喝过水，手里拿着要回屋放的眼镜，没为送你一路攥着手机。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "epilogue-book"
        },
        "text": "你刚跨出门，奶奶就在后面叫了一声。外套还落在椅背，她提过来，先替你找准翻进去的袖口。你将包放下，接住另一边，没有像从前那样说一句自己来，就连衣服带手一起抽走。\n\n“你扶这边，我捋一下就好。”她说。你等着，看她把那一点褶顺平，再慢慢套到胳膊上。书已合在桌边，书签留着昨晚那页，笔也放在她一伸手就找得到的地方。"
      }
    ],
    "action": {
      "id": "epilogue-see-morning",
      "label": "看完次晨这一幕",
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "any",
            "conditions": [
              {
                "kind": "flag",
                "id": "epilogue-breakfast"
              },
              {
                "kind": "flag",
                "id": "epilogue-call"
              },
              {
                "kind": "flag",
                "id": "epilogue-book"
              }
            ]
          },
          {
            "kind": "flag",
            "id": "epilogue-night-finished"
          }
        ]
      },
      "effects": [
        {
          "kind": "flag",
          "id": "epilogue-morning-seen"
        }
      ]
    }
  }
},
    ] },
  ],
};

const tableExtras: DialogueSeed['choices'] = [
  { id: 'epilogue-open-stories', label: '坐一会儿，讲讲今天的事。', next: 'stories', effects: [] },
  { id: 'epilogue-check-recipes', label: '把新添的食谱念给你听。', next: 'recipes', effects: [] },
];
const tableNodes: DialogueSeed[] = [
  { id: 'table', speaker: '奶奶', choices: [{ id: 'epilogue-turn-pages', label: '先一页一页读给你听。', effects: [] }, ...tableExtras] },
  { id: 'filed', speaker: '奶奶', choices: [{ id: 'epilogue-reviewed', label: '去看车次单。', effects: [{ kind: 'flag', id: 'epilogue-reviewed' }] }, { id: 'epilogue-continue-book', label: '这本书以后怎样续记？', next: 'continuation', effects: [] }, ...tableExtras.map(c => ({ ...c, id: `${c.id}-filed` }))] },
  { id: 'continuation', speaker: '奶奶', choices: [{ id: 'epilogue-back-filed', label: '写日期。没说定的，就先夹着。', next: 'filed', effects: [] }] },
  { id: 'stories', speaker: '奶奶', choices: [
    { id: 'epilogue-tell-chen', label: '陈伯今天叫我包了一只肉的。', next: 'chen', condition: flag('morning-played'), effects: [] },
    { id: 'epilogue-tell-qin', label: '琴姐那儿，今天差点忙乱套。', next: 'qin', condition: flag('noon-played'), effects: [] },
    ...[['pickup', 'night-pickup'], ['cancelled', 'night-called-off'], ['missed', 'night-missed'], ['legacy', 'night-legacy']].map(([id, result]) => ({ id: `epilogue-tell-night-${id}`, label: '夜饭馆那盏灯，十一点就关。', next: `night-${id}`, condition: flag(result!), effects: [] })),
    { id: 'epilogue-tell-self', label: '先讲我自己吧。', next: 'self', effects: [] },
    { id: 'epilogue-tell-photo', label: '翻到旧合照，讲讲那只月亮包子。', next: 'photo', condition: all(clue('family-photo'), flag('morning-played')), effects: [] },
    { id: 'epilogue-stories-close', label: '今天先讲这些，剩下的改天。', effects: [] },
  ] },
  ...['chen', 'qin', 'night-pickup', 'night-cancelled', 'night-missed', 'night-legacy', 'self', 'photo'].map(id => ({ id, speaker: '奶奶', choices: [{ id: `epilogue-story-back-${id}`, label: '再讲点别的。', next: 'stories', effects: [{ kind: 'flag' as const, id: 'epilogue-story-told' }] }] })),
  { id: 'recipes', speaker: '奶奶', choices: [
    ...[['chen', 'morning-played', '陈家的包子。'], ['qin', 'noon-played', '琴记的汤面。'], ['night', 'night-played', '许叔的豆腐烧菜饭。']].map(([id, result, label]) => ({ id: `epilogue-read-recipe-${id}`, label: label!, next: `recipe-${id}`, condition: flag(result!), effects: [] })),
    { id: 'epilogue-recipes-close', label: '先把书页放平，歇一会儿。', effects: [] },
  ] },
  ...['chen', 'qin', 'night'].map(id => ({ id: `recipe-${id}`, speaker: '奶奶', choices: [{ id: `epilogue-recipe-back-${id}`, label: '翻翻别的食谱。', next: 'recipes', effects: [{ kind: 'flag' as const, id: 'epilogue-recipes-checked' }] }] })),
];
const departureNodes: DialogueSeed[] = [
  { id: 'ticket', speaker: '奶奶', choices: [{ id: 'epilogue-times', label: '记清车次和你的空当。', next: 'options', effects: [{ kind: 'flag', id: 'epilogue-ticket-read' }] }] },
  { id: 'options', speaker: '小满', choicesOnlyWhen: flag('epilogue-ticket-read'), choices: [
    { id: 'epilogue-ask-calendar', label: '日历上改过的日期，我那时没想这么多。', condition: clue('calendar'), next: 'calendar', effects: [] },
    { id: 'epilogue-ask-apron', label: '阿川说起回来帮忙的那天。', condition: clue('chuan-return'), next: 'apron', effects: [] },
    { id: 'epilogue-ask-both', label: '看见日历，又想起阿川那句回来帮忙。', condition: all(clue('calendar'), clue('chuan-return')), next: 'both', effects: [] },
    { id: 'epilogue-tell-riceball', label: '有一回我回你“快了”……', condition: clue('night-riceball'), next: 'riceball', effects: [{ kind: 'flag', id: 'epilogue-riceball-told' }] },
    ...['breakfast', 'call', 'book'].map(id => ({ id: `epilogue-confirm-${id}`, label: id === 'breakfast' ? '我改坐晚一班，九点跟你吃早饭。' : id === 'call' ? '我照原班走，周日午饭后给你打电话。' : '我照原班走。书先放你这儿，下次的事再说。', decision: 'epilogue', next: id, condition: ready, unavailable: '先翻齐三页、归好短札，再听奶奶说完。', effects: [{ kind: 'flag' as const, id: `epilogue-${id}` }] })),
    { id: 'epilogue-wait', label: '先回桌边看看，等会儿再定。', effects: [] },
  ] },
  ...['calendar', 'apron', 'both', 'riceball'].map(id => ({ id, speaker: '奶奶', choices: [{ id: `epilogue-back-${id}`, label: '把话说完，再看车次。', next: 'options', effects: [] }] })),
  ...['breakfast', 'call', 'book'].map(id => ({ id, speaker: '奶奶', choices: [{ id: `epilogue-finish-${id}`, label: '收好纸笔，等天亮。', effects: [{ kind: 'flag' as const, id: 'epilogue-night-finished' }] }] })),
];
// The returning topic menus are finite: each question consumes its original
// action key, and an interrupted answer resumes before the menu is shown again.
function boundedTopics(seeds: DialogueSeed[], menus: string[], targets?: string[]): NonNullable<Dialogue['entries']> {
  const entries: NonNullable<Dialogue['entries']> = [];
  for (const menu of seeds.filter(n=>menus.includes(n.id))) for (const choice of menu.choices) {
    if (!choice.next || choice.decision || targets && !targets.includes(choice.next)) continue;
    const target=seeds.find(n=>n.id===choice.next)!;
    const back=target.choices.find(c=>c.next===menu.id);
    if(!back)continue;
    const key=choice.onceKey??choice.id;
    choice.condition=all(...(choice.condition?[choice.condition]:[]),not({kind:'reward',id:key}));
    entries.push({condition:all({kind:'reward',id:key},not({kind:'reward',id:back.onceKey??back.id})),nodeId:target.id});
  }
  return entries;
}
const pendingTable=boundedTopics(tableNodes,['stories','recipes','filed'],['chen','qin','night-pickup','night-cancelled','night-missed','night-legacy','self','photo','recipe-chen','recipe-qin','recipe-night','continuation']);
const pendingDeparture=boundedTopics(departureNodes,['options'],['calendar','apron','both','riceball']);
const dialogue = (id: string, seeds: DialogueSeed[], entry: string, entries?: Dialogue['entries']): Dialogue => ({ id, entry, entries, nodes: seeds.map(seed => scriptNode({...seed,versions:epilogueStoryVersions[seed.id]}, epilogueScripts[seed.id])) });
export const epilogueDialogues: Dialogue[] = [
  dialogue('epilogue-home', [{ id: 'greeting', speaker: '奶奶', choices: [{ id: 'epilogue-sit', label: '饭吃了。我把书搬过去。', effects: [{ kind: 'flag', id: 'epilogue-greeted' }] }] }], 'greeting'),
  dialogue('epilogue-table-talk', tableNodes, 'table', [...pendingTable,{ condition: flag('epilogue-filed'), nodeId: 'filed' }]),
  dialogue('epilogue-departure', departureNodes, 'ticket', [...['breakfast', 'call', 'book'].map(id => ({ condition: flag(`epilogue-${id}`), nodeId: id })), ...pendingDeparture,{ condition: flag('epilogue-ticket-read'), nodeId: 'options' }]),
];
export const epilogueGame: MinigameDefinition = {
  id: 'epilogue-filing', chapterId: 'epilogue', module: 'filing', title: '把三张札放对地方', description: '先读札子正反面，再选去处。可以随时重选，也可以请奶奶一起读。', target: 100, condition: pages,
  reward: { id: 'epilogue-filed', label: '收好短札', effects: [{ kind: 'flag', id: 'epilogue-filed' }] },
  itinerary: { slots: [{ id: 'today', label: '写进今天', time: '问清的吃法' }, { id: 'pending', label: '先夹着，等回话', time: '尚未定下' }, { id: 'private', label: '收回信封', time: '当事人的私话' }], slips: [
    { id: 'half', title: '半份、不要葱', detail: '琴记，窗边那位要半份、不要葱。札角注明：今天当面问过。', slot: 'today' },
    { id: 'sunday', title: '周日午饭后打电话？', detail: '末尾留着问号。奶奶还没答应这张札上的约。', slot: 'pending' },
    { id: 'confidence', title: '折起的私札', detail: '只写当事人准许留在店记里的内容。', slot: 'private' },
  ] },
};
export const epilogueEndings: Ending[] = [
  {
  "id": "breakfast",
  "title": "锅盖响的时候",
  "condition": {
    "kind": "flag",
    "id": "epilogue-breakfast"
  },
  "asset": "epilogue-gate-dawn",
  "text": "奶奶舀好米酒，低头看你那只碗，又添了半勺。你伸手去接，她说先放桌上，捧着晃，待会儿又洒到袖口。\n\n你扶稳碗，替她将凳子让近一点，等她坐下才拿勺。桂花浮在面上，喝到嘴里还有一点米粒，桂花的香一点点散开。\n\n“昨天哪样最好吃？”她问。\n\n你想了一会儿，还没选出，她已经自己尝了一口，点点头，叫你先喝这个，锅里还有。你说她也别光顾着看你吃，她听着就笑，将自己的碗往身前收了收。\n\n十一点十分的票已经改好，包还放在门边。你没再将手机拿出来算剩多少工夫，先给她扶住桌上那一角，等两个人都端稳这碗热的。"
},
  {
  "id": "call",
  "title": "周日一点",
  "condition": {
    "kind": "flag",
    "id": "epilogue-call"
  },
  "asset": "epilogue-gate-dawn",
  "text": "奶奶送到院门边，又跟你对了一遍周日是不是一点。\n\n“一点。你要出门，就先跟我说，咱们换个时候也行。”\n\n“我记着呢。你自己也别忙起来不好意思改，提前留句话，我听得见。”\n\n你应了一声，将包提到顺手的那边。她看着你走过门口那几只花盆，才转身去放眼镜，没站在外头一直催你走快些。\n\n巷子里有人扫门前那一小块地，早起的声音一阵一阵过来。你走出一段，手揣进口袋，碰到折好的车次单，又顺着那道印按平。正面八点二十，背面周日一点，自己这边也带着，没有只留一个日子在她的墙上。"
},
  {
  "id": "book",
  "title": "今天这页",
  "condition": {
    "kind": "flag",
    "id": "epilogue-book"
  },
  "asset": "epilogue-gate-dawn",
  "text": "外套穿好，你重新提起包。奶奶回到桌边，掀开昨晚那一页一点，将尺子留在没写完的地方，说下回回来，就从这里找。\n\n你站在门口看她弄，想起自己刚才怕那句下次再说听着像敷衍，又把包先往脚边放了放。\n\n“做的时候哪句不明白，你就打给我，别等我先问。”你说。\n\n“那我可就找你了。”她抬头笑，“真有哪口做咸了，也得叫你听听。”\n\n你也笑，叫她旧字先别涂，回头拿自己试的跟她比。她把书放稳，笔搁在尺子旁，去收两只喝过水的杯子，没有往日历上添一个还没约定的日子。\n\n你走出院门，衣袖里那一点褶已经捋平。奶奶在身后问笔是不是搁在尺子旁，你还没拐过门口，又回头应了一声。她找着了，抬手叫你看脚下，你才重新把包提稳。"
},
  {
  "id": "unfinished",
  "title": "灯下的书",
  "asset": "epilogue-gate-dawn",
  "text": "书后面还空着几行，夹过纸的地方微微鼓起。奶奶将页角压平，笔搁到旁边，没有趁你收东西时，替那些没问清的话补一个后来。\n\n院门外有人经过，她抬头听了一下，又把杯子挪远，给你留出放手的地方。你坐着，等她重新翻到自己还认得的那一页，慢慢接着讲。"
},
];
